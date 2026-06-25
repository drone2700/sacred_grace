// render.js — entorno tematico por mundo, ceniza, vineta, HUD y banner
import { G, player } from './state.js';
import { ctx, sx } from './view.js';
import { clamp, lerp, pseudo, shade } from './utils.js';
import { VW, VH, GROUND_Y, levels, RELIC_TIME, BARK_CD } from './config.js';
import { drawEnemies } from './enemies.js';
import { drawProjectiles } from './projectiles.js';
import { drawRelics, drawBone } from './relics.js';
import { drawHelpers } from './helpers.js';
import { drawWaves } from './waves.js';
import { drawParticles } from './particles.js';
import { drawDog } from './player.js';

const ash = [];
for(let i=0;i<70;i++) ash.push({ x:Math.random()*VW, y:Math.random()*VH, vy:6+Math.random()*16, vx:-6+Math.random()*12, s:1+(Math.random()<0.5?0:1), a:0.1+Math.random()*0.4 });

function drawStars(){
  for(let i=0;i<44;i++){
    const r=pseudo(i*5+11), x=((i*53 - G.cameraX*0.02)%VW+VW)%VW, y=6+(r%120);
    ctx.fillStyle='rgba(232,220,180,'+(0.10+(r%30)/130)+')';
    ctx.fillRect(Math.round(x), y, 1, 1);
  }
}
function drawMoon(L){
  const mx = VW*0.74 - G.cameraX*0.04, my = 52;
  const hg = ctx.createRadialGradient(mx,my,4, mx,my,60);
  hg.addColorStop(0,'rgba(232,212,154,0.5)'); hg.addColorStop(1,'rgba(232,212,154,0)');
  ctx.fillStyle=hg; ctx.beginPath(); ctx.arc(mx,my,60,0,6.2832); ctx.fill();
  ctx.fillStyle=L.moon; ctx.beginPath(); ctx.arc(mx,my,13,0,6.2832); ctx.fill();
  ctx.fillStyle='rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.arc(mx+5,my-3,11,0,6.2832); ctx.fill();
}
function drawBackground(L){
  const g = ctx.createLinearGradient(0,0,0,VH);
  g.addColorStop(0, L.sky[0]); g.addColorStop(0.55, L.sky[1]); g.addColorStop(1, L.sky[2]);
  ctx.fillStyle=g; ctx.fillRect(0,0,VW,VH);
  drawStars();
  drawMoon(L);
  drawSkyline(G.levelIndex, L.tower, 0.20, 198, 11, false);
  drawSkyline(G.levelIndex, L.tower2, 0.45, 226, 37, true);
  for(let i=0;i<3;i++){ const yy=188+i*12+Math.sin(G.time*0.6+i)*2; ctx.fillStyle=L.fog; ctx.fillRect(0,yy,VW,16); }
}
function drawSkyline(idx, color, factor, baseY, seed, big){
  const off=G.cameraX*factor, spacing= big?104:86;
  const start=Math.floor(off/spacing)-1;
  for(let i=start;i<start+Math.ceil(VW/spacing)+3;i++){
    const wx=i*spacing, px=Math.round(wx-off), r=pseudo(i*7+seed);
    drawWorldUnit(idx, px, baseY, r, big, color);
  }
}
function drawWorldUnit(idx, px, baseY, r, big, color){
  ctx.fillStyle=color;
  if(idx===0){                                   // CAMPOSANTO: lapidas y cruces
    if(big){
      const w=14+(r%6), h=24+(r%20), ty=baseY-h;
      ctx.fillRect(px, ty+6, w, h);
      ctx.beginPath(); ctx.arc(px+w/2, ty+6, w/2, Math.PI, 0); ctx.fill();
      if(r%2===0){ ctx.fillRect(px+w/2-1, ty-4, 2, 12); ctx.fillRect(px+w/2-4, ty-1, 8, 2); }
      ctx.fillStyle='rgba(201,162,74,0.10)'; ctx.fillRect(px+3, ty+12, w-6, 2);
    } else {
      const h=16+(r%14), ty=baseY-h;
      ctx.fillRect(px+2, ty, 2, h+22); ctx.fillRect(px-2, ty+5, 10, 2);
    }
  } else if(idx===1){                            // ENJAMBRE: arboles muertos + colmenas
    const h=(big?42:26)+(r%18), ty=baseY-h;
    ctx.fillRect(px+4, ty, 3, h+30);
    ctx.fillRect(px-1, ty+4+(r%8), 6, 2);
    ctx.fillRect(px+6, ty+8+(r%10), 8, 2);
    ctx.fillRect(px+1, ty-3, 9, 3);
    if(big && r%3===0){ ctx.fillStyle='#5a4a22'; ctx.fillRect(px+7, ty+12, 8, 9); ctx.fillStyle='#3a2e14'; ctx.fillRect(px+9, ty+20, 4, 2); }
  } else if(idx===2){                            // CAMPANARIO: catedral + campanas
    if(big){
      const w=30+(r%10), h=66+(r%28), ty=baseY-h;
      ctx.fillRect(px, ty+14, w, h);
      ctx.beginPath(); ctx.moveTo(px-2, ty+14); ctx.lineTo(px+w/2, ty-6); ctx.lineTo(px+w+2, ty+14); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#0a0710'; ctx.fillRect(px+w/2-5, ty+22, 10, 16);
      ctx.beginPath(); ctx.arc(px+w/2, ty+22, 5, Math.PI, 0); ctx.fill();
      ctx.fillStyle='rgba(201,162,74,0.5)'; ctx.fillRect(px+w/2-3, ty+26, 6, 8); ctx.fillRect(px+w/2-4, ty+34, 8, 2);
    } else {
      const w=16+(r%8), h=44+(r%22), ty=baseY-h;
      ctx.fillRect(px, ty+8, w, h);
      ctx.beginPath(); ctx.moveTo(px-1, ty+8); ctx.lineTo(px+w/2, ty-4); ctx.lineTo(px+w+1, ty+8); ctx.closePath(); ctx.fill();
      ctx.fillStyle='rgba(201,162,74,0.12)'; ctx.fillRect(px+w/2-1, ty+12, 2, 6);
    }
  } else {                                       // TEJADOS: tejados a dos aguas + chimeneas
    const w=(big?40:26)+(r%14), h=(big?22:14)+(r%10), ty=baseY-h;
    ctx.beginPath(); ctx.moveTo(px-2, baseY); ctx.lineTo(px+w/2, ty); ctx.lineTo(px+w+2, baseY); ctx.closePath(); ctx.fill();
    ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.fillRect(px-2, baseY-2, w+4, 2); ctx.fillStyle=color;
    if(big){ ctx.fillRect(px+w-8, ty+2, 4, 12); ctx.fillRect(px+w/2-1, ty-5, 2, 5); }
  }
}
function drawGroundAndPlatforms(L){
  const gy = GROUND_Y;
  ctx.fillStyle = '#0d0913'; ctx.fillRect(0, gy, VW, VH-gy);
  ctx.fillStyle = shade(L.tower2, 30); ctx.fillRect(0, gy, VW, 4);
  ctx.fillStyle = 'rgba(201,162,74,0.10)'; ctx.fillRect(0, gy, VW, 1);
  ctx.fillStyle='rgba(0,0,0,0.25)';
  for(let bx = -(G.cameraX%24); bx<VW; bx+=24){ ctx.fillRect(Math.round(bx), gy+8, 1, VH-gy-8); }
  for(let by=gy+8; by<VH; by+=12){ ctx.fillRect(0,by,VW,1); }

  for(const d of G.decor){ const px=sx(d.x); if(px<-40||px>VW+40) continue; drawDecor(G.levelIndex, px, gy, d.type); }

  for(const p of G.platforms){
    if(p.ground) continue;
    const px=sx(p.x); if(px+p.w<-10||px>VW+10) continue;
    ctx.fillStyle = p.roof ? '#241420' : '#1c1428';
    ctx.fillRect(px, p.y, p.w, p.h);
    ctx.fillStyle = 'rgba(201,162,74,0.22)'; ctx.fillRect(px, p.y, p.w, 2);
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(px, p.y+p.h-2, p.w, 2);
    if(p.roof){ ctx.fillStyle='rgba(134,32,47,0.5)'; for(let t=0;t<p.w;t+=8) ctx.fillRect(px+t, p.y, 1, p.h); }
  }
}
function drawDecor(idx, px, gy, type){
  if(idx===0){                                   // tumbas, cruces, calavera
    if(type===0){ ctx.fillStyle='#1a1422'; ctx.fillRect(px, gy-16, 12, 16); ctx.beginPath(); ctx.arc(px+6, gy-16, 6, Math.PI,0); ctx.fill(); ctx.fillStyle='rgba(201,162,74,0.15)'; ctx.fillRect(px+5,gy-12,2,7); ctx.fillRect(px+3,gy-10,6,2); }
    else if(type===1){ ctx.fillStyle='#150f1e'; ctx.fillRect(px+4,gy-22,3,22); ctx.fillRect(px,gy-16,11,3); }
    else { ctx.fillStyle='#cdbfa6'; ctx.fillRect(px,gy-6,7,6); ctx.fillStyle='#0d0913'; ctx.fillRect(px+1,gy-4,2,2); ctx.fillRect(px+4,gy-4,2,2); }
  } else if(idx===1){                            // setas, arbusto, colmena
    if(type===0){ ctx.fillStyle='#3a2e18'; ctx.fillRect(px+2,gy-6,2,6); ctx.fillStyle='#8a9a3a'; ctx.beginPath(); ctx.arc(px+3,gy-6,4,Math.PI,0); ctx.fill(); ctx.fillStyle='#cfe06a'; ctx.fillRect(px+1,gy-7,1,1); ctx.fillRect(px+4,gy-8,1,1); }
    else if(type===1){ ctx.fillStyle='#27331a'; ctx.fillRect(px,gy-7,12,7); ctx.fillStyle='#3a4a1e'; ctx.fillRect(px+2,gy-9,8,3); }
    else { ctx.fillStyle='#5a4a22'; ctx.fillRect(px,gy-12,9,12); ctx.fillStyle='#3a2e14'; for(let yy=gy-10;yy<gy;yy+=3) ctx.fillRect(px,yy,9,1); ctx.fillStyle='#1a1206'; ctx.fillRect(px+3,gy-4,3,2); }
  } else if(idx===2){                            // candelabro, columna, campana
    if(type===0){ ctx.fillStyle='#1a1422'; ctx.fillRect(px+2,gy-18,3,18); ctx.fillRect(px-2,gy-18,11,2); ctx.fillStyle='#ffdf8a'; ctx.fillRect(px-2,gy-21,2,3); ctx.fillRect(px+6,gy-21,2,3); ctx.fillRect(px+2,gy-22,2,3); }
    else if(type===1){ ctx.fillStyle='#161020'; ctx.fillRect(px,gy-26,8,26); ctx.fillStyle='rgba(201,162,74,0.18)'; ctx.fillRect(px,gy-26,8,2); ctx.fillRect(px,gy-2,8,2); }
    else { ctx.fillStyle='rgba(201,162,74,0.5)'; ctx.fillRect(px,gy-9,10,9); ctx.beginPath(); ctx.arc(px+5,gy-9,5,Math.PI,0); ctx.fill(); ctx.fillStyle='#0d0913'; ctx.fillRect(px+4,gy-2,2,2); }
  } else {                                       // chimenea, tejas, respiradero
    if(type===0){ ctx.fillStyle='#1a0c14'; ctx.fillRect(px,gy-16,8,16); ctx.fillStyle='#2e131e'; ctx.fillRect(px,gy-16,8,2); ctx.fillStyle='rgba(80,80,90,0.4)'; ctx.fillRect(px+1,gy-20,6,4); }
    else if(type===1){ ctx.fillStyle='#2e131e'; for(let t=0;t<10;t+=3){ ctx.fillRect(px+t,gy-4,2,4); } }
    else { ctx.fillStyle='#161018'; ctx.fillRect(px,gy-8,10,8); ctx.fillStyle='#3a2630'; ctx.fillRect(px+1,gy-6,8,1); ctx.fillRect(px+1,gy-4,8,1); }
  }
}
function drawCandles(){
  for(const c of G.candles){
    const px=sx(c.x); if(px<-20||px>VW+20) continue;
    const fy = c.y-14;
    const fl = 1 + Math.sin(G.time*9 + c.x)*0.18;
    const g = ctx.createRadialGradient(px+2, fy, 1, px+2, fy, 22*fl);
    g.addColorStop(0,'rgba(232,210,150,0.5)'); g.addColorStop(1,'rgba(232,210,150,0)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(px+2, fy, 22*fl, 0, 6.2832); ctx.fill();
    ctx.fillStyle='#cdbfa6'; ctx.fillRect(px, fy, 4, 14);
    ctx.fillStyle='#0d0913'; ctx.fillRect(px, c.y-1, 4, 2);
    ctx.fillStyle='#ffdf8a'; ctx.fillRect(px+1, fy-4, 2, 4);
    ctx.fillStyle='#e8a24a'; ctx.fillRect(px+1, fy-2, 2, 2);
  }
}
function drawAltar(){
  const px=sx(G.altarX); if(px<-80||px>VW+40) return;
  const gy=GROUND_Y;
  const g=ctx.createRadialGradient(px+16, gy-40, 4, px+16, gy-40, 64);
  g.addColorStop(0,'rgba(201,162,74,0.45)'); g.addColorStop(1,'rgba(201,162,74,0)');
  ctx.fillStyle=g; ctx.beginPath(); ctx.arc(px+16, gy-40, 64,0,6.2832); ctx.fill();
  ctx.fillStyle='#241a2c'; ctx.fillRect(px, gy-30, 32, 30);
  ctx.fillStyle='#160f20'; ctx.fillRect(px+2, gy-26, 28, 26);
  ctx.fillStyle='rgba(201,162,74,0.5)'; ctx.fillRect(px, gy-30, 32, 2);
  const cx=px+16, cy=gy-34, pulse = 1+Math.sin(G.time*3)*0.12;
  ctx.fillStyle='#e8d49a'; ctx.fillRect(cx-2, cy-18*pulse, 4, 20*pulse); ctx.fillRect(cx-8, cy-12, 16, 4);
  ctx.fillStyle='#c9a24a'; ctx.fillRect(cx-1, cy-16, 2, 16);
}
function drawAsh(dt){
  ctx.fillStyle='#cdbfa6';
  for(const a of ash){
    a.y += a.vy*dt; a.x += a.vx*dt + Math.sin(G.time+a.y*0.1)*0.2;
    if(a.y>VH){ a.y=-2; a.x=Math.random()*VW; }
    if(a.x<0) a.x=VW; if(a.x>VW) a.x=0;
    ctx.globalAlpha=a.a; ctx.fillRect(Math.round(a.x), Math.round(a.y), a.s, a.s);
  }
  ctx.globalAlpha=1;
}
function drawVignette(){
  const g=ctx.createRadialGradient(VW/2,VH/2,VH*0.35, VW/2,VH/2,VH*0.85);
  g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,0.65)');
  ctx.fillStyle=g; ctx.fillRect(0,0,VW,VH);
}
function diamond(cx,cy,r,fill,stroke){
  ctx.beginPath();
  ctx.moveTo(cx,cy-r); ctx.lineTo(cx+r,cy); ctx.lineTo(cx,cy+r); ctx.lineTo(cx-r,cy); ctx.closePath();
  ctx.fillStyle=fill; ctx.fill();
  if(stroke){ ctx.lineWidth=1; ctx.strokeStyle=stroke; ctx.stroke(); }
}
function drawHUD(){
  for(let i=0;i<G.maxHearts;i++){
    const cx=12+i*15, cy=14;
    if(i<G.hearts){ diamond(cx,cy,6,'#b02a2a','#e8d49a'); diamond(cx,cy-1,2.5,'#e8a4a4'); }
    else { diamond(cx,cy,6,'#2a1822','#5a3a3a'); }
  }
  ctx.font="8px 'Press Start 2P', monospace";
  ctx.textAlign='center'; ctx.fillStyle='#0a0710';
  ctx.fillText(levels[G.levelIndex].name, VW/2+1, 15);
  ctx.fillStyle='#c9a24a'; ctx.fillText(levels[G.levelIndex].name, VW/2, 14);
  ctx.textAlign='right';
  ctx.fillStyle='#0a0710'; ctx.fillText('PURGADOS '+G.killed+'/'+G.total, VW-9, 15);
  ctx.fillStyle='#e8d49a'; ctx.fillText('PURGADOS '+G.killed+'/'+G.total, VW-10, 14);

  const by=28, bx=12; ctx.textAlign='left';
  const ready = G.barkCooldown<=0;
  ctx.font="7px 'Press Start 2P', monospace";
  ctx.fillStyle = ready ? '#c9a24a' : '#5a4a55'; ctx.fillText('L', bx, by+5);
  ctx.fillStyle='#2a1f30'; ctx.fillRect(bx+12, by, 46, 6);
  const fillW = ready?46:46*(1-G.barkCooldown/BARK_CD);
  ctx.fillStyle = ready ? '#c9a24a' : '#7a5a8a'; ctx.fillRect(bx+12, by, fillW, 6);
  if(ready){ ctx.strokeStyle='rgba(232,212,154,'+(0.5+Math.sin(G.time*6)*0.4)+')'; ctx.lineWidth=1; ctx.strokeRect(bx+12, by, 46, 6); }

  if(player.relic>0){
    drawBone(VW-22, 31, 5, '#f4ecd2', '#c9a24a');
    ctx.fillStyle='#2a1f30'; ctx.fillRect(VW-58, 27, 30, 6);
    ctx.fillStyle='#e8d49a'; ctx.fillRect(VW-58, 27, 30*(player.relic/RELIC_TIME), 6);
  }
}
function drawClearBanner(){
  ctx.fillStyle='rgba(10,7,16,0.55)'; ctx.fillRect(0,VH/2-34,VW,68);
  ctx.fillStyle='rgba(201,162,74,0.5)'; ctx.fillRect(0,VH/2-34,VW,2); ctx.fillRect(0,VH/2+32,VW,2);
  ctx.textAlign='center';
  ctx.font="16px 'Press Start 2P', monospace";
  ctx.fillStyle='#0a0710'; ctx.fillText('ESTACION', VW/2+2, VH/2-4);
  ctx.fillStyle='#c9a24a'; ctx.fillText('ESTACION', VW/2, VH/2-6);
  ctx.font="13px 'Press Start 2P', monospace";
  ctx.fillStyle='#0a0710'; ctx.fillText('SUPERADA', VW/2+2, VH/2+18);
  ctx.fillStyle='#e8d49a'; ctx.fillText('SUPERADA', VW/2, VH/2+16);
  ctx.textAlign='left';
}
export function render(dt){
  const L = levels[G.levelIndex];
  drawBackground(L);
  drawGroundAndPlatforms(L);
  drawCandles();
  if(G.state!=='intro') drawAltar();
  drawRelics();
  drawHelpers();
  drawProjectiles();
  drawEnemies();
  if(G.state==='play'||G.state==='clear'||G.state==='dead') drawDog();
  drawWaves();
  drawParticles();
  drawAsh(dt);
  drawVignette();
  if(G.state==='play'||G.state==='clear') drawHUD();
  if(G.state==='clear') drawClearBanner();
}
