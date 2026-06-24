// enemies.js — los cuatro enemigos: colocacion, IA y dibujo (mas grandes + detalle)
import { G, player } from './state.js';
import { ctx, sx } from './view.js';
import { rand, aabb } from './utils.js';
import { GROUND_Y, VW } from './config.js';
import { burst } from './particles.js';
import { SFX } from './audio.js';
import { spawnProjectile } from './projectiles.js';
import { damagePlayer } from './player.js';

export function placeEnemy(type,x){
  const d = G.settings.diff;
  if(type==='squirrel'){
    G.enemies.push({ type, x, y:GROUND_Y-18, w:20, h:18, dir:Math.random()<0.5?-1:1,
      speed:rand(30,42)*d, range:[x-72,x+72], alive:true, anim:rand(0,6) });
  } else if(type==='bug'){
    const baseY = GROUND_Y - rand(70,130);
    G.enemies.push({ type, x, y:baseY, baseY, w:18, h:14, dir:Math.random()<0.5?-1:1,
      speed:rand(40,58)*d, amp:rand(14,26), freq:rand(2.4,3.6), phase:rand(0,6),
      range:[x-95,x+95], alive:true });
  } else if(type==='pigeon'){
    const baseY = GROUND_Y - rand(95,140);
    G.enemies.push({ type, x, y:baseY, baseY, w:22, h:16, dir:Math.random()<0.5?-1:1,
      speed:rand(28,40)*d, range:[x-100,x+100], phase:rand(0,6),
      fireT:rand(0.6,2.4), fireInt:2.5/d, alive:true });
  } else if(type==='cat'){
    const ry = GROUND_Y - 54;
    G.platforms.push({ x:x-28, y:ry, w:70, h:10, oneWay:true, roof:true });
    G.enemies.push({ type, x, y:ry-18, w:22, h:18, dir:-1,
      fireT:rand(0.8,2.6), fireInt:2.7/d, alive:true, baseY:ry-18, phase:rand(0,6) });
  }
}

export function killEnemy(e){
  if(!e.alive) return;
  e.alive=false; G.killed++;
  const cx=e.x+e.w/2, cy=e.y+e.h/2;
  const col = e.type==='squirrel'?'#7a4a2a' : e.type==='bug'?'#8a9a3a' : e.type==='pigeon'?'#b7bbd0' : '#3a2e3a';
  burst(cx,cy,col,14,180);
  burst(cx,cy,'#86202f',7,120);
}

export function updateEnemies(dt){
  for(const e of G.enemies){
    if(!e.alive) continue;
    if(e.type==='squirrel'){
      e.x += e.dir*e.speed*dt;
      if(e.x<e.range[0]){ e.x=e.range[0]; e.dir=1; }
      if(e.x>e.range[1]){ e.x=e.range[1]; e.dir=-1; }
      e.anim += dt*Math.abs(e.speed)*0.08;
    } else if(e.type==='bug'){
      e.x += e.dir*e.speed*dt;
      if(e.x<e.range[0]){ e.x=e.range[0]; e.dir=1; }
      if(e.x>e.range[1]){ e.x=e.range[1]; e.dir=-1; }
      e.y = e.baseY + Math.sin(G.time*e.freq + e.phase)*e.amp;
    } else if(e.type==='pigeon'){
      e.x += e.dir*e.speed*dt;
      if(e.x<e.range[0]){ e.x=e.range[0]; e.dir=1; }
      if(e.x>e.range[1]){ e.x=e.range[1]; e.dir=-1; }
      e.y = e.baseY + Math.sin(G.time*1.6 + e.phase)*6;
      e.fireT-=dt;
      if(e.fireT<=0 && Math.abs(e.x-(G.cameraX+VW/2))<VW){
        e.fireT = e.fireInt*rand(0.7,1.3);
        spawnProjectile(e.x+e.w/2, e.y+e.h, e.dir*18, 0, 'poop', 320);
        SFX.spit();
      }
    } else if(e.type==='cat'){
      e.y = e.baseY + Math.sin(G.time*2 + e.phase)*1.5;
      e.dir = (player.x > e.x)?1:-1;
      e.fireT-=dt;
      if(e.fireT<=0 && Math.abs(e.x-(G.cameraX+VW/2))<VW){
        e.fireT = e.fireInt*rand(0.7,1.3);
        const px=e.x+e.w/2, py=e.y+2;
        const tx=player.x+player.w/2, ty=player.y+player.h/2;
        const g=460, T=0.95;
        let vx=Math.max(-190,Math.min(190,(tx-px)/T));
        let vy=(ty-py-0.5*g*T*T)/T;
        spawnProjectile(px,py,vx,vy,'filth',g);
        SFX.spit();
      }
    }
    if(e.alive && aabb(player,e)){
      if(player.relic>0) killEnemy(e);
      else damagePlayer(e.x+e.w/2);
    }
  }
}

