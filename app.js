
(function(){
'use strict';
var KEY='seatflow-original-demo-v1';
var R=[
{id:'green',name:'青杉小館',kind:'季節料理',area:'台北・大安',emoji:'🥗',subtitle:'一口好食，慢慢享受好時光',address:'台北市大安區青杉路 18 號（示意）',phone:'02-2345-0001',open:'11:30–21:00',capacity:12,duration:90,slots:['11:30','12:00','12:30','13:00','17:30','18:00','18:30','19:00','19:30'],queue:true,booking:true},
{id:'dusk',name:'日暮食堂',kind:'日式定食',area:'台北・中山',emoji:'🍱',subtitle:'剛剛好的溫度，給每一次相聚',address:'台北市中山區日暮街 6 號（示意）',phone:'02-2345-0002',open:'11:00–21:30',capacity:14,duration:100,slots:['11:00','11:30','12:00','12:30','13:00','17:00','17:30','18:00','18:30','19:00'],queue:true,booking:true},
{id:'orange',name:'橙花咖啡館',kind:'咖啡與早午餐',area:'台北・信義',emoji:'☕',subtitle:'每段日常，都值得一個空位',address:'台北市信義區橙花路 28 號（示意）',phone:'02-2345-0003',open:'09:30–18:00',capacity:10,duration:75,slots:['09:30','10:00','10:30','11:00','11:30','12:00','13:00','13:30','14:00','14:30','15:00'],queue:true,booking:true}
];
var today=function(n){return new Date(Date.now()+(n||0)*86400000).toLocaleDateString('sv-SE',{timeZone:'Asia/Taipei'});};
var uid=function(prefix){return (prefix||'ID')+'-'+Math.random().toString(36).slice(2,8).toUpperCase();};
var clone=function(o){return JSON.parse(JSON.stringify(o));};
var esc=function(v){return String(v===undefined||v===null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
var seed=function(){
  return {restaurants:clone(R),bookings:[
    {id:'R-1001',rid:'green',date:today(),time:'12:00',name:'林小姐',phone:'0912000111',party:3,note:'靠窗座位',status:'已確認',created:Date.now()-18000000,table:'A1'},
    {id:'R-1002',rid:'green',date:today(),time:'18:00',name:'陳先生',phone:'0912000222',party:2,note:'不吃辣',status:'待確認',created:Date.now()-10000000,table:''},
    {id:'R-1003',rid:'green',date:today(),time:'18:30',name:'王小姐',phone:'0912000333',party:4,note:'生日聚餐',status:'已確認',created:Date.now()-6000000,table:''},
    {id:'R-1004',rid:'green',date:today(1),time:'12:30',name:'張先生',phone:'0912000444',party:2,note:'',status:'待確認',created:Date.now()-4000000,table:''}
  ],queues:[
    {id:'Q-1001',rid:'green',date:today(),number:'A001',name:'陳小姐',phone:'0912333001',party:2,status:'已入座',created:Date.now()-1800000,called:Date.now()-1600000},
    {id:'Q-1002',rid:'green',date:today(),number:'A002',name:'李先生',phone:'0912333002',party:3,status:'已叫號',created:Date.now()-1200000,called:Date.now()-300000},
    {id:'Q-1003',rid:'green',date:today(),number:'A003',name:'張小姐',phone:'0912333003',party:2,status:'候位中',created:Date.now()-800000,called:null},
    {id:'Q-1004',rid:'green',date:today(),number:'A004',name:'吳先生',phone:'0912333004',party:4,status:'候位中',created:Date.now()-600000,called:null},
    {id:'Q-1005',rid:'green',date:today(),number:'A005',name:'郭小姐',phone:'0912333005',party:2,status:'候位中',created:Date.now()-450000,called:null}
  ],customers:{},orders:[],events:[],settings:{},version:1};
};
var db;
try { db=JSON.parse(localStorage.getItem(KEY)); if(!db || !Array.isArray(db.bookings)||!Array.isArray(db.queues)||!Array.isArray(db.restaurants))throw 0; } catch(e){ db=seed(); }
function save(){localStorage.setItem(KEY,JSON.stringify(db));}
save();
var ui={rid:'green',day:0,party:2,slot:'',filter:'全部',queueFilter:'進行中',search:'',publicSearch:'',lookup:'',modal:'',notice:'',menuOpen:false,cart:{},tab:'overview'};
var titles={home:'體驗首頁',discover:'探索餐廳',book:'線上訂位',join:'現場候位',lookup:'我的訂位',board:'候位看板',dashboard:'營運總覽',reservations:'訂位管理',queue:'候位管理',floor:'桌位圖',customers:'顧客管理',orders:'訂單管理',reports:'營運報表',settings:'商家設定'};
var itemsPublic=[['home','首頁','⌂'],['discover','探索餐廳','⌕'],['book','線上訂位','▦'],['join','現場候位','≋'],['lookup','我的訂位','◎'],['board','候位看板','▣']];
var itemsStaff=[['dashboard','營運總覽','◈'],['reservations','訂位管理','▤'],['queue','候位管理','▥'],['floor','桌位圖','▦'],['customers','顧客管理','♧'],['orders','訂單管理','◷'],['reports','營運報表','▧'],['settings','商家設定','⚙']];
function route(){var h=(location.hash||'#/home').replace(/^#\/?/,'').split('?')[0];return titles[h]?h:'home';}
function go(page){location.hash='#/'+page;if(route()===page)render();}
function current(){return db.restaurants.find(function(x){return x.id===ui.rid;})||db.restaurants[0];}
function bookings(rid,date){return db.bookings.filter(function(x){return (!rid||x.rid===rid)&&(!date||x.date===date);});}
function queues(rid,date){return db.queues.filter(function(x){return (!rid||x.rid===rid)&&(!date||x.date===date);});}
function activeBooking(b){return b.status!=='已取消';}
function activeQueue(q){return ['候位中','已叫號'].includes(q.status);}
function formatDate(day){var d=new Date(day+'T12:00:00+08:00');return (d.getMonth()+1)+'/'+d.getDate();}
function formatClock(ts){return new Date(ts).toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Taipei',hour12:false});}
function toast(s){var t=document.getElementById('toast');t.textContent=s;t.classList.add('show');clearTimeout(window._toast);window._toast=setTimeout(function(){t.classList.remove('show');},3000);}
function tag(status){var color={'已確認':'success','已入座':'success','已完成':'success','待確認':'warning','候位中':'warning','已叫號':'warning','已取消':'error','過號':'error'}[status]||'info';return '<span class="tag '+color+'">'+esc(status)+'</span>';}
function button(text,action,extra,cls){return '<button type="button" class="btn '+(cls||'')+'" data-action="'+esc(action)+'" '+(extra||'')+'>'+text+'</button>';}
function field(label,name,type,value,opts){return '<div class="field"><label for="'+esc(name)+'">'+esc(label)+'</label><input id="'+esc(name)+'" name="'+esc(name)+'" type="'+(type||'text')+'" value="'+esc(value||'')+'" '+(opts||'')+'></div>';}
function select(label,name,options,value){return '<div class="field"><label for="'+esc(name)+'">'+esc(label)+'</label><select id="'+esc(name)+'" name="'+esc(name)+'">'+options.map(function(x){var v=typeof x==='string'?x:x[0],n=typeof x==='string'?x:x[1];return '<option value="'+esc(v)+'" '+(String(v)===String(value)?'selected':'')+'>'+esc(n)+'</option>';}).join('')+'</select></div>';}
function header(title,sub,extra){return '<div class="pagehead"><div><div class="eyebrow">SEATFLOW / EXPERIENCE</div><h1>'+esc(title)+'</h1><p>'+esc(sub||'')+'</p></div><div class="actions">'+(extra||'')+'</div></div>';}
function empty(msg){return '<div class="empty"><div class="glyph">☘</div><b>目前沒有資料</b>'+esc(msg||'可新增資料開始體驗')+'</div>';}
function restaurantSelect(){return '<select class="input" data-change="rid">'+db.restaurants.map(function(r){return '<option value="'+esc(r.id)+'" '+(ui.rid===r.id?'selected':'')+'>'+esc(r.name)+'</option>';}).join('')+'</select>';}
function navGroup(items){return '<nav>'+items.map(function(it){return '<button class="navitem '+(route()===it[0]?'active':'')+'" data-route="'+it[0]+'"><span class="navemoji">'+it[2]+'</span>'+it[1]+'</button>';}).join('')+'</nav>';}
function shell(content){
var r=route();
document.getElementById('app').innerHTML=
'<div class="layout">'+
'<aside id="sidebar" class="side '+(ui.menuOpen?'open':'')+'"><a class="brand" href="#/home"><span class="brandmark">S</span> SeatFlow</a><div class="cap">CUSTOMER EXPERIENCE</div>'+navGroup(itemsPublic)+
'<div class="cap">MERCHANT WORKSPACE</div>'+navGroup(itemsStaff)+
'<div class="sidebottom"><b>獨立研發的功能示範</b><p>所有店家與顧客均為虛構資料；資料只保存在目前瀏覽器，不會發送訊息或收款。</p></div></aside>'+
'<main class="main"><header class="header"><div class="headerleft"><button class="mobilemenu" data-action="menu" aria-label="開啟選單">☰</button><div class="crumb">SeatFlow　/　'+esc(titles[r])+'</div></div><div class="headeractions"><span class="pill"><i class="dot"></i> 互動展示版</span><span class="usercircle">SF</span></div></header><div class="page">'+content+'<div class="footer">SeatFlow 為獨立製作的操作研究 Demo，非 inline 官方網站、無商業合作或實際訂位服務。</div></div></main></div>'+
'<nav class="mobilebar"><button class="'+(r==='home'?'active':'')+'" data-route="home"><span>⌂</span>首頁</button><button class="'+(r==='discover'||r==='book'?'active':'')+'" data-route="discover"><span>⌕</span>找餐廳</button><button class="'+(r==='join'||r==='board'?'active':'')+'" data-route="join"><span>≋</span>候位</button><button class="'+(['dashboard','reservations','queue','floor','customers','orders','reports','settings'].includes(r)?'active':'')+'" data-route="dashboard"><span>▤</span>店家後台</button></nav>';
}
function home(){
var todayQ=queues(ui.rid,today());
return '<section class="hero"><div class="copy"><div class="eyebrow">RESTAURANT OPERATIONS, SIMPLIFIED</div><h1>從第一筆訂位，<br>到最後一桌好服務。</h1><p>訂位、候位、桌位、顧客與訂單，一個介面了解完整營運流程。這是可操作的原創示範站。</p><div class="actions">'+button('開始預約體驗 →','goto','data-page="discover"','primary')+button('進入店家後台','goto','data-page="dashboard"','')+'</div></div><div class="heroart"><div class="ticket"><span>WAITING TICKET</span><b>A'+String(todayQ.length+1).padStart(3,'0')+'</b><small>您的好時光，即將開始</small></div></div></section>'+
'<div style="height:24px"></div><div class="grid g3">'+
tile('01','線上訂位','選擇日期、人數、時段，完成預約與取消管理。','book','▦')+
tile('02','現場候位','取得順序號碼、查詢進度，店家可連續叫號。','join','≋')+
tile('03','營運後台','透過訂位列表、桌位配置與顧客標籤管理門市。','dashboard','◈')+'</div>'+
'<div style="height:30px"></div><div class="sectiontitle"><h2>精選體驗餐廳</h2><button class="btn sm" data-route="discover">查看全部 →</button></div><div class="grid g3">'+db.restaurants.map(restaurantCard).join('')+'</div>'+
'<div style="height:22px"></div><div class="alert">這不是 inline 網站的原始碼或鏡像。網站採用自行撰寫的 HTML、CSS 與 JavaScript；後台、簡訊、金流及跨裝置資料同步為未串接項目。</div>';
}
function tile(n,t,d,page,icon){return '<div class="card"><div class="between"><span class="eyebrow">FEATURE '+n+'</span><span class="miniicon">'+icon+'</span></div><h3 style="margin:15px 0 8px">'+t+'</h3><p class="muted" style="font-size:13px;min-height:44px">'+d+'</p>'+button('查看操作 →','goto','data-page="'+page+'"','sm')+'</div>';}
function restaurantCard(r){return '<article class="restaurant"><div class="restaurantimage">'+r.emoji+'<span class="corner">'+esc(r.kind)+'</span></div><div class="restaurantbody"><div class="between"><h3>'+esc(r.name)+'</h3><span class="tag info">可預約</span></div><p>'+esc(r.area)+'　·　'+esc(r.subtitle)+'</p><div class="flex" style="margin-bottom:14px;color:#6e8380;font-size:12px">◷ '+esc(r.open)+'　·　'+esc(r.capacity)+' 席 / 時段</div>'+button('線上訂位','choose','data-id="'+esc(r.id)+'" data-page="book"','primary')+'<div style="height:7px"></div>'+button('現場候位','choose','data-id="'+esc(r.id)+'" data-page="join"','block')+'</div></article>';}
function discover(){var list=db.restaurants.filter(function(r){var q=ui.publicSearch.toLowerCase();return !q||[r.name,r.kind,r.area,r.subtitle].join(' ').toLowerCase().includes(q);});return header('找一間喜歡的餐廳','體驗完整訂位流程，無須登入。')+
'<div class="card" style="margin-bottom:20px"><div class="filterbar" style="padding:0"><div class="field search"><label>餐廳名稱、地區或料理</label><input class="input" id="discoverSearch" placeholder="搜尋餐廳、早午餐、台北..." value="'+esc(ui.publicSearch)+'"></div>'+button('搜尋','searchDiscover','','primary')+'</div></div>'+
'<div class="grid g3">'+(list.length?list.map(restaurantCard).join(''):empty('沒有符合條件的餐廳'))+'</div>';
}
function days(){
var result='';for(var i=0;i<7;i++){var date=today(i),week=new Date(date+'T12:00:00+08:00').toLocaleDateString('zh-TW',{weekday:'short',timeZone:'Asia/Taipei'});result+='<button class="day '+(ui.day===i?'active':'')+'" data-action="day" data-day="'+i+'">'+(i===0?'今天':i===1?'明天':week)+'<strong>'+formatDate(date)+'</strong></button>';}return result;
}
function slotAvailability(r,date,time,party){var num=bookings(r.id,date).filter(function(b){return activeBooking(b)&&b.time===time;}).reduce(function(a,b){return a+b.party;},0);return num+Number(party)<=Number(r.capacity);}
function book(){var r=current(),date=today(ui.day);if(!ui.slot||!r.slots.includes(ui.slot)||!slotAvailability(r,date,ui.slot,ui.party)){ui.slot='';}var selected=ui.slot;
return header('預約一段好時光','選擇餐廳、日期、用餐人數和時段，確認後即可建立預約。',button('查看我的訂位','goto','data-page="lookup"'))+
'<div class="split"><div class="stack"><div class="card"><div class="between"><h3>1. 餐廳與人數</h3><span class="tag info">免登入</span></div><div class="formrow">'+select('選擇餐廳','bookRid',db.restaurants.map(function(x){return [x.id,x.name];}),ui.rid)+select('用餐人數','bookParty',[1,2,3,4,5,6,7,8].map(function(n){return [n,n+' 位'];}),ui.party)+'</div></div>'+
'<div class="card"><h3>2. 選擇日期</h3><div class="days">'+days()+'</div><h3 style="margin:14px 0">3. 選擇時段</h3><div class="slots">'+r.slots.map(function(t){var ok=slotAvailability(r,date,t,ui.party);return '<button class="slot '+(t===selected?'active':'')+'" data-action="slot" data-time="'+esc(t)+'" '+(!ok?'disabled':'')+'>'+esc(t)+'</button>';}).join('')+'</div><p class="notice" style="margin:13px 0 0">每個時段提供 '+esc(r.capacity)+' 個示範名額；已滿時段不可選。</p></div>'+
'<div class="card"><h3>4. 填寫訂位人資料</h3><form id="bookingForm" class="formgrid"><div class="formrow">'+field('訂位姓名','name','text','','placeholder="王小明" required maxlength="30"')+field('手機號碼','phone','tel','','placeholder="09xxxxxxxx" required pattern="09[0-9]{8}"')+'</div><div class="field"><label for="note">備註（選填）</label><textarea id="note" name="note" placeholder="兒童座椅、飲食需求等" maxlength="200"></textarea></div><button class="btn primary block" type="submit" '+(!selected?'disabled':'')+'>確認預約 →</button></form></div></div>'+
'<aside class="stack"><div class="card"><div class="eyebrow">YOUR RESERVATION</div><h2 style="margin:12px 0">'+esc(r.name)+'</h2><p style="font-size:13px;color:#607779">'+esc(r.subtitle)+'</p><div class="summaryline"><span>用餐日期</span><b>'+esc(date)+'</b></div><div class="summaryline"><span>用餐時間</span><b>'+(selected||'尚未選擇')+'</b></div><div class="summaryline"><span>用餐人數</span><b>'+esc(ui.party)+' 位</b></div><div class="summaryline"><span>店家位置</span><b>'+esc(r.area)+'</b></div></div><div class="alert">本頁只會建立瀏覽器內的示範預約，不會真的向餐廳訂位、寄簡訊或收取訂金。</div></aside></div>';
}
function bookingLookup(){
var list=ui.lookup?db.bookings.filter(function(b){return b.phone===ui.lookup;}).sort(function(a,b){return b.created-a.created;}):[];
return header('查詢我的訂位','輸入訂位時填寫的手機號碼，查看或取消此瀏覽器內的示範預約。')+
'<div class="card" style="max-width:700px"><div class="filterbar" style="padding-bottom:0"><div class="field search"><label>訂位手機</label><input id="lookupPhone" class="input" placeholder="09xxxxxxxx" value="'+esc(ui.lookup)+'"></div>'+button('查詢','lookup','','primary')+'</div></div><div style="height:20px"></div>'+
(list.length?list.map(function(b){var r=db.restaurants.find(function(x){return x.id===b.rid;});return '<div class="card" style="margin-bottom:12px"><div class="between"><div><div class="eyebrow">'+esc(b.id)+'</div><h3 style="margin:7px 0">'+esc(r?r.name:b.rid)+'</h3></div>'+tag(b.status)+'</div><div class="summaryline"><span>預約時間</span><b>'+esc(b.date)+' '+esc(b.time)+'</b></div><div class="summaryline"><span>預約人</span><b>'+esc(b.name)+'・'+esc(b.party)+' 位</b></div><div class="actions" style="margin-top:13px">'+(b.status!=='已取消'?button('取消預約','cancelBooking','data-id="'+b.id+'"','danger sm'):'')+'</div></div>';}).join(''):ui.lookup?empty('未找到此瀏覽器的預約資料'):empty('輸入手機號碼開始查詢'));
}
function join(){var r=current(),list=queues(r.id,today()).filter(activeQueue);
return header('不用在現場等，也不錯過美好','領取示範候位號碼，即可觀看目前叫號進度。',button('開啟候位看板','goto','data-page="board"'))+
'<div class="split"><div class="stack"><div class="card"><h3>現場候位登記</h3><p class="muted" style="font-size:13px">取得專屬序號，追蹤前方還有幾組客人。</p><form id="queueForm" class="formgrid">'+select('選擇餐廳','joinRid',db.restaurants.map(function(x){return [x.id,x.name];}),ui.rid)+'<div class="formrow">'+field('稱呼','qname','text','','required maxlength="30" placeholder="王小姐"')+field('手機號碼','qphone','tel','','required pattern="09[0-9]{8}" placeholder="09xxxxxxxx"')+'</div>'+select('用餐人數','qparty',[1,2,3,4,5,6,7,8].map(function(n){return [n,n+' 位'];}),ui.party)+'<button class="btn primary block" type="submit">立即取號 →</button></form></div><div class="alert">同一家店、同一天，同一支手機不能重複取得有效候位號碼。此為本機示範，不會傳送 LINE 或簡訊。</div></div>'+
'<div class="stack"><div class="card"><div class="eyebrow">QUEUE STATUS / TODAY</div><h2 style="margin:12px 0">'+esc(r.name)+'</h2><div class="grid g2"><div><small>目前候位</small><h1 style="margin:8px 0">'+list.length+' <span style="font-size:14px">組</span></h1></div><div><small>已叫號</small><h1 style="margin:8px 0">'+queues(r.id,today()).filter(function(x){return x.called;}).length+' <span style="font-size:14px">組</span></h1></div></div>'+button('查看公開叫號進度','goto','data-page="board"','block')+'</div><div class="card"><h3>候位流程</h3><div class="stack"><p style="font-size:13px;margin:0">① 顧客登記姓名、電話與人數</p><p style="font-size:13px;margin:0">② 系統依序分配號碼</p><p style="font-size:13px;margin:0">③ 店家叫號、入座或標記過號</p><p style="font-size:13px;margin:0">④ 看板即時呈現最新叫號結果</p></div></div></div></div>';
}
function board(){
var r=current(),all=queues(r.id,today()),called=all.filter(function(q){return q.called&&q.status!=='已取消';}).sort(function(a,b){return b.called-a.called;})[0],waiting=all.filter(function(q){return q.status==='候位中';}).sort(function(a,b){return a.created-b.created;}).slice(0,7);
return header('公開候位看板','大螢幕與手機皆可查看，示範資料在同一瀏覽器的分頁間同步。','<div style="min-width:160px">'+restaurantSelect()+'</div>')+
'<div class="board"><div class="between"><div><div class="boardlabel">'+esc(r.name)+' · 今日叫號</div><div class="boardlabel" style="margin-top:10px;color:#ecf4ed">NOW SERVING</div></div><span class="previewflag">DEMO</span></div><div class="now">'+(called?esc(called.number):'尚未叫號')+'</div><div class="boardlabel">即將輪到</div><div class="waiting" style="margin-top:15px">'+(waiting.length?waiting.map(function(q){return '<span>'+esc(q.number)+'</span>';}).join(''):'<span style="font-size:18px">目前無候位</span>')+'</div><div class="boardfoot">目前尚有 '+all.filter(activeQueue).length+' 組進行中的候位 · 本機資料自動同步</div></div>'+
'<div class="actions" style="margin-top:16px">'+button('店家叫號管理','goto','data-page="queue"','primary')+button('進入全螢幕','fullscreen','','')+'</div>';
}
function dashboard(){
var r=current(),b=bookings(r.id,today()),q=queues(r.id,today()),waiting=q.filter(activeQueue),confirmed=b.filter(function(x){return x.status==='已確認';}),done=q.filter(function(x){return x.status==='已入座'||x.status==='已完成';});
return header('營運總覽','今日營運狀況與跨功能捷徑。','<div style="min-width:175px">'+restaurantSelect()+'</div>')+
'<div class="grid g4 kpis">'+
kpi('今日訂位',b.filter(activeBooking).length,'與當日日期連動','▦')+
kpi('待處理訂位',b.filter(function(x){return x.status==='待確認';}).length,'需要確認的訂位','◎')+
kpi('目前候位',waiting.length,'候位中與已叫號','≋')+
kpi('已安排入座',done.length,'候位已入座或完成','◈')+'</div>'+
'<div style="height:24px"></div><section class="hero" style="min-height:220px"><div class="copy"><div class="eyebrow">LIVE OPERATIONS DEMO</div><h1 style="font-size:30px">每一個現場細節，<br>都能順暢接力。</h1><p>資料在本瀏覽器中即時保存。操作列表與看板，體驗狀態如何同步改變。</p><div class="actions">'+button('管理今日訂位','goto','data-page="reservations"','primary')+button('進入叫號管理','goto','data-page="queue"','')+'</div></div><div class="heroart"><div class="ticket"><span>TODAY BOOKINGS</span><b>'+String(confirmed.length).padStart(2,'0')+'</b><small>'+esc(r.name)+'・已確認</small></div></div></section>'+
'<div style="height:24px"></div><div class="grid g2"><div class="card"><div class="sectiontitle"><h2>今日訂位</h2><button class="btn sm" data-route="reservations">查看全部 →</button></div>'+
(b.length?b.slice(0,4).map(function(x){return '<div class="queueitem"><div class="queuenum">'+esc(x.time)+'</div><div class="qmeta"><b>'+esc(x.name)+'・'+esc(x.party)+' 位</b><small>'+esc(x.note||'無備註')+'</small></div>'+tag(x.status)+'</div>';}).join(''):empty())+'</div><div class="card"><div class="sectiontitle"><h2>候位進度</h2><button class="btn sm" data-route="queue">管理候位 →</button></div>'+
(q.length?q.slice(-5).map(function(x){return '<div class="queueitem"><div class="queuenum">'+esc(x.number)+'</div><div class="qmeta"><b>'+esc(x.name)+'・'+esc(x.party)+' 位</b><small>登記 '+formatClock(x.created)+'</small></div>'+tag(x.status)+'</div>';}).join(''):empty())+'</div></div>';
}
function kpi(label,val,hint,icon){return '<div class="card kpi"><div class="between"><span class="label">'+label+'</span><span class="symbol">'+icon+'</span></div><strong>'+val+'</strong><span class="hint">'+hint+'</span></div>';}
function reservationList(){
var r=current(),list=bookings(r.id,ui.tab==='all'?'':today()).filter(function(b){return ui.filter==='全部'||b.status===ui.filter;}).filter(function(b){return !ui.search||[b.name,b.phone,b.id].join(' ').includes(ui.search);}).sort(function(a,b){return a.date.localeCompare(b.date)||a.time.localeCompare(b.time);});
return header('訂位管理','查看訂位、確認、修改、取消及安排入座。',restaurantSelect()+button('新增訂位','newBooking','','primary'))+
'<div class="card"><div class="tabs"><button class="tab '+(ui.tab!=='all'?'active':'')+'" data-action="tab" data-value="today">今日訂位</button><button class="tab '+(ui.tab==='all'?'active':'')+'" data-action="tab" data-value="all">全部日期</button></div><div class="filterbar">'+select('訂位狀態','bookingStatusFilter',['全部','待確認','已確認','已入座','已完成','已取消'],ui.filter)+'<div class="field search"><label>搜尋訂位</label><input id="bookingSearch" class="input" value="'+esc(ui.search)+'" placeholder="姓名、電話或訂位編號"></div>'+button('搜尋','searchBooking','','')+'</div><div class="tablewrap"><table class="datatable"><thead><tr><th>日期 / 時間</th><th>訂位人</th><th>人數</th><th>狀態</th><th>桌號</th><th>操作</th></tr></thead><tbody>'+
(list.length?list.map(function(b){return '<tr><td><b>'+esc(b.date)+'</b><br><small>'+esc(b.time)+'　'+esc(b.id)+'</small></td><td><b>'+esc(b.name)+'</b><br><small>'+esc(b.phone)+'</small></td><td>'+b.party+' 位</td><td>'+tag(b.status)+'</td><td>'+esc(b.table||'—')+'</td><td><div class="actions">'+button('詳細 / 編輯','editBooking','data-id="'+esc(b.id)+'"','sm')+(b.status==='待確認'?button('確認','updateBooking','data-id="'+esc(b.id)+'" data-status="已確認"','sm primary'):'')+'</div></td></tr>';}).join(''):'<tr><td colspan="6">'+empty('試著切換日期或新增訂位')+'</td></tr>')+'</tbody></table></div></div>';
}
function queueAdmin(){
var r=current(),all=queues(r.id,today()),list=all.filter(function(q){return ui.queueFilter==='全部'||(ui.queueFilter==='進行中'?activeQueue(q):q.status===ui.queueFilter);}).sort(function(a,b){return a.created-b.created;});
return header('候位管理','叫號、過號、入座與恢復操作，所有狀態都保留紀錄。',restaurantSelect()+button('新增現場候位','newQueue','','primary'))+
'<div class="grid g3" style="margin-bottom:17px">'+kpi('候位中',all.filter(function(q){return q.status==='候位中';}).length,'尚未叫號','≋')+kpi('已叫號',all.filter(function(q){return q.status==='已叫號';}).length,'可繼續叫下一位','◷')+kpi('已入座',all.filter(function(q){return q.status==='已入座';}).length,'可持續服務其他桌','◈')+'</div>'+
'<div class="card"><div class="between stackmobile" style="margin-bottom:15px"><div class="actions">'+button('叫下一組','nextQueue','','primary')+button('公開看板','goto','data-page="board"','')+'</div>'+select('篩選狀態','queueStatusFilter',['進行中','全部','候位中','已叫號','過號','已入座','已完成','已取消'],ui.queueFilter)+'</div>'+
(list.length?list.map(function(q){return '<div class="queueitem"><div class="queuenum">'+esc(q.number)+'</div><div class="qmeta"><b>'+esc(q.name)+'・'+q.party+' 位</b><small>'+esc(q.phone)+'　抽號 '+formatClock(q.created)+'</small></div>'+tag(q.status)+'<div class="actions">'+
(q.status==='候位中'?button('叫號','queueAction','data-id="'+q.id+'" data-status="已叫號"','primary sm'):'')+
(q.status==='已叫號'?button('重叫','recall','data-id="'+q.id+'"','sm'):'')+
(['候位中','已叫號','過號'].includes(q.status)?button('入座','queueAction','data-id="'+q.id+'" data-status="已入座"','sm'):'')+
(['候位中','已叫號'].includes(q.status)?button('過號','queueAction','data-id="'+q.id+'" data-status="過號"','sm'):'')+
(q.status==='已入座'?button('完成','queueAction','data-id="'+q.id+'" data-status="已完成"','sm'):'')+
(!activeQueue(q)?button('恢復候位','queueAction','data-id="'+q.id+'" data-status="候位中"','sm'):'')+
button('編輯','editQueue','data-id="'+q.id+'"','sm')+'</div></div>';}).join(''):empty('目前篩選沒有候位資料'))+'</div>';
}
function tables(){return [{id:'A1',seats:2},{id:'A2',seats:4},{id:'A3',seats:4},{id:'B1',seats:2},{id:'B2',seats:6},{id:'B3',seats:4}];}
function floor(){
var r=current(),b=bookings(r.id,today()).filter(function(x){return activeBooking(x)&&x.table;});
return header('現場桌位圖','點選桌號安排或釋放桌位。桌位配置為示意，不代表 inline 實際排版。',restaurantSelect()+button('新增訂位','newBooking','','primary'))+
'<div class="split"><div class="card"><div class="between"><h3>今日桌位配置</h3><div class="flex"><span class="tag success">可用</span><span class="tag warning">已安排</span></div></div><div class="floor">'+tables().map(function(t){var occup=b.find(function(x){return x.table===t.id;});return '<button class="flooritem '+(occup?'busy':'')+'" data-action="table" data-id="'+t.id+'"><b>'+t.id+'</b><small>'+t.seats+'人桌・'+(occup?esc(occup.name):'可安排')+'</small></button>';}).join('')+'</div></div><div class="card"><h3>桌位使用說明</h3><p class="muted" style="font-size:13px">點選空桌可安排當日訂位；已安排的桌子可查看訂位並解除指派。</p><div class="summaryline"><span>桌位總數</span><b>'+tables().length+' 桌</b></div><div class="summaryline"><span>已安排</span><b>'+b.length+' 桌</b></div><div class="summaryline"><span>剩餘空桌</span><b>'+Math.max(0,tables().length-b.length)+' 桌</b></div>'+button('前往訂位管理','goto','data-page="reservations"','block')+'</div></div>';
}
function customerList(){
var r=current(),map={};db.bookings.concat(db.queues).filter(function(x){return x.rid===r.id;}).forEach(function(x){if(!map[x.phone])map[x.phone]={phone:x.phone,name:x.name,count:0,last:0};map[x.phone].count++;map[x.phone].last=Math.max(map[x.phone].last,x.created);});
var entries=Object.values(map).sort(function(a,b){return b.last-a.last;});
return header('顧客管理','跨訂位、候位整理本店顧客；加入 VIP 與服務備註。',restaurantSelect())+
'<div class="grid g3" style="margin-bottom:18px">'+kpi('顧客人數',entries.length,'依本店電話號碼去重','♧')+kpi('VIP 顧客',entries.filter(function(c){return db.customers[c.phone]&&db.customers[c.phone].vip;}).length,'示範顧客標記','★')+kpi('服務紀錄',db.bookings.concat(db.queues).filter(function(x){return x.rid===r.id;}).length,'訂位與候位總筆數','◈')+'</div>'+
'<div class="card"><div class="tablewrap"><table class="datatable"><thead><tr><th>顧客</th><th>聯絡電話</th><th>歷史紀錄</th><th>最近登記</th><th>標籤</th><th>操作</th></tr></thead><tbody>'+
(entries.length?entries.map(function(c){var s=db.customers[c.phone]||{};return '<tr><td><b>'+esc(c.name)+'</b></td><td>'+esc(c.phone)+'</td><td>'+c.count+' 次</td><td>'+formatDate(today())+' '+formatClock(c.last)+'</td><td>'+(s.vip?'<span class="tag warning">★ VIP</span>':'<span class="tag">一般顧客</span>')+'</td><td>'+button('檢視 / 編輯','editCustomer','data-phone="'+esc(c.phone)+'" data-name="'+esc(c.name)+'"','sm')+'</td></tr>';}).join(''):'<tr><td colspan="6">'+empty('先建立訂位或候位資料')+'</td></tr>')+'</tbody></table></div></div>';
}
var menuItems=[['m1','經典蔬菜沙拉',220,'🥗'],['m2','香煎雞腿定食',330,'🍱'],['m3','奶油野菇義大利麵',360,'🍝'],['m4','檸檬氣泡飲',130,'🍋'],['m5','手作提拉米蘇',180,'🍰'],['m6','精品拿鐵',150,'☕']];
function orders(){
var r=current(),o=db.orders.filter(function(x){return x.rid===r.id;}).sort(function(a,b){return b.created-a.created;});
return header('餐點訂單','體驗簡易點餐、備餐、出餐狀態管理。',restaurantSelect()+button('顧客點餐介面','newOrder','','primary'))+
'<div class="grid g3" style="margin-bottom:17px">'+kpi('待製作',o.filter(function(x){return x.status==='待製作';}).length,'新成立訂單','◷')+kpi('製作中',o.filter(function(x){return x.status==='製作中';}).length,'廚房處理中','♨')+kpi('已完成',o.filter(function(x){return x.status==='已完成';}).length,'已出餐訂單','✓')+'</div><div class="card"><div class="sectiontitle"><h2>訂單列表</h2><span class="note">結帳與金流皆為示範，不收款</span></div>'+
(o.length?o.map(function(x){return '<div class="queueitem"><div class="queuenum" style="font-size:12px">'+esc(x.id.slice(-4))+'</div><div class="qmeta"><b>'+esc(x.name)+'　NT$'+x.total+'</b><small>'+esc(x.items.map(function(i){return i.name+'×'+i.qty;}).join('、'))+'　'+formatClock(x.created)+'</small></div>'+tag(x.status)+
'<div class="actions">'+(x.status==='待製作'?button('開始製作','orderAction','data-id="'+x.id+'" data-status="製作中"','sm primary'):'')+(x.status==='製作中'?button('完成出餐','orderAction','data-id="'+x.id+'" data-status="已完成"','sm primary'):'')+button('詳細','viewOrder','data-id="'+x.id+'"','sm')+'</div></div>';}).join(''):empty('點「顧客點餐介面」新增一張示範訂單'))+'</div>';
}
function reports(){
var r=current(),data=Array.from({length:7},function(_,i){var d=today(i-6);return {d:d,b:bookings(r.id,d).filter(activeBooking).length,q:queues(r.id,d).length};});
var max=Math.max(1,...data.map(function(x){return x.b+x.q;}));
return header('營運報表','按日期彙整示範訂位與候位量，觀察現場需求。',restaurantSelect())+
'<div class="grid g3" style="margin-bottom:18px">'+kpi('近 7 日訂位',data.reduce(function(s,x){return s+x.b;},0),'不含已取消','▦')+kpi('近 7 日候位',data.reduce(function(s,x){return s+x.q;},0),'含已完成記錄','≋')+kpi('全部訂單總額','NT$'+db.orders.filter(function(x){return x.rid===r.id;}).reduce(function(s,x){return s+x.total;},0),'示範數據，不代表實際營收','◈')+'</div>'+
'<div class="card"><div class="sectiontitle"><h2>每日需求量</h2><span class="note">訂位 + 候位登記</span></div><div class="barlist">'+data.map(function(x){var total=x.b+x.q;return '<div class="barline"><b>'+formatDate(x.d)+'</b><div class="barbg"><div class="barfill" style="width:'+Math.max(total?2:0,Math.round(total/max*100))+'%"></div></div><span>'+total+' 組</span></div>';}).join('')+'</div><div class="alert" style="margin-top:24px">此為瀏覽器內的測試資料統計，沒有串接 POS、實際金流、電話或客戶資料。</div></div>';
}
function settings(){var r=current();return header('商家設定','自由調整示範餐廳資料、開放時段與容量，立即影響顧客預約頁面。',restaurantSelect()+button('重設所有示範資料','reset','','danger'))+
'<div class="split"><div class="card"><h3>門市基本資料</h3><form id="settingsForm" class="formgrid">'+field('店家名稱','shopName','text',r.name,'required maxlength="60"')+field('所在區域','shopArea','text',r.area,'required maxlength="60"')+field('店家簡介','shopSubtitle','text',r.subtitle,'maxlength="90"')+
'<div class="formrow">'+field('單時段最多可預約人數','shopCapacity','number',r.capacity,'required min="1" max="100"')+field('用餐時間（分鐘）','shopDuration','number',r.duration,'required min="15" max="240"')+'</div>'+field('可訂位時段（以逗號分隔）','shopSlots','text',r.slots.join(', '),'required')+'<button class="btn primary" type="submit">儲存設定</button></form></div>'+
'<div class="card"><h3>展示資料與串接限制</h3><p class="muted" style="font-size:13px">目前此網站為測試用純前端 SPA。</p><div class="summaryline"><span>資料存放</span><b>目前瀏覽器 localStorage</b></div><div class="summaryline"><span>跨裝置同步</span><b>尚未實作</b></div><div class="summaryline"><span>LINE / SMS 通知</span><b>尚未串接</b></div><div class="summaryline"><span>真實訂位與金流</span><b>不提供</b></div><div class="summaryline"><span>正式會員驗證</span><b>尚未實作</b></div><div class="alert" style="margin-top:20px">請勿輸入真實顧客的個資或付款資訊。這個示範網站不適合作為正式營運系統。</div></div></div>';
}
function render(){
ui.menuOpen=false;
var page=route(),fn={home:home,discover:discover,book:book,join:join,lookup:bookingLookup,board:board,dashboard:dashboard,reservations:reservationList,queue:queueAdmin,floor:floor,customers:customerList,orders:orders,reports:reports,settings:settings}[page];
document.title=(titles[page]||'體驗')+' · SeatFlow';
shell(fn());if(ui.modal)showModal(ui.modal);
}
function modal(title,body){ui.modal='<div class="modalback" id="modalback"><div class="modal" role="dialog" aria-modal="true" aria-label="'+esc(title)+'"><div class="modalhead"><h2>'+esc(title)+'</h2><button type="button" class="xbtn" data-action="close" aria-label="關閉">×</button></div>'+body+'</div></div>';showModal(ui.modal);}
function showModal(markup){var node=document.createElement('div');node.id='modal-host';node.innerHTML=markup;var old=document.getElementById('modal-host');if(old)old.remove();document.body.appendChild(node);}
function close(){ui.modal='';var m=document.getElementById('modal-host');if(m)m.remove();}
function announce(type,label){db.events.unshift({id:uid('EV'),type:type,text:label,created:Date.now()});db.events=db.events.slice(0,100);}
function bookingFormSubmit(form){
var fd=new FormData(form),r=current(),name=String(fd.get('name')||'').trim(),phone=String(fd.get('phone')||'').trim();
if(!ui.slot||!slotAvailability(r,today(ui.day),ui.slot,ui.party))return toast('此時段已滿，請重選');
if(!/^09[0-9]{8}$/.test(phone)||!name)return toast('請填寫姓名與正確的台灣手機號碼');
if(db.bookings.some(function(b){return b.rid===r.id&&b.date===today(ui.day)&&b.time===ui.slot&&b.phone===phone&&activeBooking(b);})){return toast('同一手機在相同時段已經有訂位');}
var b={id:uid('R'),rid:r.id,date:today(ui.day),time:ui.slot,name:name,phone:phone,party:Number(ui.party),note:String(fd.get('note')||'').trim(),status:'待確認',created:Date.now(),table:''};
db.bookings.push(b);announce('booking','新訂位 '+b.id);save();ui.slot='';modal('訂位建立成功','<div class="result"><b>訂位編號：'+esc(b.id)+'</b><br>'+esc(r.name)+'<br>'+esc(b.date)+' '+esc(b.time)+'・'+b.party+' 位<br>訂位人：'+esc(b.name)+'</div><p class="notice" style="margin-top:14px">這是示範預約，沒有真的向餐廳送出。</p><div class="actions">'+button('查看我的訂位','lookupNew','data-phone="'+esc(b.phone)+'"','primary')+button('繼續操作','close','','')+'</div>');}
function queueFormSubmit(form){
var fd=new FormData(form),r=current(),phone=String(fd.get('qphone')||'').trim(),name=String(fd.get('qname')||'').trim(),party=Number(fd.get('qparty')||2);
if(!/^09[0-9]{8}$/.test(phone)||!name)return toast('請填寫姓名與正確的台灣手機號碼');
if(queues(r.id,today()).some(function(q){return q.phone===phone&&activeQueue(q);}))return toast('此手機已有進行中的候位號碼');
var count=queues(r.id,today()).length+1,num='A'+String(count).padStart(3,'0');
var q={id:uid('Q'),rid:r.id,date:today(),number:num,name:name,phone:phone,party:party,status:'候位中',created:Date.now(),called:null};
db.queues.push(q);announce('queue','新增候位 '+num);save();modal('取號成功','<div class="card" style="text-align:center;background:#eaf6f0"><div class="eyebrow">YOUR QUEUE NUMBER</div><h1 style="font-size:65px;margin:10px 0">'+num+'</h1><p>'+esc(r.name)+'　·　'+party+' 位</p><p class="notice">前方 '+queues(r.id,today()).filter(function(x){return activeQueue(x)&&x.created<q.created;}).length+' 組</p></div><div class="actions" style="margin-top:15px">'+button('查看候位看板','goto','data-page="board"','primary')+button('關閉','close','','')+'</div>');}
function formBookingModal(existing){
var b=existing||{id:'',date:today(),time:current().slots[0],name:'',phone:'',party:2,note:'',status:'待確認',table:''};
var r=current();modal(existing?'編輯訂位':'新增現場訂位','<form id="staffBookingForm" class="formgrid"><input type="hidden" name="id" value="'+esc(b.id)+'">'+
'<div class="formrow">'+field('訂位日期','date','date',b.date,'required')+select('訂位時段','time',r.slots,b.time)+'</div><div class="formrow">'+field('訂位人姓名','name','text',b.name,'required maxlength="30"')+field('電話','phone','tel',b.phone,'required pattern="09[0-9]{8}"')+'</div><div class="formrow">'+select('人數','party',[1,2,3,4,5,6,7,8],b.party)+select('訂位狀態','status',['待確認','已確認','已入座','已完成','已取消'],b.status)+'</div><div class="formrow">'+field('備註','note','text',b.note)+select('安排桌號','table',[['','未安排']].concat(tables().map(function(t){return t.id;})),b.table)+'</div><button class="btn primary block" type="submit">儲存訂位</button></form>');
}
function formQueueModal(existing){
var q=existing||{id:'',name:'',phone:'',party:2,status:'候位中'},number=existing?'<p class="result">候位編號：'+esc(existing.number)+'</p>':'';
modal(existing?'編輯候位':'新增現場候位',number+'<form id="staffQueueForm" class="formgrid"><input type="hidden" name="id" value="'+esc(q.id)+'"><div class="formrow">'+field('稱呼','name','text',q.name,'required maxlength="30"')+field('手機號碼','phone','tel',q.phone,'required pattern="09[0-9]{8}"')+'</div><div class="formrow">'+select('人數','party',[1,2,3,4,5,6,7,8],q.party)+select('狀態','status',['候位中','已叫號','過號','已入座','已完成','已取消'],q.status)+'</div><button class="btn primary block" type="submit">儲存候位資料</button></form>');
}
function nextQueue(){
var q=queues(ui.rid,today()).filter(function(x){return x.status==='候位中';}).sort(function(a,b){return a.created-b.created;})[0];
if(!q)return toast('沒有尚未叫號的候位');
q.status='已叫號';q.called=Date.now();announce('call','叫號 '+q.number);save();render();toast('已叫號 '+q.number);
}
function tableModal(tableId){
var occup=bookings(ui.rid,today()).find(function(b){return b.table===tableId&&activeBooking(b);});
if(occup){modal('桌位 '+tableId,'<p>目前安排：<b>'+esc(occup.name)+'</b>，'+occup.party+' 位，'+esc(occup.time)+'</p><div class="actions">'+button('查看訂位','editBooking','data-id="'+esc(occup.id)+'"','primary')+button('清空此桌','clearTable','data-id="'+esc(occup.id)+'"','danger')+'</div>');return;}
var opts=bookings(ui.rid,today()).filter(function(b){return activeBooking(b)&&!b.table;});
modal('安排桌位 '+tableId,opts.length?'<form id="assignTableForm" class="formgrid"><input type="hidden" name="table" value="'+tableId+'">'+select('選擇今日訂位','bookingId',opts.map(function(b){return [b.id,b.time+' '+b.name+'・'+b.party+' 位'];}),opts[0].id)+'<button class="btn primary" type="submit">安排此桌</button></form>':empty('目前沒有未分配桌位的訂位'));
}
function orderModal(){ui.cart={};displayOrderModal();}
function displayOrderModal(){
var rows=menuItems.map(function(i){var n=ui.cart[i[0]]||0;return '<div class="orderrow"><div class="miniicon">'+i[3]+'</div><div class="title"><b>'+esc(i[1])+'</b><br><small>NT$'+i[2]+'</small></div><button class="btn sm" data-action="cartMinus" data-id="'+i[0]+'">−</button><b>'+n+'</b><button class="btn sm" data-action="cartPlus" data-id="'+i[0]+'">＋</button></div>';}).join('');
var total=menuItems.reduce(function(s,i){return s+(ui.cart[i[0]]||0)*i[2];},0);
modal('建立示範點餐訂單','<form id="orderForm" class="formgrid">'+field('顧客稱呼','orderName','text','','required placeholder="如：王小姐" maxlength="30"')+'<div>'+rows+'</div><div class="between"><b>合計</b><h2 style="margin:0">NT$'+total+'</h2></div><button class="btn primary block" type="submit" '+(!total?'disabled':'')+'>送出點餐訂單</button></form>');
}
function customerModal(phone,name){
var c=db.customers[phone]||{};modal('顧客檔案','<form id="customerForm" class="formgrid"><input type="hidden" name="phone" value="'+esc(phone)+'"><div class="result"><b>'+esc(name)+'</b><br>'+esc(phone)+'</div><label class="switch"><input type="checkbox" name="vip" '+(c.vip?'checked':'')+'> 設為 VIP 顧客</label><div class="field"><label>服務偏好與備註</label><textarea name="note" maxlength="300">'+esc(c.note||'')+'</textarea></div><button class="btn primary" type="submit">儲存顧客資料</button></form>');
}
function interact(action,target){
var id=target.dataset.id,st=target.dataset.status,pg=target.dataset.page,phone=target.dataset.phone,day=target.dataset.day;
if(action==='goto'){close();go(pg);return;}
if(action==='choose'){ui.rid=id;ui.slot='';go(pg);return;}
if(action==='menu'){ui.menuOpen=!ui.menuOpen;var s=document.getElementById('sidebar');if(s)s.classList.toggle('open',ui.menuOpen);return;}
if(action==='day'){ui.day=Number(day);ui.slot='';render();return;}
if(action==='slot'){ui.slot=target.dataset.time;render();return;}
if(action==='close'){close();return;}
if(action==='searchDiscover'){ui.publicSearch=(document.getElementById('discoverSearch')||{}).value||'';render();return;}
if(action==='searchBooking'){ui.search=(document.getElementById('bookingSearch')||{}).value||'';render();return;}
if(action==='lookup'){ui.lookup=((document.getElementById('lookupPhone')||{}).value||'').trim();render();return;}
if(action==='lookupNew'){ui.lookup=phone;close();go('lookup');return;}
if(action==='tab'){ui.tab=target.dataset.value;render();return;}
if(action==='fullscreen'){var x=document.querySelector('.board');if(x&&x.requestFullscreen)x.requestFullscreen().catch(function(){toast('此瀏覽器不支援全螢幕');});return;}
if(action==='newBooking'){formBookingModal(null);return;}
if(action==='editBooking'){formBookingModal(db.bookings.find(function(b){return b.id===id;}));return;}
if(action==='updateBooking'){var b=db.bookings.find(function(x){return x.id===id;});if(b){b.status=st;save();render();toast('訂位狀態已更新');}return;}
if(action==='cancelBooking'){if(!confirm('確定取消這筆示範預約？'))return;var b=db.bookings.find(function(x){return x.id===id;});if(b){b.status='已取消';save();render();toast('已取消預約');}return;}
if(action==='nextQueue'){nextQueue();return;}
if(action==='newQueue'){formQueueModal(null);return;}
if(action==='editQueue'){formQueueModal(db.queues.find(function(q){return q.id===id;}));return;}
if(action==='queueAction'){var q=db.queues.find(function(x){return x.id===id;});if(q){q.status=st;if(st==='已叫號')q.called=Date.now();announce('queue',q.number+' → '+st);save();render();toast(q.number+' 已更新為 '+st);}return;}
if(action==='recall'){var q=db.queues.find(function(x){return x.id===id;});if(q){q.called=Date.now();announce('call','重叫 '+q.number);save();render();toast('已重叫 '+q.number);}return;}
if(action==='table'){tableModal(id);return;}
if(action==='clearTable'){var b=db.bookings.find(function(x){return x.id===id;});if(b){b.table='';save();close();render();toast('桌位已釋放');}return;}
if(action==='editCustomer'){customerModal(phone,target.dataset.name);return;}
if(action==='newOrder'){orderModal();return;}
if(action==='cartPlus'||action==='cartMinus'){ui.cart[id]=Math.max(0,(ui.cart[id]||0)+(action==='cartPlus'?1:-1));var name=document.querySelector('#orderForm [name="orderName"]');var preserved=name?name.value:'';displayOrderModal();var fld=document.querySelector('#orderForm [name="orderName"]');if(fld)fld.value=preserved;return;}
if(action==='orderAction'){var o=db.orders.find(function(x){return x.id===id;});if(o){o.status=st;save();render();toast('訂單已更新');}return;}
if(action==='viewOrder'){var o=db.orders.find(function(x){return x.id===id;});if(o)modal('訂單 '+o.id,'<div class="result">顧客：'+esc(o.name)+'<br>訂單狀態：'+esc(o.status)+'</div>'+o.items.map(function(i){return '<div class="summaryline"><span>'+esc(i.name)+' × '+i.qty+'</span><b>NT$'+i.qty*i.price+'</b></div>';}).join('')+'<div class="summaryline"><b>總計</b><b>NT$'+o.total+'</b></div>');return;}
if(action==='reset'){if(confirm('這會清除目前瀏覽器中所有 SeatFlow 示範資料，確定繼續嗎？')){db=seed();ui.rid='green';save();render();toast('已重設示範資料');}return;}
}
document.addEventListener('click',function(ev){
var t=ev.target.closest('[data-route],[data-action]');if(!t){if(ev.target.id==='modalback')close();return;}
if(t.dataset.route){close();go(t.dataset.route);return;}
interact(t.dataset.action,t);
});
document.addEventListener('change',function(ev){
var t=ev.target;
if(t.dataset.change==='rid'){ui.rid=t.value;ui.slot='';render();return;}
if(t.name==='bookRid'||t.name==='joinRid'){ui.rid=t.value;ui.slot='';render();return;}
if(t.name==='bookParty'||t.name==='qparty'){ui.party=Number(t.value);ui.slot='';render();return;}
if(t.name==='bookingStatusFilter'){ui.filter=t.value;render();return;}
if(t.name==='queueStatusFilter'){ui.queueFilter=t.value;render();return;}
});
document.addEventListener('submit',function(ev){
var form=ev.target,id=form.id;if(!id)return;ev.preventDefault();var f=new FormData(form);
if(id==='bookingForm'){bookingFormSubmit(form);return;}
if(id==='queueForm'){queueFormSubmit(form);return;}
if(id==='staffBookingForm'){
var old=db.bookings.find(function(b){return b.id===f.get('id');}),r=current();
var obj={rid:r.id,date:String(f.get('date')),time:String(f.get('time')),name:String(f.get('name')).trim(),phone:String(f.get('phone')).trim(),party:Number(f.get('party')),note:String(f.get('note')||''),status:String(f.get('status')),table:String(f.get('table')||'')};
if(!/^09[0-9]{8}$/.test(obj.phone))return toast('手機格式不正確');
if(obj.table&&db.bookings.some(function(b){return b.id!==(old?old.id:'')&&b.rid===r.id&&b.date===obj.date&&b.table===obj.table&&activeBooking(b);}))return toast('這張桌子已安排其他訂位');
if(old)Object.assign(old,obj);else db.bookings.push(Object.assign({id:uid('R'),created:Date.now()},obj));
announce('booking','店家編輯訂位');save();close();render();toast('訂位已儲存');return;
}
if(id==='staffQueueForm'){
var oldq=db.queues.find(function(q){return q.id===f.get('id');}),phone=String(f.get('phone')).trim(),status=String(f.get('status'));
if(!/^09[0-9]{8}$/.test(phone))return toast('手機格式不正確');
if(['候位中','已叫號'].includes(status)&&queues(ui.rid,today()).some(function(q){return q.id!==(oldq?oldq.id:'')&&q.phone===phone&&activeQueue(q);}))return toast('同一手機已有有效候位');
var o={rid:ui.rid,name:String(f.get('name')).trim(),phone:phone,party:Number(f.get('party')),status:status};
if(oldq){Object.assign(oldq,o);if(status==='已叫號'&&!oldq.called)oldq.called=Date.now();}
else{Object.assign(o,{id:uid('Q'),date:today(),number:'A'+String(queues(ui.rid,today()).length+1).padStart(3,'0'),created:Date.now(),called:status==='已叫號'?Date.now():null});db.queues.push(o);}
save();close();render();toast('候位資料已儲存');return;
}
if(id==='assignTableForm'){var booking=db.bookings.find(function(b){return b.id===f.get('bookingId');});if(booking){booking.table=String(f.get('table'));save();close();render();toast('桌位已安排');}return;}
if(id==='customerForm'){db.customers[String(f.get('phone'))]={vip:f.get('vip')==='on',note:String(f.get('note')||'')};save();close();render();toast('顧客資料已儲存');return;}
if(id==='orderForm'){
var items=menuItems.filter(function(m){return ui.cart[m[0]]>0;}).map(function(m){return {name:m[1],price:m[2],qty:ui.cart[m[0]]};});
if(!items.length)return toast('請先選擇餐點');
db.orders.push({id:uid('O'),rid:ui.rid,name:String(f.get('orderName')).trim(),items:items,total:items.reduce(function(s,x){return s+x.price*x.qty;},0),status:'待製作',created:Date.now()});save();close();render();toast('示範訂單已成立');return;
}
if(id==='settingsForm'){
var r=current(),slots=String(f.get('shopSlots')||'').split(/[,，]/).map(function(x){return x.trim();}).filter(Boolean);
if(!slots.length||slots.some(function(x){return !/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(x);}))return toast('請以 HH:MM, HH:MM 格式輸入時段');
r.name=String(f.get('shopName')).trim();r.area=String(f.get('shopArea')).trim();r.subtitle=String(f.get('shopSubtitle')).trim();r.capacity=Math.max(1,Number(f.get('shopCapacity')));r.duration=Math.max(15,Number(f.get('shopDuration')));r.slots=Array.from(new Set(slots)).sort();save();render();toast('店家設定已儲存');return;
}
});
window.addEventListener('hashchange',function(){close();window.scrollTo(0,0);render();});
window.addEventListener('storage',function(ev){if(ev.key===KEY){try{var latest=JSON.parse(ev.newValue);if(latest&&latest.restaurants){db=latest;render();}}catch(e){}}});
render();
})();
