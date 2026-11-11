(() => {
  const f = document.getElementById('f'), t0 = Date.now();
  const $ = (id) => document.getElementById(id);
  const toggle = (box, wrap) => box.addEventListener('change', () => { $(wrap).hidden = !box.checked; });
  toggle($('bt-other'), 'other-wrap'); toggle($('voice_call_opt_in'), 'voice-wrap');
  const MAX = 1024 * 1024;
  const readFile = (file) => new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok({ name: file.name, type: file.type, data: String(r.result).split(',')[1] }); r.onerror = no; r.readAsDataURL(file); });
  const clear = () => { f.querySelectorAll('.err').forEach((e) => (e.textContent = '')); f.querySelectorAll('[aria-invalid]').forEach((e) => e.removeAttribute('aria-invalid')); $('summary').hidden = true; };
  const show = (errs) => {
    const keys = Object.keys(errs); if (!keys.length) return false;
    keys.forEach((k) => { const e = $(k + '-err'); if (e) e.textContent = errs[k]; const el = $(k); if (el) { el.setAttribute('aria-invalid', 'true'); if (e) el.setAttribute('aria-describedby', ((el.getAttribute('aria-describedby') || '') + ' ' + k + '-err').trim()); } });
    const s = $('summary'); s.innerHTML = '<strong>Please fix ' + keys.length + ' issue(s):</strong><ul>' + keys.map((k) => '<li><a href="#' + k + '">' + errs[k] + '</a></li>').join('') + '</ul>';
    s.hidden = false; s.focus(); return true;
  };
  f.addEventListener('submit', async (ev) => {
    ev.preventDefault(); clear();
    const fd = new FormData(f), v = (k) => (fd.get(k) || '').toString().trim();
    const d = { name: v('name'), company: v('company'), email: v('email'), phone: v('phone'), country: v('country'), goals: v('goals'),
      build_types: fd.getAll('build_types'), build_other: v('build_other'), requirements: v('requirements'), timeline: v('timeline'), budget: v('budget'),
      tier: v('tier'), payment_method: v('payment_method'), reference_links: v('reference_links'), voice_call_opt_in: $('voice_call_opt_in').checked,
      voice_call_time: v('voice_call_time'), popia_consent: $('popia_consent').checked, marketing_opt_in: $('marketing_opt_in').checked,
      website_url_hp: v('website_url_hp'), elapsed_ms: Date.now() - t0, files: [] };
    const e = {};
    if (d.name.length < 2) e.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) e.email = 'Please enter a valid email.';
    if (!/^\+?[0-9 ()-]{7,20}$/.test(d.phone)) e.phone = 'Please enter a valid phone / WhatsApp number.';
    if (d.goals.length < 5) e.goals = 'Tell us a little about your goals.';
    if (!d.build_types.length) e.build_types = 'Choose at least one option.';
    if (d.build_types.includes('other') && !d.build_other) e.build_other = 'Please describe "other".';
    if (!d.timeline) e.timeline = 'Choose a timeline.';
    if (!d.budget) e.budget = 'Choose a budget range.';
    if (!d.tier) e.tier = 'Choose a tier or custom.';
    if (!d.payment_method) e.payment_method = 'Choose a preferred payment method.';
    if (!d.popia_consent) e.popia_consent = 'POPIA consent is required to process your request.';
    const files = [...$('files').files];
    if (files.length > 3) e.files = 'Max 3 files.'; else if (files.some((x) => x.size > MAX)) e.files = 'Each file must be 1 MB or less.';
    if (show(e)) return;
    const btn = $('submit'); btn.disabled = true; btn.textContent = 'Sending…';
    try {
      d.files = await Promise.all(files.map(readFile));
      const r = await fetch('/api/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) { f.hidden = true; $('ref').textContent = j.id || '—'; $('done').hidden = false; $('done').focus(); parent !== window && parent.postMessage({ type: 'hermes-intake-submitted', id: j.id }, '*'); }
      else if (j.errors) show(j.errors); else show({ submit: j.error || 'Something went wrong. Please try again.' });
    } catch { show({ submit: 'Network error. Please try again.' }); }
    finally { btn.disabled = false; btn.textContent = 'Submit request'; }
  });
})();
