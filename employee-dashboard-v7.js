/* QDC Employee Dashboard v7 — approved institutional green/cream look.
   Presentation-only upgrade: preserve auth, data, photo, draft, verification and notifications. */
(function(){
"use strict";
const q=(selector,scope=document)=>scope.querySelector(selector);
const qa=(selector,scope=document)=>Array.from(scope.querySelectorAll(selector));
const el=(tag,cls,content)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(content!==undefined)node.textContent=content;return node;};
const profileScreen=()=>{const root=q("#screen-record");return root&&!root.classList.contains("hidden")&&!root.classList.contains("hm-tab-dashboard")};
const editor=()=>{try{return typeof INLINE_EDIT_MODE!=="undefined"&&INLINE_EDIT_MODE;}catch(e){return false}};
const employee=()=>{try{return typeof CUR!=="undefined"?CUR:null;}catch(e){return null}};
const fromAdmin=()=>{try{return !!CUR_FROMDASH||!!ADMIN_EDIT_MODE}catch(e){return false}};
let open=false, targetField=null, focusFrom=null;
const fieldText=(field)=>field?.querySelector(".k")?.textContent?.trim()||field?.dataset.field||"your profile";
const tips=(field)=>{
 const name=String(field||"").toLowerCase();
 if(/cnic/.test(name))return "Enter the CNIC exactly as on your original CNIC card. Check every digit before submission.";
 if(/pid|personal no/.test(name))return "Use the Personal ID (PID) shown on your official salary slip or service record.";
 if(/dob|birth|date|join|regular|entry/.test(name))return "Confirm the date against your official documents and enter it in DD-MM-YYYY format where required.";
 if(/mobile|contact|phone/.test(name))return "Provide a reachable mobile number; carefully verify all digits.";
 if(/school|posting|semis|cell/.test(name))return "Confirm the current school, posting and SEMIS details with your official posting order.";
 if(/designation|bps|grade|scale/.test(name))return "Match designation, pay scale and grade to your official service record.";
 if(/qualification|degree/.test(name))return "Use the exact qualification awarded on your certificate.";
 if(/name|father/.test(name))return "Use the spelling recorded in your CNIC and official service documents.";
 return "Check this field against your official service record before saving or submitting changes.";
};
function fields(){
 return qa("#r-fields .field").filter(x=>x.querySelector(".k")&&!x.closest(".qdc-editor-banner"));
}
function isEmpty(v){
 const s=String(v??"").replace(/\u00a0/g," ").trim();
 return !s||/^[—–-]+$/.test(s)||/^(not recorded|not assigned|missing|n\/a|select|select an option)$/i.test(s);
}
function summarize(){
 const list=fields();let completed=0;
 const missing=[];
 for(const field of list){
  const key=field.querySelector("[data-field]")?.dataset.field||"";
  const control=field.querySelector("input:not([type=checkbox]), select,textarea");
  const visual=field.querySelector(".v");
  const text=control?control.value:visual?.classList.contains("blank")?"":visual?.textContent||"";
  if(!isEmpty(text))completed++;
  else missing.push({field,key,name:fieldText(field)});
 }
 const pct=list.length?Math.round(completed/list.length*100):0;
 return {total:list.length,completed,missing,pct};
}
function statusText(){
 const status=q("#r-status")?.textContent?.trim()||"Review Required";
 return status.replace(/\s+/g," ").slice(0,100);
}
function buildDashboard(){
 const main=q("#screen-record .recmain"), fieldsEl=q("#r-fields");if(!main||!fieldsEl||q("#qdc7-overview"))return;
 const overview=el("section","qdc7-overview");overview.id="qdc7-overview";overview.setAttribute("aria-label","Employee profile overview");
 overview.innerHTML=
  '<div class="qdc7-overview-head"><div class="qdc7-overview-icon" aria-hidden="true">▦</div>'+
   '<div class="qdc7-overview-copy"><small>EMPLOYEE SELF-SERVICE WORKSPACE</small><h2>My Employee Profile</h2><p>Review your information, keep records complete and send corrections for office approval.</p></div>'+
   '<span class="qdc7-overview-status" id="qdc7-overview-status">PROFILE</span></div>'+
  '<div class="qdc7-overview-kpis">'+
   '<article class="qdc7-overview-kpi"><span class="qdc7-kpi-icon">◉</span><div><small>PROFILE COMPLETION</small><strong id="qdc7-pct">—</strong><span id="qdc7-completed">Checking fields…</span></div></article>'+
   '<article class="qdc7-overview-kpi"><span class="qdc7-kpi-icon">✓</span><div><small>FIELDS REVIEWED</small><strong id="qdc7-reviewed">—</strong><span>Filled fields in the current profile</span></div></article>'+
   '<article class="qdc7-overview-kpi"><span class="qdc7-kpi-icon">▤</span><div><small>FIELDS TO COMPLETE</small><strong id="qdc7-missing">—</strong><span>Use the Guidelines assistant</span></div></article></div>'+
  '<div class="qdc7-overview-actions"><button type="button" id="qdc7-edit" class="qdc7-action qdc7-action-primary"><span>✎</span> Edit / Update Profile <b>→</b></button>'+
   '<button type="button" id="qdc7-help" class="qdc7-action qdc7-action-secondary"><span>ⓘ</span> Live Guidelines</button>'+
   '<button type="button" id="qdc7-print" class="qdc7-action qdc7-action-light"><span>▤</span> Print / Save PDF</button></div>';
 main.insertBefore(overview,fieldsEl);
 q("#qdc7-edit").addEventListener("click",()=>{
  const existing=q("#btn-inline-edit");
  if(existing&&!existing.classList.contains("hidden")&&!fromAdmin()){existing.click();return;}
  if(editor()){q("#r-fields [data-field]")?.focus();q("#r-fields")?.scrollIntoView({behavior:"smooth",block:"start"});}
 });
 q("#qdc7-help").addEventListener("click",()=>setOpen(true));
 q("#qdc7-print").addEventListener("click",()=>q("#btn-print")?.click());
}
function buildGuide(){
 if(q("#qdc7-guide-dock"))return;
 const dock=el("div","qdc7-guide-dock");dock.id="qdc7-guide-dock";
 const button=el("button","qdc7-guide-trigger");
 button.id="qdc7-guide-trigger";button.type="button";
 button.setAttribute("aria-expanded","false");button.setAttribute("aria-controls","qdc7-guide-panel");
 button.setAttribute("aria-label","Open employee live guidelines");
 button.innerHTML='<span class="qdc7-guide-bulb" aria-hidden="true">?</span><span>Live Guidelines</span><span class="qdc7-guide-chevron" aria-hidden="true">⌃</span>';
 const panel=el("aside","qdc7-guide-panel");panel.id="qdc7-guide-panel";
 panel.setAttribute("role","dialog");panel.setAttribute("aria-label","Employee profile live guidelines");
 panel.setAttribute("aria-hidden","true");
 panel.innerHTML=
 '<div class="qdc7-guide-head"><div><small>GBHS QAMARDIN CHANDIO</small><h3>Employee Live Guidelines</h3><p>Simple guidance for your official record.</p></div><button type="button" id="qdc7-guide-close" aria-label="Close guidelines">×</button></div>'+
 '<div class="qdc7-guide-progress"><div><b>Profile completeness</b><strong id="qdc7-guide-pct">0%</strong></div><div class="qdc7-guide-meter"><span id="qdc7-guide-fill"></span></div><small id="qdc7-guide-count">Reviewing profile fields…</small></div>'+
 '<div class="qdc7-guide-current"><span class="qdc7-guide-current-icon">i</span><div><small>FIELD ASSISTANT · UPDATES AS YOU WORK</small><strong id="qdc7-tip-label">Start reviewing your profile</strong><p id="qdc7-tip-detail">Choose a profile field to get a simple explanation of what to enter.</p></div></div>'+
 '<div class="qdc7-guide-steps"><div class="qdc7-guide-step active" data-stage="1"><i>1</i><div><b>Review Details</b><span>Check personal and service records.</span></div></div>'+
 '<div class="qdc7-guide-step" data-stage="2"><i>2</i><div><b>Update Information</b><span>Make corrections using Edit / Update.</span></div></div>'+
 '<div class="qdc7-guide-step" data-stage="3"><i>3</i><div><b>Save & Submit</b><span>Save draft and submit for office review.</span></div></div>'+
 '<div class="qdc7-guide-step" data-stage="4"><i>4</i><div><b>Office Verification</b><span>Wait for the final approval of your submission.</span></div></div></div>'+
 '<div class="qdc7-guide-actions"><button type="button" id="qdc7-guide-missing">Find Missing Fields</button><button type="button" id="qdc7-guide-edit">Edit Profile →</button></div>'+
 '<p class="qdc7-guide-footer">Your changes are not submitted automatically. Save your draft, then confirm your submission when ready.</p>';
 dock.append(panel,button);document.body.append(dock);
 button.addEventListener("click",ev=>{ev.stopPropagation();setOpen(!open);});
 q("#qdc7-guide-close",dock).addEventListener("click",()=>setOpen(false,true));
 q("#qdc7-guide-missing",dock).addEventListener("click",()=>{
  const first=summarize().missing[0];
  if(!first){showTip("All visible fields are filled","Review the information for accuracy before submitting.");return;}
  focusField(first.field,first.name);
 });
 q("#qdc7-guide-edit",dock).addEventListener("click",()=>{
  const native=q("#btn-inline-edit");
  if(native&&!native.classList.contains("hidden")&&!fromAdmin()){setOpen(false);native.click();}
  else if(editor()){setOpen(false);q("#r-fields")?.scrollIntoView({behavior:"smooth",block:"start"});}
  else showTip("Editing not available","This profile may already have a pending correction, or it may be opened by an administrator.");
 });
 qa(".qdc7-guide-step",dock).forEach(step=>{step.setAttribute("role","button");step.setAttribute("tabindex","0");step.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();step.click();}});step.addEventListener("click",()=>{
  if(!profileScreen())return;
  const n=Number(step.dataset.stage);
  qa(".qdc7-guide-step",dock).forEach(x=>x.classList.toggle("active",x===step));
  if(n===1){setOpen(false);q("#qdc7-overview")?.scrollIntoView({behavior:"smooth",block:"start"});}
  if(n===2){q("#qdc7-guide-edit")?.click();}
  if(n===3){setOpen(false);(editor()?q("#inline-edit-bar"):q("#qdc7-overview"))?.scrollIntoView({behavior:"smooth",block:"center"});}
  if(n===4){showTip("Final verification","Your changes are submitted to the authorized office for review. Check status notifications and update history for progress.");}
 });});
 document.addEventListener("click",ev=>{if(open&&!dock.contains(ev.target))setOpen(false);});
 document.addEventListener("keydown",ev=>{if(open&&ev.key==="Escape")setOpen(false,true);});
 document.addEventListener("scroll",ev=>{
  if(open&&ev.target&&!panel.contains(ev.target)&&!dock.contains(ev.target))setOpen(false);
 },{capture:true,passive:true});
 q("#screen-record")?.addEventListener("click",ev=>{
  if(open&&ev.target.closest("#btn-ralert"))setOpen(false);
 });
}
function setOpen(value,restoreFocus=false){
 const dock=q("#qdc7-guide-dock"),button=q("#qdc7-guide-trigger"),panel=q("#qdc7-guide-panel");
 if(!dock||!panel||!button)return;
 open=!!value&&!!profileScreen();
 dock.classList.toggle("open",open);
 panel.setAttribute("aria-hidden",String(!open));
 button.setAttribute("aria-expanded",String(open));
 if(open){update();requestAnimationFrame(()=>q("#qdc7-guide-close")?.focus({preventScroll:true}));}
 else if(restoreFocus)button.focus({preventScroll:true});
}
function showTip(label,detail){
 const name=q("#qdc7-tip-label"),copy=q("#qdc7-tip-detail");
 if(name)name.textContent=label;
 if(copy)copy.textContent=detail;
}
function focusField(field,name){
 if(!field||!profileScreen())return;
 targetField=field.dataset.field||null;
 setOpen(false);
 field.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth",block:"center"});
 field.classList.add("qdc7-field-focus");
 setTimeout(()=>{if(field.isConnected)field.classList.remove("qdc7-field-focus");},2100);
 const control=field.querySelector("input,select,textarea");
 if(control)try{control.focus({preventScroll:true})}catch(e){}
 showTip(name,tips(name));
}
function update(){
 const screen=profileScreen(),dock=q("#qdc7-guide-dock");
 if(dock)dock.classList.toggle("available",!!screen);
 if(!screen){if(open)setOpen(false);return;}
 buildDashboard();
 const data=summarize();
 const value=q("#qdc7-pct");if(value)value.textContent=data.pct+"%";
 const completed=q("#qdc7-completed");if(completed)completed.textContent=data.completed+" of "+data.total+" fields filled";
 const reviewed=q("#qdc7-reviewed");if(reviewed)reviewed.textContent=data.completed+" / "+data.total;
 const missing=q("#qdc7-missing");if(missing)missing.textContent=data.missing.length;
 const guidePct=q("#qdc7-guide-pct");if(guidePct)guidePct.textContent=data.pct+"%";
 const fill=q("#qdc7-guide-fill");if(fill)fill.style.width=data.pct+"%";
 const guideCount=q("#qdc7-guide-count");if(guideCount)guideCount.textContent=data.missing.length?data.missing.length+" visible fields need attention":"All visible fields are complete";
 const status=q("#qdc7-overview-status");if(status)status.textContent=statusText();
 const edit=q("#qdc7-edit");if(edit){
  const original=q("#btn-inline-edit");
  const allowed=!!original&&!original.classList.contains("hidden")&&!fromAdmin();
  edit.hidden=!(allowed||editor());
  edit.querySelector("b").textContent=editor()?"↓":"→";
  edit.setAttribute("aria-label",editor()?"Continue editing your profile":"Edit or update your profile");
 }
 const guideEdit=q("#qdc7-guide-edit");if(guideEdit){
  const native=q("#btn-inline-edit");
  guideEdit.disabled=!editor()&&(!native||native.classList.contains("hidden")||fromAdmin());
  guideEdit.textContent=editor()?"Continue Editing →":"Edit Profile →";
 }
 const card=q("#qdc7-overview");if(card)card.classList.toggle("is-editing",editor());
 const step=qa(".qdc7-guide-step");step.forEach((x,i)=>{
  const active=editor()?i===1:i===0;
  if(!open)x.classList.toggle("active",active);
 });
 if(data.total&&data.missing.length===0&&!targetField)showTip("Profile details complete","All visible fields contain information. Please check accuracy against official records.");
}
function onFieldEvent(ev){
 if(!profileScreen())return;
 const field=ev.target.closest?.("#r-fields .field");
 if(!field)return;
 const name=fieldText(field);
 targetField=field.dataset.field||null;
 showTip(name,tips(name));
}
function start(){
 if(!q("#screen-record"))return;
 buildDashboard();buildGuide();update();
 const fieldsRoot=q("#r-fields");
 fieldsRoot?.addEventListener("focusin",onFieldEvent);
 fieldsRoot?.addEventListener("pointerover",onFieldEvent);
 fieldsRoot?.addEventListener("input",()=>requestAnimationFrame(update));
 fieldsRoot?.addEventListener("change",()=>requestAnimationFrame(update));
 const observer=new MutationObserver(()=>requestAnimationFrame(update));
 observer.observe(fieldsRoot,{childList:true});
 observer.observe(q("#screen-record"),{attributes:true,attributeFilter:["class"]});
 document.addEventListener("visibilitychange",()=>{if(!document.hidden)update();});
 q("#ptab-profile")?.addEventListener("click",()=>requestAnimationFrame(update));
 q("#ptab-hmdash")?.addEventListener("click",()=>requestAnimationFrame(update));
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});
else start();
})();