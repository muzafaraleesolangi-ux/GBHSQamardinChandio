/* Accessibility and coordination for the existing support and guideline handlers. */
(function(){
 'use strict';
 function boot(){
  const panel=document.getElementById('support-panel');
  const support=document.getElementById('support-launch');
  const guide=document.getElementById('qdc7-guide-trigger');
  const guidePanel=document.getElementById('qdc7-guide-panel');
  if(panel&&support){
   const mark=panel.querySelector('.support-wa-mark');
   const link=panel.querySelector('.support-wa-link');
   if(mark&&link){
    const svg=mark.querySelector('svg');
    mark.textContent='';if(svg)mark.append(svg);
    const label=document.createElement('span');label.textContent='Chat on WhatsApp';
    link.append(label);link.setAttribute('aria-label','Contact portal support on WhatsApp');
   }
   const number=panel.querySelector('.support-number');
   if(number&&!number.querySelector('a')){
    const call=document.createElement('a');call.href='tel:+923000357397';
    call.textContent=number.textContent;call.setAttribute('aria-label','Call portal support: 0300 0357397');
    number.replaceChildren(call);
   }
   function syncSupport(){
    const open=panel.classList.contains('open');panel.inert=!open;
    if(open){
     if(guide?.getAttribute('aria-expanded')==='true')guide.click();
     panel.querySelector('.qdc-v4-help-close')?.focus({preventScroll:true});
    }
   }
   new MutationObserver(syncSupport).observe(panel,{attributes:true,attributeFilter:['class']});
   syncSupport();
  }
  if(guidePanel){
   function syncGuide(){
    const open=guidePanel.getAttribute('aria-hidden')==='false';guidePanel.inert=!open;
    if(open&&support?.getAttribute('aria-expanded')==='true')support.click();
   }
   new MutationObserver(syncGuide).observe(guidePanel,{attributes:true,attributeFilter:['aria-hidden']});syncGuide();
  }
  document.querySelectorAll('#screen-dash .tablewrap').forEach((wrap,i)=>{
   wrap.tabIndex=0;wrap.setAttribute('role','region');
   const heading=wrap.closest('.tabpane')?.querySelector('h2,h3');
   wrap.setAttribute('aria-label',(heading?.textContent?.trim()||'Dashboard table '+(i+1))+': scroll horizontally to view all columns');
  });
  if(window.visualViewport){
   const syncKeyboard=()=>{
    const editing=/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement?.tagName||'');
    document.body.classList.toggle('qdc9-keyboard-open',editing&&visualViewport.height<innerHeight*.7);
   };
   visualViewport.addEventListener('resize',syncKeyboard);
   document.addEventListener('focusin',syncKeyboard);document.addEventListener('focusout',syncKeyboard);
  }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
