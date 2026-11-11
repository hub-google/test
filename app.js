const tabs = {
  booking: {
    index:"01 / RESERVATIONS", title:"預約從容，接待更有序。", description:"整合每日訂位資訊、用餐時段與現場安排，減少人工確認與重複登記，讓每組客人都被好好照顧。",
    points:["即時查看預約狀態與客人資訊","彈性管理時段、容量和備註","清楚掌握每一個接待環節"], kicker:"預約行事曆",
    visual:`<div class="mock-summary"><div><small>今日預約</small><b>38</b></div><div><small>已報到</small><b>26</b></div><div><small>待入座</small><b>12</b></div></div><div class="mock-frame"><div class="mock-head"><strong>今天的預約</strong><span>11 月 11 日　⌄</span></div><div class="mock-row"><span class="mock-number">12:00</span><strong>王小姐 ・ 2 位</strong><span class="mock-status">已到店</span></div><div class="mock-row"><span class="mock-number">12:30</span><strong>林先生 ・ 4 位</strong><span class="mock-status blue">已確認</span></div><div class="mock-row"><span class="mock-number">13:00</span><strong>陳小姐 ・ 3 位</strong><span class="mock-status amber">待到店</span></div><div class="mock-row"><span class="mock-number">13:30</span><strong>張先生 ・ 2 位</strong><span class="mock-status blue">已確認</span></div></div>`
  },
  queue: {
    index:"02 / WAITLIST", title:"排隊有進度，等待更安心。", description:"從現場取號到叫號狀態，每個環節清楚可見；店家有彈性，顧客也能隨時掌握進度。",
    points:["獨立管理不同服務窗口","顯示目前號碼與候位名單","狀態更正與叫號流程清楚"], kicker:"現場候位管理",
    visual:`<div class="mock-summary"><div><small>目前叫號</small><b>A018</b></div><div><small>候位中</small><b>09</b></div><div><small>已入座</small><b>21</b></div></div><div class="mock-frame"><div class="mock-head"><strong>候位叫號</strong><span class="mock-status">進行中</span></div><div class="mock-row"><span class="mock-number">A019</span><strong>李小姐 ・ 2 位</strong><span class="mock-status amber">候位中</span></div><div class="mock-row"><span class="mock-number">A020</span><strong>黃先生 ・ 4 位</strong><span class="mock-status amber">候位中</span></div><div class="mock-row"><span class="mock-number">A021</span><strong>周小姐 ・ 3 位</strong><span class="mock-status amber">候位中</span></div></div>`
  },
  orders: {
    index:"03 / ONLINE ORDERS", title:"提早點好餐，到點剛剛好。", description:"顧客可選擇取餐時間，店家依照訂單與準備進度安排作業，讓每份餐點在適合的時刻完成。",
    points:["可選擇是否開放預約取餐時間","訂單狀態可追蹤並更正","整合菜單與外帶服務流程"], kicker:"線上外帶訂單",
    visual:`<div class="mock-summary"><div><small>待接單</small><b>03</b></div><div><small>製作中</small><b>07</b></div><div><small>待取餐</small><b>12</b></div></div><div class="mock-frame"><div class="mock-head"><strong>今天的訂單</strong><span class="mock-status">即時同步</span></div><div class="mock-row"><span class="mock-plate">🥪</span><strong>鮪魚三明治 × 2<br><small>取餐 12:30</small></strong><span class="mock-status amber">製作中</span></div><div class="mock-row"><span class="mock-plate">🥐</span><strong>可頌套餐 × 1<br><small>取餐 12:45</small></strong><span class="mock-status blue">已接單</span></div><div class="mock-row"><span class="mock-plate">☕</span><strong>拿鐵咖啡 × 2<br><small>取餐 13:00</small></strong><span class="mock-status">待取餐</span></div></div>`
  },
  crm: {
    index:"04 / GUEST MANAGEMENT", title:"記住每位客人喜歡的細節。", description:"讓每一次來訪都能累積有用的服務紀錄，把客人的喜好和習慣轉化為更貼心的體驗。",
    points:["整合顧客基本資料與來訪紀錄","保留特殊需求、備註及喜好","以資訊協助服務與經營決策"], kicker:"顧客管理檔案",
    visual:`<div class="mock-people"><span>所有顧客</span><span>常客</span><span>新顧客</span><span>本月生日</span></div><div class="mock-frame"><div class="mock-head"><strong>顧客清單</strong><span>最近來訪 ↓</span></div><div class="mock-row"><span class="booking-avatar">王</span><strong>王小姐</strong><small>回訪 8 次</small><span class="mock-status">常客</span></div><div class="mock-row"><span class="booking-avatar mint">林</span><strong>林先生</strong><small>回訪 5 次</small><span class="mock-status">常客</span></div><div class="mock-row"><span class="booking-avatar blue">李</span><strong>李小姐</strong><small>首次來訪</small><span class="mock-status blue">新顧客</span></div></div>`
  }
};
function selectTab(id) {
  const item = tabs[id]; if (!item) return;
  document.querySelectorAll(".solution-tab").forEach(button=>{
    const selected = button.dataset.tab === id;
    button.classList.toggle("active",selected);
    button.setAttribute("aria-selected",String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  document.getElementById("solutionIndex").textContent=item.index;
  document.getElementById("solutionTitle").textContent=item.title;
  document.getElementById("solutionDescription").textContent=item.description;
  document.getElementById("visualKicker").textContent=item.kicker;
  const list=document.getElementById("solutionPoints");
  list.replaceChildren(...item.points.map(point=>{const li=document.createElement("li");li.textContent=point;return li;}));
  document.getElementById("visualContent").innerHTML=item.visual;
}
document.querySelectorAll(".solution-tab").forEach(button=>{
  button.addEventListener("click",()=>selectTab(button.dataset.tab));
  button.addEventListener("keydown",event=>{
    if(event.key!=="ArrowRight"&&event.key!=="ArrowLeft")return;
    event.preventDefault();
    const keys=Object.keys(tabs),i=keys.indexOf(button.dataset.tab);
    const next=keys[(i+(event.key==="ArrowRight"?1:-1)+keys.length)%keys.length];
    selectTab(next);document.querySelector('[data-tab="'+next+'"]').focus();
  });
});
const menuButton=document.getElementById("menuButton");
const navigation=document.getElementById("navigation");
menuButton.addEventListener("click",()=>{
 const opened=navigation.classList.toggle("open");
 menuButton.setAttribute("aria-expanded",String(opened));
 menuButton.setAttribute("aria-label",opened?"關閉選單":"開啟選單");
});
navigation.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{
 navigation.classList.remove("open");menuButton.setAttribute("aria-expanded","false");
}));
selectTab("booking");
