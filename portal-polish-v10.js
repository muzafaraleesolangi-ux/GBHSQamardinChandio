/* Portal polish v10 — decorates published leadership cards on initial render and refresh. */
(function(){
  "use strict";
  function enhance(){
    const grid=document.getElementById("qdc-v6-leadership-grid");
    if(!grid)return;
    grid.querySelectorAll('.qdc-v6-leader[data-profile-key="hub_head"],.qdc-v6-leader[data-profile-key="district_officer"]').forEach(function(card){
      if(card.classList.contains("qdc10-leader"))return;
      card.classList.add("qdc10-leader");
      const sweep=document.createElement("span");
      sweep.className="qdc10-light-sweep";
      sweep.setAttribute("aria-hidden","true");
      const spark=document.createElement("span");
      spark.className="qdc10-corner-spark";
      spark.setAttribute("aria-hidden","true");
      spark.textContent="✦";
      card.append(sweep,spark);
    });
  }
  function boot(){
    const grid=document.getElementById("qdc-v6-leadership-grid");
    if(!grid)return;
    enhance();
    /* Leadership cards may be replaced when the public Supabase profiles load. */
    new MutationObserver(function(changes){
      if(changes.some(function(change){return change.type==="childList";}))enhance();
    }).observe(grid,{childList:true});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});
  else boot();
})();