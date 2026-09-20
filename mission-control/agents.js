"use strict";
const roster = [
 ["hermes","Hermes / Homie's Agent","Confirm intended product, runtime and operator"],
 ["openclaw","OpenClaw / OpenCL MCP Bridge + CLI","Confirm bridge package and authenticated MCP or CLI setup"],
 ["ollam","Ollam / Ollama","Confirm agent identity; local model runtime is separate from WhatsApp contact"],
 ["base44","Base44 / Katjana","Select app and validate supported task endpoint"],
 ["google","Google","Select Drive, Calendar and other required OAuth scopes"],
 ["hyper","Hyper Agent","Product URL, operator and supported interface needed"],
 ["notion","Notion","Agent interaction capability and project access required"],
 ["facebook24","Facebook 24","Clarify whether this means Facebook/Meta, Base44 or another product"],
 ["chatgpt","ChatGPT / Codex","Choose authenticated tool/API workflow; subscription is not an API credential"]
];
const key="studex.operator.tasks.v1";
let tasks=[];
const notice=document.getElementById("notice");
try { const data=JSON.parse(localStorage.getItem(key)||"[]"); if(!Array.isArray(data)) throw Error(); tasks=data.filter(x=>x&&typeof x.id==="string"&&roster.some(a=>a[0]===x.agent)&&typeof x.task==="string"&&typeof x.deliverable==="string"); } catch {notice.textContent="Saved queue could not be loaded. Existing storage has not been overwritten.";}
function save(){try{localStorage.setItem(key,JSON.stringify(tasks));notice.textContent="Saved on this browser only. No dispatch performed.";}catch{notice.textContent="Storage unavailable: export the queue to preserve your work.";}}
function draw(){const list=document.getElementById("tasks");list.replaceChildren();for(const t of tasks){const li=document.createElement("li");li.textContent=`${t.task} — ${t.agent} — ${t.status||"queued_local"}. Deliverable: ${t.deliverable}`;list.append(li);}}
for(const [id,name,blocker] of roster){const card=document.createElement("article");const h=document.createElement("h2");h.textContent=name;const s=document.createElement("p");s.textContent="Not connected";const b=document.createElement("small");b.textContent=blocker;card.append(h,s,b);document.getElementById("agents").append(card);const option=document.createElement("option");option.value=id;option.textContent=name;document.getElementById("agent").append(option);}
document.getElementById("taskform").addEventListener("submit",e=>{e.preventDefault();const task=document.getElementById("task").value.trim(),deliverable=document.getElementById("deliverable").value.trim();if(!task||!deliverable)return;tasks.push({id:typeof crypto.randomUUID==="function"?crypto.randomUUID():Date.now()+"-"+Math.random().toString(16).slice(2),agent:document.getElementById("agent").value,task,deliverable,status:"queued_local",created_at:new Date().toISOString()});save();draw();e.target.reset();});
document.getElementById("export").addEventListener("click",()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({schema_version:1,tasks},null,2)],{type:"application/json"}));const a=document.createElement("a");a.href=url;a.download="studex-operator-tasks.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});draw();
