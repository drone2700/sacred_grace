// waves.js — onda expansiva del "Ladrido Sagrado"
import { G } from './state.js';
import { ctx, sx } from './view.js';
import { clamp, lerp } from './utils.js';
import { killEnemy } from './enemies.js';
import { burst } from './particles.js';

export function updateWaves(dt){
  for(const w of G.waves){
    w.t+=dt;
    w.r = lerp(6, w.max, Math.min(1, w.t/0.42));
    w.life-=dt;
    for(const e of G.enemies){
      if(!e.alive) continue;
      const dx=(e.x+e.w/2)-w.x, dy=(e.y+e.h/2)-w.y;
      if(dx*dx+dy*dy <= w.r*w.r) killEnemy(e);
    }
    for(const p of G.projectiles){
      if(p.dead) continue;
      const dx=p.x-w.x, dy=p.y-w.y;
      if(dx*dx+dy*dy <= w.r*w.r){ p.dead=true; burst(p.x,p.y,'#e8d49a',5,90); }
    }
  }
  G.waves = G.waves.filter(w=>w.life>0);
}
export function drawWaves(){
  for(const w of G.waves){
    const px=sx(w.x), py=Math.round(w.y);
    const a = clamp(w.life/0.5,0,1);
    ctx.save();
    ctx.globalAlpha=a*0.5;
    const gr=ctx.createRadialGradient(px,py,w.r*0.5,px,py,w.r);
    gr.addColorStop(0,'rgba(201,162,74,0)'); gr.addColorStop(0.8,'rgba(232,212,154,0.25)'); gr.addColorStop(1,'rgba(232,212,154,0)');
    ctx.fillStyle=gr; ctx.beginPath(); ctx.arc(px,py,w.r,0,6.2832); ctx.fill();
    ctx.globalAlpha=a;
    ctx.lineWidth=2; ctx.strokeStyle='#e8d49a';
    ctx.beginPath(); ctx.arc(px,py,w.r,0,6.2832); ctx.stroke();
    ctx.lineWidth=1; ctx.strokeStyle='rgba(255,255,255,0.6)';
    ctx.beginPath(); ctx.arc(px,py,w.r*0.7,0,6.2832); ctx.stroke();
    ctx.restore();
  }
}
