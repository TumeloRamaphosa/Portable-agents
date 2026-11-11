#!/usr/bin/env python3
"""Create the Hermes webhook tool + NEW Hermes agent. Prints only IDs.
Usage: ELEVENLABS_API_KEY=... HERMES_VOICE_SECRET=... python3 scripts/setup-elevenlabs.py  (key needs convai_read + convai_write)"""
import json, os, re, sys, urllib.request
K = os.environ['ELEVENLABS_API_KEY']; SECRET = os.environ['HERMES_VOICE_SECRET']
def call(m, path, body=None):
    r = urllib.request.Request('https://api.elevenlabs.io' + path, method=m, data=json.dumps(body).encode() if body else None,
                               headers={'xi-api-key': K, 'content-type': 'application/json'})
    try: return json.load(urllib.request.urlopen(r))
    except urllib.error.HTTPError as e: sys.exit(f'{m} {path} -> {e.code}: {e.read().decode()[:800]}')
S = lambda d: {'type': 'string', 'description': d}
props = {'name': S('Customer full name'), 'business': S('Business / company name'), 'email': S('Email if given'),
  'phone': S('Phone/WhatsApp if given'), 'country': S('Country, default South Africa'), 'goals': S('Business goals'),
  'problem': S('Problem to solve'), 'features': S('Requested features, read back and confirmed'),
  'channels': S('Comma-separated channels e.g. website, whatsapp, voice, email'),
  'build_types': S('Comma-separated from: website, whatsapp_bot, agents, other'),
  'budget': S('One of under_1500,1500_3000,3000_5000,5000_15000,15000_plus,unsure'),
  'timeline': S('One of asap,1_month,1_3_months,3_plus_months,flexible'),
  'tier': S('One of starter,company,agentic_rise,custom,unsure'), 'decision_maker': S('Who makes the final decision'),
  'human_handoff': {'type': 'boolean', 'description': 'True if the customer wants a human to follow up'},
  'popia_consent': {'type': 'boolean', 'description': 'True ONLY if the customer explicitly gave POPIA consent'},
  'recording_consent': {'type': 'boolean', 'description': 'True ONLY if the customer explicitly agreed to recording/transcript storage'},
  'transcript': S('Concise transcript summary of the call; omit any card numbers, passwords or keys'),
  'conversation_id': {'type': 'string', 'dynamic_variable': 'system__conversation_id'}}
tool = call('POST', '/v1/convai/tools', {'tool_config': {'type': 'webhook', 'name': 'save_hermes_intake',
  'description': 'Save the confirmed project intake once POPIA consent is given and details have been read back and confirmed.',
  'response_timeout_secs': 20, 'api_schema': {'url': 'https://hermes-intake.vercel.app/api/voice-intake', 'method': 'POST',
  'request_headers': {'x-hermes-secret': SECRET},
  'request_body_schema': {'type': 'object', 'description': 'Hermes intake record', 'required': ['name', 'popia_consent', 'recording_consent'], 'properties': props}}}})
PROMPT = """You are Hermes, the AI project-intake assistant for StudEx (South Africa). Speak clear, friendly South African English, one question at a time.
Order: (1) you have already disclosed you are an AI and asked POPIA consent; do not collect any personal details until the caller says yes. If they decline, offer the typed form and end politely. (2) Ask separately whether the call may be recorded/transcribed; respect a no.
Collect: name, business, goals, the problem, desired features, channels (website, WhatsApp, voice, email...), budget range, timeline, and who the decision-maker is. Ask short clarifying questions where answers are vague. Before saving, read the key answers back and get confirmation, then call save_hermes_intake once.
Pricing is DRAFT and excludes VAT: Starter R1,500, Company R2,800, Agentic Rise R4,500; final quotes need owner approval. Never take a payment.
Never accept passwords, card numbers, bank details or API keys; if offered, stop them and say we never need them.
Always offer a human handoff: a person from the team will follow up; set human_handoff true if they want it. Keep the call under 10 minutes."""
FIRST = ("Hi, I'm Hermes, an AI assistant for StudEx, not a human. Before we start: under POPIA, may I collect and process your details "
         "to prepare your project proposal? Please say yes or no.")
agent = call('POST', '/v1/convai/agents/create', {'name': 'Hermes', 'conversation_config': {
  'agent': {'first_message': FIRST, 'language': 'en', 'prompt': {'prompt': PROMPT, 'llm': 'gemini-2.5-flash', 'tool_ids': [tool['id']]}},
  'tts': {'voice_id': 'wjA7st3xxR3DXtlQ5aav', 'model_id': 'eleven_flash_v2'},
  'conversation': {'max_duration_seconds': 600}},
  'platform_settings': {'auth': {'enable_auth': False, 'allowlist': [{'hostname': 'hermes-intake.vercel.app'}]}},
  'tags': ['hermes', 'en-ZA']})
p = os.path.join(os.path.dirname(__file__), '..', 'public', 'index.html'); s = open(p).read()
open(p, 'w').write(re.sub(r'var ID="[^"]*"', f'var ID="{agent["agent_id"]}"', s, 1))
print(json.dumps({'tool_id': tool['id'], 'agent_id': agent['agent_id']}))
