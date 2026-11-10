import { put } from '@vercel/blob';
import crypto from 'node:crypto';

const CONSENT_VERSION = 'popia-v0.1-draft-2026-10-28';
const BUILD = ['website', 'whatsapp_bot', 'agents', 'other'];
const TIERS = ['starter', 'company', 'agentic_rise', 'custom', 'unsure'];
const PAY = ['card', 'instant_eft', 'eft', 'debit_order', 'unsure'];
const TIMELINE = ['asap', '1_month', '1_3_months', '3_plus_months', 'flexible'];
const BUDGET = ['under_1500', '1500_3000', '3000_5000', '5000_15000', '15000_plus', 'unsure'];
const MAX_FILES = 3, MAX_FILE_BYTES = 1024 * 1024;
const ALLOWED_MIME = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

const str = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
// Strip anything that looks like a card number (PRD HRM-1.8: never accept card details)
const scrub = (s) => s.replace(/\b(?:\d[ -]?){13,19}\b/g, '[removed-number]');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { return res.status(400).json({ ok: false, error: 'Invalid JSON' }); } }
  if (!b || typeof b !== 'object') return res.status(400).json({ ok: false, error: 'Invalid body' });

  // Honeypot + timing: silently accept bots without storing
  if (str(b.website_url_hp) || (Number(b.elapsed_ms) > 0 && Number(b.elapsed_ms) < 3000)) return res.status(200).json({ ok: true });

  const errors = {};
  const d = {
    name: str(b.name, 120), company: str(b.company, 160), email: str(b.email, 200).toLowerCase(),
    phone: str(b.phone, 30), country: str(b.country, 80), goals: scrub(str(b.goals, 3000)),
    build_types: Array.isArray(b.build_types) ? b.build_types.filter((x) => BUILD.includes(x)) : [],
    build_other: scrub(str(b.build_other, 300)), requirements: scrub(str(b.requirements, 6000)),
    timeline: TIMELINE.includes(b.timeline) ? b.timeline : '', budget: BUDGET.includes(b.budget) ? b.budget : '',
    tier: TIERS.includes(b.tier) ? b.tier : '', payment_method: PAY.includes(b.payment_method) ? b.payment_method : '',
    reference_links: str(b.reference_links, 2000).split(/\s+/).filter((u) => /^https?:\/\/\S+$/i.test(u)).slice(0, 10),
    voice_call_opt_in: b.voice_call_opt_in === true, voice_call_time: str(b.voice_call_time, 200),
    popia_consent: b.popia_consent === true, marketing_opt_in: b.marketing_opt_in === true,
  };
  if (d.name.length < 2) errors.name = 'Please enter your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) errors.email = 'Please enter a valid email.';
  if (!/^\+?[0-9 ()-]{7,20}$/.test(d.phone)) errors.phone = 'Please enter a valid phone / WhatsApp number.';
  if (!d.country) errors.country = 'Please choose your country.';
  if (d.goals.length < 5) errors.goals = 'Tell us a little about your goals.';
  if (!d.build_types.length) errors.build_types = 'Choose at least one option.';
  if (d.build_types.includes('other') && !d.build_other) errors.build_other = 'Please describe "other".';
  if (!d.timeline) errors.timeline = 'Choose a timeline.';
  if (!d.budget) errors.budget = 'Choose a budget range.';
  if (!d.tier) errors.tier = 'Choose a tier or custom.';
  if (!d.payment_method) errors.payment_method = 'Choose a preferred payment method.';
  if (!d.popia_consent) errors.popia_consent = 'POPIA consent is required to process your request.';

  const files = Array.isArray(b.files) ? b.files.slice(0, MAX_FILES + 1) : [];
  if (files.length > MAX_FILES) errors.files = `Max ${MAX_FILES} files.`;
  const decoded = [];
  for (const f of files.slice(0, MAX_FILES)) {
    const type = str(f?.type, 120); const buf = Buffer.from(str(f?.data, 2_000_000), 'base64');
    if (!ALLOWED_MIME.includes(type)) { errors.files = 'Unsupported file type.'; break; }
    if (!buf.length || buf.length > MAX_FILE_BYTES) { errors.files = 'Each file must be 1 MB or less.'; break; }
    decoded.push({ name: str(f.name, 120).replace(/[^\w.\-]+/g, '_') || 'file', type, buf });
  }
  if (Object.keys(errors).length) return res.status(422).json({ ok: false, errors });

  const id = `${new Date().toISOString().slice(0, 10)}-${crypto.randomUUID().slice(0, 8)}`;
  const record = {
    id, received_at: new Date().toISOString(), source: 'hermes-web-form', status: 'new',
    ...d,
    consent: { popia: d.popia_consent, marketing: d.marketing_opt_in, version: CONSENT_VERSION,
      channel: 'web_form', timestamp: new Date().toISOString() },
    payment_note: 'No payment taken. Payment link to follow after owner review/approval.',
    attachments: [], meta: { user_agent: str(req.headers['user-agent'], 300), referer: str(req.headers.referer, 300) },
  };

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.log('HERMES_SUBMISSION (no blob token)', JSON.stringify(record));
    return res.status(200).json({ ok: true, id, stored: 'log' });
  }
  try {
    for (const f of decoded) {
      const r = await put(`submissions/${id}/files/${f.name}`, f.buf, { access: 'private', contentType: f.type, addRandomSuffix: true });
      record.attachments.push({ name: f.name, type: f.type, size: f.buf.length, pathname: r.pathname });
    }
    await put(`submissions/${id}/submission.json`, JSON.stringify(record, null, 2),
      { access: 'private', contentType: 'application/json', addRandomSuffix: false });
    console.log('HERMES_SUBMISSION stored', id);
    return res.status(200).json({ ok: true, id });
  } catch (e) {
    console.error('HERMES_SUBMISSION store failed', id, e?.message);
    return res.status(500).json({ ok: false, error: 'Could not save your submission. Please try again.' });
  }
}
