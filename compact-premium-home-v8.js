/* Institutional portal v8 — layout/UX only.
   Preserve all original sign-in, sign-up, employee/admin fields and data handlers. */
(function(){
 "use strict";
 const q=(s,root=document)=>root.querySelector(s);
 function recalcFlip(){
  requestAnimationFrame(()=>{
   try {if(typeof sizeLoginFlip==="function")sizeLoginFlip();}
   catch(e){ /* layout measurements will also be updated by existing tab handlers */ }
  });
 }
 function setupCompactAuthGuides(){
  const home=q("#screen-login");
  if(!home)return;
  const entries=[
   {target:"#employee-signin-guide",face:"#loginface-front",name:"Employee sign-in"},
   {target:"#admin-signin-guide",face:"#loginface-back",name:"Officer sign-in"}
  ];
  entries.forEach(({target,face,name})=>{
   const guide=q(target),parent=q(face);if(!guide||!parent||guide.dataset.qdc8Compact)return;
   guide.dataset.qdc8Compact="1";
   guide.classList.add("qdc8-collapsed");
   guide.setAttribute("aria-hidden","true");
   const toggle=document.createElement("button");
   toggle.type="button";toggle.className="qdc8-guide-toggle";
   toggle.setAttribute("aria-expanded","false");
   toggle.setAttribute("aria-controls",guide.id);
   toggle.setAttribute("aria-label","Show "+name+" step-by-step guidance");
   toggle.innerHTML=
    '<span class="qdc8-guide-mini-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7c-1.8-1.25-4.2-1.5-7-1.25v12c2.8-.25 5.2 0 7 1.25 1.8-1.25 4.2-1.5 7-1.25v-12c-2.8-.25-5.2 0-7 1.25Z"/><path d="M12 7v12m-5-9h2m6 0h2"/></svg></span>'+
    '<span class="qdc8-guide-mini-label"><strong>QUICK SIGN-IN HELP</strong><small>View step-by-step guidance when needed</small></span>'+
    '<span class="qdc8-guide-mini-arrow" aria-hidden="true">+</span>';
   guide.before(toggle);
   toggle.addEventListener("click",()=>{
    const expand=guide.classList.contains("qdc8-collapsed");
    guide.classList.toggle("qdc8-collapsed",!expand);
    guide.setAttribute("aria-hidden",String(!expand));
    toggle.setAttribute("aria-expanded",String(expand));
    toggle.setAttribute("aria-label",(expand?"Hide ":"Show ")+name+" step-by-step guidance");
    toggle.classList.toggle("expanded",expand);
    toggle.querySelector(".qdc8-guide-mini-arrow").textContent=expand?"−":"+";
    recalcFlip();
   });
  });
  // In account creation/recovery, make room for the existing signup fields and guidance.
  const first=q("#login-step1");
  if(first){
   const sync=()=>{
    const createOrReset=first.classList.contains("hidden");
    const toggle=q("#loginface-front .qdc8-guide-toggle");
    const guide=q("#employee-signin-guide");
    if(toggle)toggle.classList.toggle("qdc8-signin-off",createOrReset);
    if(guide)guide.classList.toggle("qdc8-signin-off",createOrReset);
    recalcFlip();
   };
   const observer=new MutationObserver(sync);
   observer.observe(first,{attributes:true,attributeFilter:["class"]});
   sync();
  }
 }
 function setupModernGuidelinesButton(){
  const button=q("#qdc7-guide-trigger"),icon=q(".qdc7-guide-bulb",button||document);
  if(!button||!icon||button.dataset.qdc8Styled)return;
  button.dataset.qdc8Styled="1";
  icon.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 7.4C10.1 6.2 7.8 6 5 6v12c2.8 0 5.1.2 7 1.4 1.9-1.2 4.2-1.4 7-1.4V6c-2.8 0-5.1.2-7 1.4Z"/><path d="M12 7.4v12"/><path d="m15.4 11.5 1.3 1.3 2.1-2.1"/></svg>';
  button.setAttribute("aria-label","Open Employee Live Guidelines");
  const labels=Array.from(button.children).filter(el=>el!==icon&&!el.classList.contains("qdc7-guide-chevron"));
  if(labels[0]){
   labels[0].textContent="Live Guidelines";
   labels[0].classList.add("qdc8-guidelines-label");
  }
  const mini=document.createElement("span");mini.className="qdc8-guidelines-status";
  mini.setAttribute("aria-hidden","true");mini.textContent="FIELD HELP";
  const chevron=q(".qdc7-guide-chevron",button);
  if(chevron)button.insertBefore(mini,chevron);else button.append(mini);
 }
 function boot(){
  setupCompactAuthGuides();
  setupModernGuidelinesButton();
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});
 else boot();
})();