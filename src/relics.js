// relics.js — Huesito de Poder (power-up estilo hueso de perro)
import { G, player } from './state.js';
import { ctx, sx } from './view.js';
import { aabb } from './utils.js';
import { RELIC_TIME } from './config.js';
import { burst } from './particles.js';
import { SFX } from './audio.js';
import { setScale } from './player.js';

export function updateRelics(dt){
  for(const r of G.relics){
    if(r.got) continue;
    r.y = r.base + Math.sin(G.time*2 + r.phase)*5;
    const box={x:r.x-r.w/2,y:r.y-r.h/2,w:r.w,h:r.h};
    if(aabb(player,box)){
      r.got=true;
      player.relic = RELIC_TIME;
      player.invuln = 0;
      setScale(2);
      SFX.relic();
      burst(r.x,r.y,'#f0e6c8',24,200);
    }
  }
}
export function drawBone(cx,cy,sc,fill,edge){
  ctx.save(); ctx.translate(cx,cy); ctx.rotate(Math.sin(G.time*2)*0.15);
  const L=sc*1.5, kr=sc*0.62, hh=sc*0.42;
  ctx.fillStyle=fill;
  ctx.fillRect(-L,-hh, L*2, hh*2);                                  // tallo
  [[-L,-hh],[-L,hh],[L,-hh],[L,hh]].forEach(([kx,ky])=>{ ctx.beginPath(); ctx.arc(kx,ky,kr,0,6.2832); ctx.fill(); });
  ctx.fillStyle=edge; ctx.fillRect(-L,hh-1, L*2, 1);                // sombra inferior
  ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.fillRect(-L,-hh, L*2, 1); // brillo
  ctx.restore();
}
export function drawRelics(){
  for(const r of G.relics){
    if(r.got) continue;
    const px=sx(r.x); if(px<-20||px>500) continue;
    const py=r.y;
    const pulse = 1+Math.sin(G.time*5+r.phase)*0.2;
    const gr=ctx.createRadialGradient(px,py,1,px,py,20*pulse);
    gr.addColorStop(0,'rgba(232,212,154,0.7)'); gr.addColorStop(1,'rgba(232,212,154,0)');
    ctx.fillStyle=gr; ctx.beginPath(); ctx.arc(px,py,20*pulse,0,6.2832); ctx.fill();
    drawBone(px,py,6,'#f4ecd2','#b89a52');
  }
}
