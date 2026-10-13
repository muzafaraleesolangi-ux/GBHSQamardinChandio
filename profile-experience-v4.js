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
 function installSectionNavigator(){
  const root=q("#r-fields"),banner=q("#qdc-editor-banner");if(!root||!banner||q(".qdc-v4-section-nav",banner))return;
  const sections=Array.from(root.querySelectorAll(":scope > .qdc-field-section"));
  if(!sections.length)return;
  const nav=make("nav","qdc-v4-section-nav");
  nav.setAttribute("aria-label","Employee profile sections");
  sections.forEach((section,i)=>{
   const title=(section.querySelector("b")?.textContent||"Section "+(i+1)).trim();
   const b=make("button","qdc-v4-section-pill"+(i===0?" selected":""),(i+1)+" · "+title);
   b.type="button";b.dataset.qdcV4Section=String(i);
   nav.append(b);
  });
  const guide=q(".qdc-v4-completion",banner);
  if(guide)guide.insertAdjacentElement("afterend",nav);else banner.append(nav);
 }
 function updateProfileProgress(){
  const screen=q("#screen-record");
  if(!screen||screen.classList.contains("hidden"))return;
  const root=q("#r-fields");if(!root)return;
  installSectionNavigator();
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
  fields.addEventListener("click",ev=>{
   const b=ev.target.closest(".qdc-v4-section-pill");if(!b)return;
   const heads=Array.from(fields.querySelectorAll(":scope > .qdc-field-section"));
   const selected=heads[Number(b.dataset.qdcV4Section)];
   if(!selected)return;
   fields.querySelectorAll(".qdc-v4-section-pill").forEach(x=>x.classList.toggle("selected",x===b));
   selected.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth",block:"start"});
  });
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
  panel.setAttribute("role","dialog");panel.setAttribute("aria-label","Help and Support");
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

 /* V5: move the notification panel outside the clipped .recordhead/.card.
    Preserve the original rows, read receipts, badge and event handlers. */
 function setupNotificationOverlay(){
  const screen=q("#screen-record"),wrap=q("#ralertwrap"),panel=q("#ralert-panel"),bell=q("#btn-ralert");
  if(!screen||!wrap||!panel||!bell||panel.dataset.overlayV5)return;
  panel.dataset.overlayV5="1";
  screen.append(panel); // panel is a sibling of the clipped card, but still within #screen-record CSS scope
  panel.setAttribute("role","dialog");
  panel.setAttribute("aria-label","Employee profile notifications");
  panel.setAttribute("aria-hidden","true");
  bell.setAttribute("aria-expanded","false");
  bell.setAttribute("aria-controls","ralert-panel");
  const scrim=make("div","qdc-v5-alert-scrim");
  scrim.setAttribute("aria-hidden","true");
  screen.insertBefore(scrim,panel);
  const head=q(".notif-head",panel);
  let closeButton=q(".qdc-v5-alert-close",panel);
  if(head&&!closeButton){
   closeButton=make("button","qdc-v5-alert-close","×");
   closeButton.type="button";closeButton.setAttribute("aria-label","Close notifications");
   head.append(closeButton);
  }
  let lastKnownOpen=false;
  const isOpen=()=>panel.classList.contains("show");
  const close=(restoreFocus=false)=>{
   if(!isOpen())return;
   panel.classList.remove("show");
   panel.setAttribute("aria-hidden","true");
   bell.setAttribute("aria-expanded","false");
   scrim.classList.remove("open");
   if(restoreFocus&&document.activeElement!==bell)bell.focus({preventScroll:true});
  };
  const position=()=>{
   if(!isOpen())return;
   const a=bell.getBoundingClientRect(), vw=window.innerWidth, vh=window.innerHeight, pad=12;
   const narrow=vw<=640;
   const width=Math.max(240,Math.min(narrow?vw-20:410,vw-2*pad));
   panel.style.position="fixed";
   panel.style.width=width+"px";
   panel.style.right="auto";
   panel.style.maxHeight=Math.max(210,vh-2*pad)+"px";
   if(narrow){
    panel.style.left=Math.max(10,(vw-width)/2)+"px";
    panel.style.top="auto";
    panel.style.bottom="max(10px, env(safe-area-inset-bottom))";
    return;
   }
   panel.style.bottom="auto";
   const left=Math.min(Math.max(pad,a.right-width),vw-width-pad);
   panel.style.left=left+"px";
   const panelHeight=Math.min(panel.getBoundingClientRect().height||420,vh-2*pad);
   const below=vh-(a.bottom+12)-pad;
   const above=a.top-12-pad;
   let top;
   if(below>=Math.min(270,panelHeight)||below>=above){
    top=Math.min(a.bottom+12,Math.max(pad,vh-panelHeight-pad));
   }else{
    top=Math.max(pad,a.top-12-panelHeight);
   }
   panel.style.top=top+"px";
  };
  const onPageScroll=e=>{
   if(!isOpen())return;
   const origin=e&&e.target;
   // Scrolling notices within the panel must not dismiss it.
   if(origin&&origin.nodeType&&panel.contains(origin))return;
   close();
  };
  // The existing document outside-click listener treats the relocated panel
  // as "outside"; stop its bubbling while retaining the row's own click listeners.
  panel.addEventListener("click",ev=>{
   ev.stopPropagation();
   if(isOpen())requestAnimationFrame(position);
  });
  panel.addEventListener("pointerdown",ev=>ev.stopPropagation());
  closeButton?.addEventListener("click",()=>close(true));
  scrim.addEventListener("click",()=>close(true));
  bell.addEventListener("click",()=>{
   requestAnimationFrame(()=>{
    const opened=isOpen();
    scrim.classList.toggle("open",opened);
    bell.setAttribute("aria-expanded",String(opened));
    panel.setAttribute("aria-hidden",String(!opened));
    if(opened)position();
   });
  });
  const panelObserver=new MutationObserver(()=>{
   const opened=isOpen();
   if(opened===lastKnownOpen)return;
   lastKnownOpen=opened;
   scrim.classList.toggle("open",opened);
   bell.setAttribute("aria-expanded",String(opened));
   panel.setAttribute("aria-hidden",String(!opened));
   if(opened)requestAnimationFrame(position);
  });
  panelObserver.observe(panel,{attributes:true,attributeFilter:["class"]});
  const screenObserver=new MutationObserver(()=>{if(screen.classList.contains("hidden"))close();});
  screenObserver.observe(screen,{attributes:true,attributeFilter:["class"]});
  document.addEventListener("scroll",onPageScroll,{capture:true,passive:true});
  window.addEventListener("scroll",onPageScroll,{passive:true});
  window.addEventListener("resize",()=>{if(isOpen())requestAnimationFrame(position)},{passive:true});
  window.addEventListener("orientationchange",()=>{if(isOpen())requestAnimationFrame(position)},{passive:true});
  document.addEventListener("keydown",ev=>{if(ev.key==="Escape"&&isOpen())close(true);});
  document.addEventListener("focusin",ev=>{
   if(!isOpen())return;
   if(panel.contains(ev.target)||wrap.contains(ev.target))return;
   close();
  });
  panel.style.top="auto";
 }
 function boot(){
  setUpProfile();
  setupNotificationOverlay();
  setupSupport();
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});
 else boot();
})();