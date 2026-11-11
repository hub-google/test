(function(){'use strict';var toggle=document.getElementById('mobileToggle'),nav=document.getElementById('topNav');if(!toggle||!nav)return;toggle.addEventListener('click',function(){var show=!nav.classList.contains('open');nav.classList.toggle('open',show);toggle.setAttribute('aria-expanded',String(show));});nav.addEventListener('click',function(e){if(e.target.closest('a')){nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');}});document.addEventListener('keydown',function(e){if(e.key==='Escape'){nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');}});})();

(function(){
  'use strict';
  var tabs=[].slice.call(document.querySelectorAll('[data-feature-tab]'));
  var content={
    reservation:{
      kicker:'RESERVATION MANAGEMENT',
      title:'訂位資訊集中整理',
      text:'整合日期、時段、人數與桌位安排，在一張清楚的列表中掌握所有預約。',
      link:'./demo.html#/reservations',
      m:[['今日訂位','24'],['已確認','18'],['待確認','06']],
      rows:[['17:30','林小姐・3 位','已確認'],['18:00','陳先生・2 位','已確認'],['18:30','王小姐・4 位','待確認'],['19:00','許先生・2 位','已確認']]
    },
    queuing:{
      kicker:'QUEUE MANAGEMENT',
      title:'現場叫號，井然有序',
      text:'自動分配候位號碼、保留過號紀錄、支援重叫與恢復，現場服務不中斷。',
      link:'./demo.html#/queue',
      m:[['目前候位','08'],['已叫號','03'],['已入座','14']],
      rows:[['A021','李先生・2 位','已入座'],['A022','張小姐・4 位','已叫號'],['A023','王先生・3 位','候位中'],['A024','陳小姐・2 位','候位中']]
    },
    guest:{
      kicker:'GUEST MANAGEMENT',
      title:'了解顧客，服務更貼心',
      text:'整合訂位與候位紀錄，建立常客標籤並記下服務需求，讓回訪接待更順暢。',
      link:'./demo.html#/customers',
      m:[['顧客紀錄','218'],['VIP 顧客','36'],['本週回訪','42']],
      rows:[['VIP','林小姐・常客','已記錄'],['VIP','陳先生・靠窗','已記錄'],['一般','王小姐・生日','已記錄'],['一般','許先生・不吃辣','已記錄']]
    }
  };
  function esc(s){return String(s).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];});}
  tabs.forEach(function(tab){tab.addEventListener('click',function(){
    var next=content[tab.getAttribute('data-feature-tab')];if(!next)return;
    tabs.forEach(function(t){var active=t===tab;t.classList.toggle('active',active);t.setAttribute('aria-selected',String(active));});
    var values={featureStageKicker:next.kicker,featureStageTitle:next.title,featureStageText:next.text};
    Object.keys(values).forEach(function(id){var el=document.getElementById(id);if(el)el.textContent=values[id];});
    var a=document.getElementById('featureStageLink');if(a)a.href=next.link;
    next.m.forEach(function(metric,i){var n=['One','Two','Three'][i];var name=document.getElementById('featureMetric'+n),value=document.getElementById('featureMetric'+n+'Value');if(name)name.textContent=metric[0];if(value)value.textContent=metric[1];});
    var rows=document.getElementById('featureRows');if(rows)rows.innerHTML=next.rows.map(function(r){return '<div><b>'+esc(r[0])+'</b><span>'+esc(r[1])+'</span><em class="'+((r[2]==='待確認'||r[2]==='候位中')?'pending':'')+'">'+esc(r[2])+'</em></div>';}).join('');
  });});
})();
