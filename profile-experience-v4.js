/* Profile Experience v4 — browser-only presentation enhancement.
   No authentication, Supabase RPC, profile saves or approval procedures are changed. */
(function(){
 "use strict";
 const q=(selector,root=document)=>root.querySelector(selector);
 const activeRecord=()=>{const screen=q("#screen-record");return screen&&!screen.classList.contains("hidden");};
 const make=(tag,cls,txt)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(txt!=null)x.textContent=txt;return x;};
 const fieldName=(field)=>{
  const k=q(".k",field);
  return (k?.textContent||field.dataset.field||"this field").trim();
 };
 function guidanceText(name){
  const s=name.toLowerCase();
  if(s.includes("cnic"))return "Match every CNIC digit with the official CNIC. Check the number before saving.";
  if(s.includes("personal")||s.includes("pid"))return "Use the Personal ID (PID) displayed on your official salary or service record.";
  if(s.includes("date")||s.includes("dob")||s.includes("joining"))return "Enter the date in the format shown in the field and verify it against the official order.";
  if(s.includes("mobile")||s.includes("phone")||s.includes("contact"))return "Check that this contact number is active, correct and reachable.";
  if(s.includes("posting")||s.includes("school")||s.includes("semis"))return "Use the current posting order and choose the correct school and SEMIS information.";
  if(s.includes("designation")||s.includes("bps")||s.includes("scale"))return "Match designation and pay scale with your official service or appointment order.";
  if(s.includes("qualification"))return "Enter the qualification actually awarded on your certificate.";
  if(s.includes("name"))return "Use the spelling in your CNIC and service records.";
  return "Review this entry against your official record. Changes can be saved as a draft before submission.";
 }
 function updateLiveFieldGuide(name){
  const bar=q("#screen-record .qdc-v4-guidance-bar");if(!bar)return;
  const title=q("b",bar),detail=q("small",bar);
  if(!title||!detail)return;
  if(!name){
   title.textContent="LIVE FIELD ASSISTANT";
   detail.textContent="Select any field to see contextual guidance. Save your draft, then send your changes together for Admin verification.";
  }else{
   title.textContent="GUIDANCE · "+name.toUpperCase();
   detail.textContent=guidanceText(name);
  }
 }
 function updateProfileProgress(){
  const screen=q("#screen-record");
  if(!screen||screen.classList.contains("hidden"))return;
  const root=q("#r-fields");if(!root)return;
  const all=Array.from(root.querySelectorAll(".field")).filter(el=>el.querySelector(".k"));
  if(!all.length)return;
  const isEmpty=v=>!String(v??"").trim()||/^—+$/.test(String(v).trim())||/^(not recorded|not assigned|missing|n\/a)$/i.test(String(v).trim());
  let completed=0;
  all.forEach(el=>{
   const edit=el.querySelector("input[data-field],select[data-field],textarea[data-field],.v-edit");
   let value;
   if(edit)value=edit.value;
   else {const valueEl=el.querySelector(".v");value=valueEl?.textContent||"";if(valueEl?.classList.contains("blank"))value="";}
   if(!isEmpty(value))completed++;
  });
  const pct=Math.round(completed/all.length*100);
  const label=q("#qdc-v4-progress-text"),bar=q("#qdc-v4-progress-fill");
  if(label)label.textContent=completed+" / "+all.length+" fields ("+pct+"%)";
  if(bar){bar.style.width=pct+"%";bar.setAttribute("aria-label",pct+" percent of displayed fields completed");}
 }
 function setUpProfile(){
  const screen=q("#screen-record"),fields=q("#r-fields");if(!screen||!fields)return;
  // Anchor the alert bell inside the profile header so it never collides with other controls.
  const header=q(".recordhead",screen),bell=q("#ralertwrap",screen);
  if(header&&bell&&bell.parentNode!==header)header.append(bell);
  fields.addEventListener("focusin",ev=>{
   const field=ev.target.closest(".field");if(!field)return;updateLiveFieldGuide(fieldName(field));
  });
  fields.addEventListener("pointerenter",ev=>{
   const field=ev.target.closest(".field");if(!field)return;updateLiveFieldGuide(fieldName(field));
  },true);
  fields.addEventListener("input",()=>requestAnimationFrame(updateProfileProgress));
  fields.addEventListener("change",()=>requestAnimationFrame(updateProfileProgress));
  const observer=new MutationObserver(()=>{
   requestAnimationFrame(()=>{
    updateLiveFieldGuide("");
    updateProfileProgress();
   });
  });
  observer.observe(fields,{childList:true});
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)updateProfileProgress();});
  updateProfileProgress();
 }
 function setupSupport(){
  const dock=q(".support-dock"),trigger=q("#support-launch"),panel=q("#support-panel");
  if(!dock||!trigger||!panel)return;
  trigger.hidden=false;
  const closer=make("button","qdc-v4-help-close","×");
  closer.type="button";closer.setAttribute("aria-label","Close Help and Support");
  if(!q(".qdc-v4-help-close",panel))panel.prepend(closer);
  const close=()=>{
   panel.classList.remove("open");
   panel.setAttribute("aria-hidden","true");
   trigger.setAttribute("aria-expanded","false");
   trigger.classList.remove("qdc-v4-expanded");
  };
  const open=()=>{
   panel.classList.add("open");
   panel.setAttribute("aria-hidden","false");
   trigger.setAttribute("aria-expanded","true");
   trigger.classList.add("qdc-v4-expanded");
  };
  trigger.setAttribute("aria-label","Open Help and Support panel");
  trigger.addEventListener("click",ev=>{
   ev.stopPropagation();
   panel.classList.contains("open")?close():open();
  });
  closer.addEventListener("click",()=>{
   close();trigger.focus();
  });
  document.addEventListener("click",ev=>{if(!dock.contains(ev.target))close();});
  document.addEventListener("keydown",ev=>{
   if(ev.key==="Escape"&&panel.classList.contains("open")){close();trigger.focus();}
  });
  // Don't bind the footer credit to WhatsApp. It is informational, not a support control.
  const credit=q("footer .credit");
  if(credit){
   credit.removeAttribute("title");
   credit.removeAttribute("onclick");
   credit.removeAttribute("onmouseenter");
   credit.style.cursor="default";
   credit.setAttribute("aria-label","Developed by Muzafar Ali Solangi, IT Focal Person");
   credit.addEventListener("click",ev=>{ev.preventDefault();ev.stopPropagation();},true);
  }
  close();
 }
 function boot(){
  setUpProfile();
  setupSupport();
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});
 else boot();
})();