export function drawEnemies(){
  for(const e of G.enemies){
    if(!e.alive) continue;
    const px=sx(e.x); if(px+e.w<-20||px>VW+20) continue;
    const py=Math.round(e.y);
    if(e.type==='squirrel') drawSquirrel(px,py,e);
    else if(e.type==='bug') drawBug(px,py,e);
    else if(e.type==='pigeon') drawPigeon(px,py,e);
    else if(e.type==='cat') drawCat(px,py,e);
  }
}
function drawSquirrel(px,py,e){
  const f=e.dir;
  ctx.save(); ctx.translate(px+e.w/2, py); if(f<0) ctx.scale(-1,1); ctx.translate(-e.w/2,0);
  const bob=Math.sin(e.anim)*1;
  // cola frondosa
  ctx.fillStyle='#3a241a'; ctx.fillRect(-3, 0, 7, 16);
  ctx.fillStyle='#4a2e1e'; ctx.fillRect(-3, 0, 7, 6);
  ctx.fillStyle='#2a1810'; ctx.fillRect(-3, 11, 7, 5);
  // cuerpo
  ctx.fillStyle='#5a3420'; ctx.fillRect(4, 5+bob, 13, 11);
  ctx.fillStyle='#6e4228'; ctx.fillRect(4, 5+bob, 13, 3);
  ctx.fillStyle='#3a2014'; ctx.fillRect(4, 13+bob, 13, 3);
  ctx.fillStyle='#7a5238'; ctx.fillRect(6, 9+bob, 4, 3);
  // cabeza
  ctx.fillStyle='#5a3420'; ctx.fillRect(12, 1+bob, 9, 9);
  ctx.fillStyle='#3a2014'; ctx.fillRect(13, -1+bob, 3, 3);
  ctx.fillStyle='#7a5238'; ctx.fillRect(18, 4+bob, 3, 3);
  ctx.fillStyle='#1a1008'; ctx.fillRect(20, 5+bob, 1, 2);
  // ojo corrupto rojo
  ctx.fillStyle='#ff3a3a'; ctx.fillRect(16, 3+bob, 3, 3);
  ctx.fillStyle='#ffd0d0'; ctx.fillRect(17, 3+bob, 1, 1);
  // patas
  const k=(Math.sin(e.anim*2)>0)?1:0;
  ctx.fillStyle='#2a1810';
  ctx.fillRect(6, 16, 3, 1+k); ctx.fillRect(13, 16, 3, 2-k);
  ctx.restore();
}
function drawBug(px,py,e){
  const flap=Math.sin(G.time*22)>0?1:-1;
  ctx.fillStyle='rgba(180,200,120,0.5)';
  ctx.fillRect(px+2, py-3+(flap<0?2:-1), 6, 6);
  ctx.fillRect(px+10, py-3+(flap>0?2:-1), 6, 6);
  ctx.fillStyle='rgba(150,180,90,0.35)';
  ctx.fillRect(px+3, py+(flap<0?1:0), 5, 4);
  ctx.fillRect(px+10, py+(flap>0?1:0), 5, 4);
  ctx.fillStyle='#3a4a18'; ctx.fillRect(px+5, py, 8, 12);
  ctx.fillStyle='#566a22'; ctx.fillRect(px+5, py, 8, 3);
  ctx.fillStyle='#2a3a10'; ctx.fillRect(px+5, py+5, 8, 1); ctx.fillRect(px+5, py+8, 8, 1);
  ctx.fillStyle='#cfe06a'; ctx.fillRect(px+5, py+1, 2, 2); ctx.fillRect(px+11, py+1, 2, 2);
  ctx.fillStyle='#1a2208'; ctx.fillRect(px+6, py+1, 1, 1); ctx.fillRect(px+11, py+1, 1, 1);
  ctx.fillStyle='#2a3a10'; ctx.fillRect(px+6, py-3, 1, 3); ctx.fillRect(px+11, py-3, 1, 3);
  ctx.fillStyle='#86202f'; ctx.fillRect(px+8, py+12, 2, 3);
}
function drawPigeon(px,py,e){
  const f=e.dir;
  ctx.save(); ctx.translate(px+e.w/2, py); if(f<0) ctx.scale(-1,1); ctx.translate(-e.w/2,0);
  const flap=Math.sin(G.time*14)*3;
  ctx.fillStyle='#7a8098'; ctx.fillRect(-2, 5, 5, 4);
  ctx.fillStyle='#9aa0b8'; ctx.fillRect(3, 3, 14, 9);
  ctx.fillStyle='#7a8098'; ctx.fillRect(3, 9, 14, 3);
  ctx.fillStyle='#aab0c8'; ctx.fillRect(3, 3, 14, 2);
  ctx.fillStyle='#aab0c8'; ctx.fillRect(14, 1, 6, 6);
  ctx.fillStyle='#e8a24a'; ctx.fillRect(20, 3, 3, 2);
  ctx.fillStyle='#1a1226'; ctx.fillRect(17, 2, 1, 1);
  ctx.fillStyle='#8a90a8'; ctx.fillRect(5, 3+flap, 9, 4);
  ctx.fillStyle='#6a7090'; ctx.fillRect(5, 5+flap, 9, 2);
  ctx.fillStyle='#5a6a3a'; ctx.fillRect(8, 8, 3, 2);
  ctx.restore();
}
function drawCat(px,py,e){
  const f=e.dir;
  ctx.save(); ctx.translate(px+e.w/2, py); if(f<0) ctx.scale(-1,1); ctx.translate(-e.w/2,0);
  ctx.fillStyle='#2a2230'; ctx.fillRect(-2, 6, 5, 4);
  ctx.fillStyle='#1a141f'; ctx.fillRect(-2, 8, 5, 2);
  ctx.fillStyle='#2a2230'; ctx.fillRect(2, 6, 16, 11);
  ctx.fillStyle='#332b3c'; ctx.fillRect(2, 6, 16, 2);
  ctx.fillStyle='#1a141f'; ctx.fillRect(2, 13, 16, 4);
  ctx.fillStyle='#171019'; ctx.fillRect(6, 6, 1, 9); ctx.fillRect(10, 6, 1, 9); ctx.fillRect(14, 6, 1, 9);
  ctx.fillStyle='#2a2230'; ctx.fillRect(12, 1, 10, 8);
  ctx.beginPath(); ctx.moveTo(12,1); ctx.lineTo(14,-3); ctx.lineTo(16,1); ctx.fill();
  ctx.beginPath(); ctx.moveTo(18,1); ctx.lineTo(20,-3); ctx.lineTo(22,1); ctx.fill();
  ctx.fillStyle='#ffd24a'; ctx.fillRect(14, 3, 3, 3); ctx.fillRect(18, 3, 3, 3);
  ctx.fillStyle='#1a1010'; ctx.fillRect(15, 3, 1, 3); ctx.fillRect(19, 3, 1, 3);
  ctx.fillStyle='#1a141f'; ctx.fillRect(4, 16, 3, 2); ctx.fillRect(13, 16, 3, 2);
  ctx.restore();
}
