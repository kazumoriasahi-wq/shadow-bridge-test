(()=>{'use strict';const L=GameLocale,Q=L.t;const $=id=>document.getElementById(id),C=$('world'),ctx=C.getContext('2d'),E=ShadowBridge,M=ShadowMusic.create(),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let index=0,cleared=[],sun={x:90,y:50},level,board,started=false,walking=false,walkTime=0,path=[],activePointer=null,paused=false,time=0,last=0,raf=null;let ready=false;const H=ShadowHost.create(globalThis.ytgame);const layout={x:24,y:214,sx:38,sy:31,w:34,h:27};
function save(){if(ready)H.update({schema:1,index,cleared,audio:H.hosted?H.data.audio:M.enabled,sun:{...sun}});}
function msg(text){if($('message').textContent!==text)$('message').textContent=text;}
function controls(){const locked=walking||!started||!ready||paused||!$('clear').hidden;for(const id of ['sun','direction','height','hint','retry'])$(id).disabled=locked;$('prev').disabled=locked||index===0;$('walk').disabled=locked||!board.connected;$('walk').classList.toggle('ready',board.connected&&!locked);$('walk').innerHTML=board.connected?Q('橋がつながった！ わたる <b>→</b>'):Q('影をつないで、わたろう <b>→</b>');}
function update(){const p=E.fromSun(sun.x,sun.y);board=E.board(level,p.slope,p.reach);$('sun').style.left=sun.x/390*100+'%';$('sun').style.top=sun.y/470*100+'%';$('direction').value=sun.x;$('height').value=sun.y;controls();if(started&&!walking&&!paused){msg(board.connected?Q('道ができました。光を向こう岸へ。'):index===0?Q('太陽を下げると、影が伸びます。'):Q('太陽を左右・上下に動かして、影をつなごう。'));}}
function load(n,persist=true){index=n;level=E.level(index);sun={x:index===0?195:index%2?305:85,y:45};walking=false;walkTime=0;path=[];$('clear').hidden=true;$('chapter').textContent='CHAPTER '+String(index+1).padStart(2,'0');$('completed').textContent=cleared.length+' / 12 CLEAR';update();if(persist)save();}
function beginMusic(){if(ready&&started&&!paused&&!H.paused&&$('dialog').open===false)void M.start();}
$('start').onclick=()=>{if(!ready||H.paused)return;started=true;$('welcome').hidden=true;update();beginMusic();};
function setSun(x,y){if(walking||!started||paused||!$('clear').hidden)return;sun={x:Math.max(35,Math.min(355,x)),y:Math.max(35,Math.min(145,y))};update();beginMusic();}
$('sun').addEventListener('pointerdown',e=>{if(e.button!==0||e.isPrimary===false||!started||walking||paused)return;activePointer=e.pointerId;$('sun').setPointerCapture(e.pointerId);e.preventDefault();beginMusic();});
$('sun').addEventListener('pointermove',e=>{if(activePointer!==e.pointerId)return;const r=C.getBoundingClientRect();setSun((e.clientX-r.left)/r.width*390,(e.clientY-r.top)/r.height*470);e.preventDefault();});
function cancel(){if(activePointer!==null){const id=activePointer;activePointer=null;try{$('sun').releasePointerCapture(id);}catch{}}}
for(const event of ['pointerup','pointercancel','lostpointercapture'])$('sun').addEventListener(event,e=>{if(e.pointerId===activePointer){cancel();save();}});
$('sun').addEventListener('keydown',e=>{const moves={ArrowLeft:[-5,0],ArrowRight:[5,0],ArrowUp:[0,-5],ArrowDown:[0,5]};if(moves[e.key]){e.preventDefault();setSun(sun.x+moves[e.key][0],sun.y+moves[e.key][1]);}});
for(const [id,axis]of [['direction','x'],['height','y']])$(id).oninput=e=>setSun(axis==='x'?Number(e.target.value):sun.x,axis==='y'?Number(e.target.value):sun.y);
$('walk').onclick=()=>{if(!board.connected||walking||paused||!started)return;cancel();walking=true;walkTime=0;path=board.path;controls();msg(Q('小さな光が、影の橋をわたっています。'));M.effect();beginMusic();};
$('next').onclick=()=>{if(H.paused||!ready)return;load((index+1)%12);beginMusic();};$('prev').onclick=()=>load(Math.max(0,index-1));$('retry').onclick=()=>load(index);
function modal(title,text){cancel();paused=true;M.stop();if(raf!==null)cancelAnimationFrame(raf);raf=null;$('dialogTitle').textContent=title;$('dialogText').textContent=text;$('dialog').showModal();controls();}
$('hint').onclick=()=>modal(Q('夕暮れのヒント'),index===0?Q('まずは右側の「影のながさ」を右へ。太陽が低くなると、塔の影が伸びます。影がゴールへ届いたら「わたる」を押しましょう。'):Q('塔の根元は、いつでも足場になります。\n影が次の塔の根元に重なるように、まず「影のむき」を調整。次に太陽を下げ、影を十分に伸ばしましょう。\n長さを整えてから、向きを少しずつ動かすのもコツです。'));
$('help').onclick=()=>modal(Q('太陽で、道をつくる。'),Q('空の太陽を指で左右・上下へ動かします。\n左右：影の向きが変わる。\n下へ：影が長くなる。上へ：短くなる。\n下の2本のスライダーでも調整できます。\n塔の足場と影のタイルをつなぎ、左の光から右の灯台まで道ができたら「わたる」。時間制限も失敗のペナルティもありません。\n音楽は「はじめる」後に流れます。音符でBGMと効果音を切替できます。'));
$('dialogOK').onclick=()=>{if(!H.paused)$('dialog').close();};$('dialog').onclose=()=>{paused=H.paused;controls();beginMusic();resumeLoop();};
$('audio').onclick=()=>{M.set(!M.enabled);$('audio').textContent=M.enabled?'♪':'♩';$('audio').setAttribute('aria-pressed',String(M.enabled));save();beginMusic();};
if(!H.hosted){document.addEventListener('visibilitychange',()=>{if(document.hidden){cancel();paused=true;M.stop();if(raf!==null)cancelAnimationFrame(raf);raf=null;}else if(!$('dialog').open){paused=false;controls();resumeLoop();}});window.addEventListener('blur',()=>{cancel();M.stop();});}
function clearLevel(){walking=false;if(!cleared.includes(index))cleared.push(index);save();$('completed').textContent=cleared.length+' / 12 CLEAR';$('clearText').textContent=index===11?Q('12の夕暮れをめぐりました。何度でも、影の道をつくれます。'):'CHAPTER '+String(index+1).padStart(2,'0')+' CLEAR';$('next').textContent=index===11?Q('最初の夕暮れへ ↗'):Q('次の夕暮れへ ↗');$('clear').hidden=false;M.effect(true);controls();msg(Q('光が向こう岸にたどり着きました。'));}
function cell(x,y){return{x:layout.x+x*layout.sx+layout.w/2,y:layout.y+y*layout.sy+layout.h/2};}
function orb(x,y,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
function tile(x,y,color,edge){const p=cell(x,y);ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(p.x-layout.w/2,p.y-layout.h/2,layout.w,layout.h,5);ctx.fill();if(edge){ctx.strokeStyle=edge;ctx.lineWidth=1;ctx.stroke();}}
function draw(){const w=C.clientWidth,h=C.clientHeight,dpr=Math.min(devicePixelRatio||1,2);if(C.width!==Math.round(w*dpr)||C.height!==Math.round(h*dpr)){C.width=Math.round(w*dpr);C.height=Math.round(h*dpr);}ctx.setTransform(C.width/390,0,0,C.height/470,0,0);const gradient=ctx.createLinearGradient(0,0,0,470);gradient.addColorStop(0,'#a8dfff');gradient.addColorStop(.35,'#f6d99d');gradient.addColorStop(.5,'#ffe8ad');gradient.addColorStop(.51,'#b4dfe4');gradient.addColorStop(1,'#8ec9dc');ctx.fillStyle=gradient;ctx.fillRect(0,0,390,470);
for(let i=0;i<23;i++){ctx.globalAlpha=.25+(reduce?.1:(Math.sin(time*.7+i)+1)*.12);orb((i*71+20)%390,(i*37)%160+12,i%4===0?1.2:.7,'#ffe6c0');}ctx.globalAlpha=1;
ctx.fillStyle='#9acbbd';ctx.beginPath();ctx.moveTo(0,225);for(let x=0;x<=390;x+=30)ctx.lineTo(x,195+Math.sin(x*.015)*17);ctx.lineTo(390,260);ctx.lineTo(0,260);ctx.fill();ctx.fillStyle='#b2d9ca';ctx.beginPath();ctx.moveTo(0,230);for(let x=0;x<=390;x+=35)ctx.lineTo(x,218+Math.cos(x*.012)*13);ctx.lineTo(390,280);ctx.lineTo(0,280);ctx.fill();
for(let y=0;y<E.H;y++)for(let x=0;x<E.W;x++){const k=E.key(x,y),p=cell(x,y);if(board.shadows.has(k))tile(x,y,board.connected?'#5a87b7':'#516c99',board.connected?'#b8d3b76b':'#74738e4d');else orb(p.x,p.y,1,'#b0a0bd30');}
if(board.connected&&board.path.length){ctx.strokeStyle='#fff0a8';ctx.lineWidth=3;ctx.setLineDash([5,5]);ctx.beginPath();board.path.forEach((p,i)=>{const v=cell(...p);i?ctx.lineTo(v.x,v.y):ctx.moveTo(v.x,v.y);});ctx.stroke();ctx.setLineDash([]);}for(const pos of [level.start,level.goal]){tile(...pos,'#ffd578','#f4d8aa99');const p=cell(...pos);ctx.fillStyle='#cc9a55';ctx.beginPath();ctx.moveTo(p.x-17,p.y+13);ctx.lineTo(p.x-8,p.y+31);ctx.lineTo(p.x+8,p.y+31);ctx.lineTo(p.x+17,p.y+13);ctx.fill();}
for(const t of level.towers){const p=cell(t.x,t.y);tile(t.x,t.y,'#cc92cc','#c4acb4');const height=22+t.height*15;ctx.fillStyle='#ffd38b';ctx.fillRect(p.x-7,p.y-height,14,height);ctx.fillStyle='#e8a66d';ctx.fillRect(p.x+1,p.y-height,6,height);ctx.fillStyle='#fff0b0';ctx.beginPath();ctx.moveTo(p.x-10,p.y-height);ctx.lineTo(p.x,p.y-height-7);ctx.lineTo(p.x+10,p.y-height);ctx.closePath();ctx.fill();ctx.fillStyle='#5c526c';ctx.fillRect(p.x-2,p.y-height+9,4,6);}
const goal=cell(...level.goal);ctx.strokeStyle='#e9d1a7';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(goal.x,goal.y);ctx.lineTo(goal.x,goal.y-24);ctx.stroke();ctx.shadowColor='#ffd59c';ctx.shadowBlur=12;orb(goal.x,goal.y-28,5,board.connected?'#ffe7b4':'#9f91a1');ctx.shadowBlur=0;
let p=cell(...level.start);if(walking&&path.length){const u=Math.min(path.length-1,walkTime*3.5),a=Math.floor(u),b=Math.min(path.length-1,a+1),pa=cell(...path[a]),pb=cell(...path[b]);p={x:pa.x+(pb.x-pa.x)*(u-a),y:pa.y+(pb.y-pa.y)*(u-a)};}ctx.shadowColor='#fff1c2';ctx.shadowBlur=18;orb(p.x,p.y-8,7,'#fff2ca');ctx.shadowBlur=0;orb(p.x-2,p.y-9,1,'#68617c');orb(p.x+2,p.y-9,1,'#68617c');orb(p.x,p.y-19,2,'#fff7da');
ctx.textAlign='center';ctx.font='8px system-ui';ctx.fillStyle='#3e6583';ctx.fillText('LIGHT',cell(...level.start).x,450);ctx.fillText('HOME',goal.x,450);
}
function loop(now){raf=null;const dt=Math.min(.05,(now-last)/1000||0);last=now;if(!paused){time+=dt;if(walking){walkTime+=dt;if(walkTime*3.5>=path.length-1)clearLevel();}draw();raf=requestAnimationFrame(loop);}}
function resumeLoop(){if(raf===null&&!paused){last=performance.now();raf=requestAnimationFrame(loop);}}

function audioUI(){$('audio').hidden=H.hosted;$('audio').textContent=M.enabled?'♪':'♩';$('audio').setAttribute('aria-pressed',String(M.enabled));}
for(const id of ['direction','height'])$(id).addEventListener('change',()=>save());
H.on(type=>{if(type==='save-error'){msg(Q('保存に失敗しました。次の操作や再開時に再試行します。'));return;}
 if(type==='audio'){if(H.hosted)M.set(H.audio);return;}
 paused=H.paused||$('dialog').open;document.querySelector('main').inert=H.paused||!ready;$('dialog').inert=H.paused;
 if(H.paused){cancel();if(ready)save();M.stop();if(raf!==null)cancelAnimationFrame(raf);raf=null;msg(Q('YouTubeの再開を待っています。'));}
 else{controls();resumeLoop();}
});
async function boot(){$('retryLoad').hidden=true;try{await Promise.all([H.init(),L.ready]);await H.whenActive();const d=H.data;cleared=d.cleared;load(d.index,false);if(d.sun){sun={...d.sun};update();}M.set(H.hosted?H.audio:d.audio);ready=true;audioUI();controls();$('startup').hidden=true;document.querySelector('main').inert=false;H.ready();resumeLoop();}
 catch{await H.whenActive();$('startupText').textContent=Q('保存データを読み込めませんでした。上書きせず停止しています。通信を確認して再試行してください。');$('retryLoad').hidden=false;}}
$('retryLoad').onclick=()=>{if(!H.paused)void boot();};
L.onChange(()=>{update();});load(0,false);draw();H.firstFrame();void boot();
})();
