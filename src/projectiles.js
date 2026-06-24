// projectiles.js — excrementos (paloma) e inmundicia (gato)
import { G, player } from './state.js';
import { ctx, sx } from './view.js';
import { aabb } from './utils.js';
import { GROUND_Y, VH } from './config.js';
import { burst } from './particles.js';
import { SFX } from './audio.js';
import { damagePlayer } from './player.js';

export function spawnProjectile(x,y,vx,vy,kind,g){
  G.projectiles.push({ x,y,vx,vy,kind,g,r:3,spin:0 });
}
export function updateProjectiles(dt){
  for(const p of G.projectiles){
    if(p.dead) continue;
    p.vy += p.g*dt;
    p.x += p.vx*dt; p.y += p.vy*dt; p.spin += dt*10;
    if(p.y >= GROUND_Y-2){ p.dead=true; burst(p.x,GROUND_Y-2, p.kind==='poop'?'#5a4a2a':'#6a5a3a',7,110); SFX.splat(); continue; }
    if(p.x < -40 || p.x > G.LEVEL_W+40 || p.y>VH+40){ p.dead=true; continue; }
    const box={x:p.x-p.r,y:p.y-p.r,w:p.r*2,h:p.r*2};
    if(aabb(player,box)){
      p.dead=true;
      if(player.relic<=0 && player.invuln<=0) damagePlayer(p.x);
      burst(p.x,p.y,'#6a5a3a',6,100); SFX.splat();
    }
  }
}
export function drawProjectiles(){
  for(const p of G.projectiles){
    if(p.dead) continue;
    const px=sx(p.x), py=Math.round(p.y);
    if(p.kind==='poop'){
      ctx.fillStyle='#5a4628'; ctx.beginPath(); ctx.arc(px,py,3,0,6.2832); ctx.fill();
      ctx.fillStyle='#3a2e18'; ctx.fillRect(px-1,py,2,2);
    } else {
      ctx.fillStyle='#7a6a3a'; ctx.beginPath(); ctx.arc(px,py,3,0,6.2832); ctx.fill();
      ctx.fillStyle='#9a8a4a'; ctx.fillRect(px-2,py-2,2,2);
    }
  }
}
