import { put, list as blobList, del, get } from '@vercel/blob';
import crypto from 'node:crypto';

// Hermes voice intake: called by the ElevenLabs "Hermes" agent server tool.
const CONSENT_VERSION = 'popia-v0.1-draft-2026-10-28';
const BUILD = ['website', 'whatsapp_bot', 'agents', 'other'];
const TIERS = ['starter', 'company', 'agentic_rise', 'custom', 'unsure'];
const TIMELINE = ['asap', '1_month', '1_3_months', '3_plus_months', 'flexible'];
const BUDGET = ['under_1500', '1500_3000', '3000_5000', '5000_15000', '15000_plus', 'unsure'];
const PRICES = { starter: 'R1,500', company: 'R2,800', agentic_rise: 'R4,500' };

const str = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : (typeof v === 'number' ? String(v) : ''));
// PRD HRM-1.8: never keep card numbers, passwords or API keys
const scrub = (s) => s
  .replace(/\b(?:\d[ -]?){13,19}\b/g, '[removed-number]')
  .replace(/\b(sk|pk|xi|api|key|token)[-_][A-Za-z0-9_\-]{12,}\b/gi, '[removed-secret]')
  .replace(/(password|passcode|pin|cvv)\s*(is|:|=)?\s*\S+/gi, '$1 [removed]');
const pick = (v, list) => { const x = str(v, 40).toLowerCase().replace(/[\s-]+/g, '_'); return list.includes(x) ? x : ''; };
const list = (v) => (Array.isArray(v) ? v : str(v, 300).split(/[,;]+/)).map((x) => str(x, 40).toLowerCase().replace(/[\s-]+/g, '_')).filter(Boolean);
const bool = (v) => v === true || /^(true|yes|y|1)$/i.test(str(v, 5));

function safeEqual(a, b) {
  const x = Buffer.from(String(a || '')), y = Buffer.from(String(b || ''));
  return x.length === y.length && x.length > 0 && crypto.timingSafeEqual(x, y);
}

function prd(r) {
  const L = (k, v) => `- **${k}:** ${v || '_not captured_'}`;
  return [`# Customer PRD (draft) — ${r.company || r.name}`, '', `Ref: ${r.id} · Captured by Hermes voice intake · ${r.received_at}`, '',
    '## Contact', L('Name', r.name), L('Business', r.company), L('Decision-maker', r.decision_maker), L('Email', r.email), L('Phone', r.phone), L('Country', r.country), '',
    '## Goals', r.goals || '_not captured_', '', '## Problem', r.problem || '_not captured_', '',
    '## Requested features', r.requirements || '_not captured_', '', L('Build types', r.build_types.join(', ')), L('Channels', r.channels.join(', ')), '',
    '## Commercials (draft, ex-VAT)', L('Tier of interest', r.tier ? `${r.tier}${PRICES[r.tier] ? ` (${PRICES[r.tier]} draft)` : ''}` : ''), L('Budget', r.budget), L('Timeline', r.timeline),
    '- No payment taken. Pricing is draft and subject to owner approval.', '',
    '## Handoff', L('Human handoff requested', r.human_handoff ? 'Yes' : 'No'), '',
    '## Open questions', '- Confirm scope, integrations and success metrics on a human call.', ''].join('\n');
}

export default async function handler(req, res) {
  if (!['POST', 'GET', 'DELETE'].includes(req.method)) return res.status(405).json({ ok: false, error: 'Method not allowed' });
  const secret = process.env.HERMES_VOICE_SECRET;
  if (!secret || !safeEqual(req.headers['x-hermes-secret'], secret)) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  // Owner test helpers (secret-gated): GET ?id= checks a record exists; DELETE ?id= removes TEST records only.
  if (req.method !== 'POST') {
    const id = str(req.query?.id, 40);
    if (!/^[\w-]{8,40}$/.test(id)) return res.status(400).json({ ok: false, error: 'Bad id' });
    const { blobs } = await blobList({ prefix: `submissions/${id}/` });
    if (req.method === 'GET') return res.status(200).json({ ok: true, id, files: blobs.map((x) => x.pathname) });
    const rec = blobs.find((x) => x.pathname.endsWith('submission.json'));
    if (!rec) return res.status(404).json({ ok: false, error: 'Not found' });
    const g = await get(rec.pathname, { access: 'private' });
    const body = JSON.parse(await new Response(g.stream).text());
    if (!/^ZZTEST/.test(body.name || '')) return res.status(403).json({ ok: false, error: 'Only test records can be deleted' });
    await del(blobs.map((x) => x.url));
    return res.status(200).json({ ok: true, deleted: blobs.length });
  }

  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { return res.status(400).json({ ok: false, error: 'Invalid JSON' }); } }
  if (!b || typeof b !== 'object') return res.status(400).json({ ok: false, error: 'Invalid body' });
  if (!bool(b.popia_consent)) return res.status(422).json({ ok: false, error: 'POPIA consent is required before storing details.' });

  const id = `${new Date().toISOString().slice(0, 10)}-v${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();
  const r = {
    id, received_at: now, source: 'hermes-voice-agent', status: 'new',
    name: scrub(str(b.name, 120)), company: scrub(str(b.business ?? b.company, 160)), email: str(b.email, 200).toLowerCase(),
    phone: scrub(str(b.phone, 30)).includes('[removed') ? '' : str(b.phone, 30), country: str(b.country, 80) || 'South Africa',
    goals: scrub(str(b.goals, 3000)), problem: scrub(str(b.problem, 3000)),
    build_types: list(b.build_types).filter((x) => BUILD.includes(x)), channels: list(b.channels).slice(0, 10),
    requirements: scrub(str(b.features ?? b.requirements, 6000)),
    timeline: pick(b.timeline, TIMELINE), timeline_text: scrub(str(b.timeline, 200)),
    budget: pick(b.budget, BUDGET), budget_text: scrub(str(b.budget, 200)), tier: pick(b.tier, TIERS),
    decision_maker: scrub(str(b.decision_maker, 200)), human_handoff: bool(b.human_handoff),
    payment_method: '', popia_consent: true, recording_consent: bool(b.recording_consent), marketing_opt_in: false,
    consent: { popia: true, recording: bool(b.recording_consent), version: CONSENT_VERSION, channel: 'voice_agent', timestamp: now },
    conversation_id: str(b.conversation_id, 120),
    payment_note: 'No payment taken. Payment link to follow after owner review/approval.',
  };
  const transcript = r.recording_consent ? scrub(str(b.transcript ?? b.summary, 20000)) : '';
  const doc = prd(r);
  if (!process.env.BLOB_READ_WRITE_TOKEN) return res.status(500).json({ ok: false, error: 'Storage not configured' });
  try {
    const o = { access: 'private', addRandomSuffix: false };
    await put(`submissions/${id}/submission.json`, JSON.stringify(r, null, 2), { ...o, contentType: 'application/json' });
    if (transcript) await put(`submissions/${id}/transcript.txt`, transcript, { ...o, contentType: 'text/plain' });
    await put(`submissions/${id}/prd.md`, doc, { ...o, contentType: 'text/markdown' });
    console.log('HERMES_VOICE stored', id);
    return res.status(200).json({ ok: true, id });
  } catch (e) {
    console.error('HERMES_VOICE store failed', id, e?.message);
    return res.status(500).json({ ok: false, error: 'Could not save' });
  }
}
