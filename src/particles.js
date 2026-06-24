// particles.js — sistema de particulas (chispas, sangre, polvo)
import { G } from './state.js';
import { ctx, sx } from './view.js';
import { clamp, rand, randi } from './utils.js';

export function part(x,y,vx,vy,life,color,size,grav){
  return { x,y,vx,vy,life,max:life,color,size:size||2, grav: grav==null?260:grav };
}
export function burst(x,y,color,n,spd){
  for(let i=0;i<n;i++){
    const a=rand(0,6.28), s=rand(spd*0.3,spd);
    G.particles.push(part(x,y,Math.cos(a)*s,Math.sin(a)*s,rand(0.3,0.7),color,randi(1,3)));
  }
}
export function updateParticles(dt){
  for(const p of G.particles){
    p.life-=dt;
    p.vy += p.grav*dt;
    p.x += p.vx*dt; p.y += p.vy*dt;
  }
  G.particles = G.particles.filter(p=>p.life>0);
}
export function drawParticles(){
  for(const p of G.particles){
    const a=clamp(p.life/p.max,0,1);
    ctx.globalAlpha=a;
    ctx.fillStyle=p.color;
    ctx.fillRect(Math.round(sx(p.x)), Math.round(p.y), p.size, p.size);
  }
  ctx.globalAlpha=1;
}
