(function(root){'use strict';
const W=9,H=7;
const specs=[[3,0,[1,4,7]],[2,1/3,[1,4,7]],[4,-1/3,[1,4,7]],[1,.5,[1,3,5,7]],[5,-.5,[1,3,5,7]],[2,2/3,[1,3,5]],[4,-2/3,[1,3,5]],[1,1/3,[1,3,6]],[5,-1/3,[1,3,6]],[2,.5,[1,3,5,7]],[4,-.5,[1,3,5,7]],[3,0,[1,3,5,7]]];
function level(i){const [row,slope,xs]=specs[i%specs.length];return{start:[0,row],goal:[8,Math.max(0,Math.min(6,row+Math.round(7*slope)))],towers:xs.map((x,n)=>({x,y:Math.max(0,Math.min(6,row+Math.round((x-1)*slope))),height:i<3?1:[1.1,.9,1.2,1][n]})),solution:{slope,reach:4.6}};}
const key=(x,y)=>x+','+y;
function trace(x0,y0,x1,y1){const cells=[];let x=x0,y=y0,dx=Math.abs(x1-x),dy=Math.abs(y1-y),sx=x<x1?1:-1,sy=y<y1?1:-1,err=dx-dy;for(let n=0;n<100;n++){cells.push([x,y]);if(x===x1&&y===y1)break;const twice=2*err;if(twice>-dy){err-=dy;x+=sx;cells.push([x,y]);}if(twice<dx){err+=dx;y+=sy;cells.push([x,y]);}}return cells;}
function board(l,slope,reach){const safe=new Set([key(...l.start),key(...l.goal)]),shadows=new Set();for(const t of l.towers){safe.add(key(t.x,t.y));const length=Math.max(0,Math.floor(reach*t.height));for(const [x,y]of trace(t.x,t.y,t.x+length,t.y+Math.round(length*slope)))if(x>=0&&x<W&&y>=0&&y<H){safe.add(key(x,y));shadows.add(key(x,y));}}
const queue=[l.start],seen=new Set([key(...l.start)]),prev=new Map();let end=null;for(let n=0;n<queue.length;n++){const [x,y]=queue[n];if(x===l.goal[0]&&y===l.goal[1]){end=[x,y];break;}for(const [dx,dy]of [[1,0],[0,1],[0,-1],[-1,0]]){const a=x+dx,b=y+dy,k=key(a,b);if(a>=0&&a<W&&b>=0&&b<H&&safe.has(k)&&!seen.has(k)){seen.add(k);prev.set(k,[x,y]);queue.push([a,b]);}}}const path=[];if(end){let p=end;while(p){path.unshift(p);p=prev.get(key(...p));}}return{safe,shadows,path,connected:!!end,reached:seen.size};}
function fromSun(x,y){return{slope:(Math.max(35,Math.min(355,x))-195)/200,reach:1.2+(Math.max(35,Math.min(145,y))-35)/110*3.4};}
const api={level,board,fromSun,count:specs.length,W,H,key};root.ShadowBridge=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
