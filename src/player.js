// player.js — el sabueso: fisica, giro-ataque, ladrido, dano y dibujo
import { G, player, input } from './state.js';
import { ctx, sx } from './view.js';
import { clamp, lerp, rand } from './utils.js';
import { ACCEL, MAXRUN, FRICTION, AIRACCEL, G_UP, G_DOWN, JUMP_V,
         RELIC_JUMP, COYOTE, RELIC_TIME, BARK_CD, SPIN_CD, SPIN_DUR, levels } from './config.js';
import { SFX } from './audio.js';
import { burst, part } from './particles.js';
import { killEnemy } from './enemies.js';
import { show } from './ui.js';

export function setScale(s){
  const cx = player.x + player.w/2;
  const bottom = player.y + player.h;
  player.scale = s;
  player.w = player.bw*s; player.h = player.bh*s;
  player.x = cx - player.w/2;
  player.y = bottom - player.h;
}

export function trySpin(){
  if(G.state!=='play' || G.spinCooldown>0) return;
  G.spinTimer = SPIN_DUR; G.spinCooldown = SPIN_CD;
  player.vx += player.facing * 60;            // pequeno impulso al girar
  SFX.spin();
}
export function tryBark(){
  if(G.state!=='play' || G.barkCooldown>0) return;
  G.barkCooldown = BARK_CD;
  G.waves.push({ x:player.x+player.w/2, y:player.y+player.h/2, r:6, max:104, life:0.5, t:0 });
  SFX.bark();
  for(let i=0;i<14;i++){
    const a=rand(0,6.28);
    G.particles.push(part(player.x+player.w/2, player.y+player.h/2, Math.cos(a)*120, Math.sin(a)*120, rand(0.3,0.6), '#e8d49a', 2));
  }
}

export function damagePlayer(fromX){
  if(player.invuln>0 || player.relic>0) return;
  G.hearts--;
  player.invuln = 1.3;
  const dir = (player.x+player.w/2) < fromX ? -1 : 1;
  player.vx = dir*150; player.vy = -170;
  SFX.hurt();
  burst(player.x+player.w/2, player.y+player.h/2, '#b02a2a', 12, 150);
  if(G.hearts<=0){ G.hearts=0; die(); }
}
export function die(){
  G.state='dead';
  document.getElementById('deathText').innerHTML =
    'El sabueso ha caido en <b style="color:#b02a2a">'+levels[G.levelIndex].name+'</b>.<br>La fe lo devolvera al sendero.';
  show('death');
}

export function movePlayer(dt){
  const accel = player.onGround ? ACCEL : AIRACCEL;
  if(input.left && !input.right){ player.vx -= accel*dt; player.facing=-1; }
  else if(input.right && !input.left){ player.vx += accel*dt; player.facing=1; }
  else {
    const f = FRICTION*dt;
    if(player.vx>0) player.vx = Math.max(0, player.vx-f);
    else if(player.vx<0) player.vx = Math.min(0, player.vx+f);
  }
  player.vx = clamp(player.vx, -MAXRUN*1.6, MAXRUN*1.6);
  if(Math.abs(player.vx)>MAXRUN && G.spinTimer<=0){
    player.vx = lerp(player.vx, Math.sign(player.vx)*MAXRUN, Math.min(1,8*dt));
  }

  if(player.jumpBuffer>0 && (player.onGround || player.coyote>0)){
    player.vy = JUMP_V * (player.relic>0?RELIC_JUMP:1);
    player.onGround=false; player.coyote=0; player.jumpBuffer=0; player.jumpCut=false;
    SFX.jump();
    burst(player.x+player.w/2, player.y+player.h, '#cdbfa6', 5, 80);
  }

  const g = (player.vy<0 && input.jump) ? G_UP : G_DOWN;
  player.vy += g*dt;
  player.vy = clamp(player.vy, -520, 560);

  player.x += player.vx*dt;
  for(const p of G.platforms){
    if(p.oneWay) continue;
    if(aabbHit(player,p)){
      if(player.vx>0) player.x = p.x - player.w;
      else if(player.vx<0) player.x = p.x + p.w;
      player.vx=0;
    }
  }
  player.x = clamp(player.x, 0, G.LEVEL_W - player.w);

  player.y += player.vy*dt;
  player.onGround=false;
  for(const p of G.platforms){
    if(p.oneWay){
      if(player.vy>=0){
        const prevBottom = player.y + player.h - player.vy*dt;
        if(player.x < p.x+p.w && player.x+player.w > p.x &&
           prevBottom <= p.y+2 && player.y+player.h >= p.y && player.y+player.h <= p.y+p.h+12){
          player.y = p.y - player.h; player.vy=0; player.onGround=true;
        }
      }
    } else {
      if(aabbHit(player,p)){
        if(player.vy>0){ player.y = p.y - player.h; player.vy=0; player.onGround=true; }
        else if(player.vy<0){ player.y = p.y + p.h; player.vy=0; }
      }
    }
  }

  if(player.onGround) player.coyote=COYOTE; else player.coyote-=dt;
  player.jumpBuffer-=dt;
  if(G.spinCooldown>0) G.spinCooldown-=dt;
  if(G.spinTimer>0) G.spinTimer-=dt;
  if(G.barkCooldown>0) G.barkCooldown-=dt;
  if(player.invuln>0) player.invuln-=dt;

  if(player.relic>0){
    player.relic-=dt;
    player.stepT+=dt;
    if(player.stepT>0.045){
      player.stepT=0;
      G.particles.push(part(player.x+rand(0,player.w), player.y+rand(0,player.h),
        rand(-20,20), rand(-30,10), rand(0.3,0.6), Math.random()<0.5?'#e8d49a':'#c9a24a', 2, 60));
    }
    if(player.relic<=0) setScale(1);
  }

  if(player.onGround && Math.abs(player.vx)>12){
    player.runFrame += Math.abs(player.vx)*dt*0.10;
    player.stepT2 = (player.stepT2||0)+dt;
    if(player.stepT2>0.22){ player.stepT2=0; SFX.step(); }
  } else player.runFrame=0;

  // GIRO-ATAQUE: hitbox radial (golpea todo alrededor + dispersa proyectiles)
  if(G.spinTimer>0){
    const cx=player.x+player.w/2, cy=player.y+player.h/2, R=player.w*0.95+6;
    for(const e of G.enemies){ if(!e.alive) continue; const ex=e.x+e.w/2-cx, ey=e.y+e.h/2-cy; if(ex*ex+ey*ey<=R*R) killEnemy(e); }
    for(const p of G.projectiles){ if(p.dead) continue; const dx=p.x-cx, dy=p.y-cy; if(dx*dx+dy*dy<=R*R){ p.dead=true; burst(p.x,p.y,'#e8d49a',5,90); } }
  }
}

function aabbHit(a,b){ return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y; }

export function drawDog(){
  if(player.invuln>0 && Math.floor(G.time*16)%2===0) return;
  const px=sx(player.x), py=Math.round(player.y);
  const s=player.scale;
  const spinning = G.spinTimer>0;
  const glow = player.relic>0;

  // aura del huesito de poder
  if(player.relic>0){
    const cx=px+player.w/2, cy=py+player.h/2;
    const pulse=1+Math.sin(G.time*8)*0.2;
    const gr=ctx.createRadialGradient(cx,cy,2,cx,cy,player.w*1.0*pulse);
    gr.addColorStop(0,'rgba(232,212,154,0.5)'); gr.addColorStop(1,'rgba(232,212,154,0)');
    ctx.fillStyle=gr; ctx.beginPath(); ctx.arc(cx,cy,player.w*1.0*pulse,0,6.2832); ctx.fill();
  }

  ctx.save();
  ctx.translate(px,py);
  if(spinning){
    const prog = 1 - G.spinTimer/SPIN_DUR;
    ctx.translate(player.w/2, player.h/2);
    ctx.rotate(prog*Math.PI*4*(player.facing<0?-1:1));
    ctx.translate(-player.w/2, -player.h/2);
    ctx.scale(s,s);
  } else {
    if(player.facing<0){ ctx.scale(-1,1); ctx.translate(-player.w,0); }
    ctx.scale(s,s);
  }

  // paleta del perro (foto: blanco con manchas marrones)
  const WHITE='#f1ead7', WSH='#d2c4a8', WDK='#a99a7e';
  const TAN='#b06a36', TAN_D='#7e4a24', TAN_H='#c98a54';
  const EAR='#8a5226', EAR_D='#5a3417';
  const NOSE='#2a1d1d', EYE='#23160f';
  const STEEL='#9aa0b0', STEEL_H='#cfd4df', STEEL_D='#5a5f6e', GOLD='#c9a24a', GOLD_H='#e8d49a', RED='#9c2533';

  const run = player.runFrame;
  const legA = Math.sin(run)*2, legB = Math.sin(run+Math.PI)*2;
  const yA=14+(player.onGround?Math.max(0,legA):0), yB=14+(player.onGround?Math.max(0,legB):0);

  // cola (blanca, punta marron)
  ctx.save(); ctx.translate(3,9); ctx.rotate(Math.sin(G.time*7)*0.3 - 0.5);
  ctx.fillStyle=WHITE; ctx.fillRect(-6,-2,7,4);
  ctx.fillStyle=WSH;   ctx.fillRect(-6,0,7,2);
  ctx.fillStyle=TAN;   ctx.fillRect(-7,-2,3,4);
  ctx.fillStyle=TAN_D; ctx.fillRect(-7,0,3,2);
  ctx.restore();

  // patas
  ctx.fillStyle=WSH;  ctx.fillRect(5,yA,3,4); ctx.fillStyle=WDK; ctx.fillRect(13,yB,3,4);
  ctx.fillStyle=WHITE;ctx.fillRect(8,yB,3,4); ctx.fillStyle=WSH; ctx.fillRect(16,yA,3,4);
  ctx.fillStyle='#3a2e22';
  ctx.fillRect(5,yA+4,3,1); ctx.fillRect(8,yB+4,3,1); ctx.fillRect(13,yB+4,3,1); ctx.fillRect(16,yA+4,3,1);

  // cuerpo blanco + mancha del lomo + pecas
  ctx.fillStyle=WHITE; ctx.fillRect(4,7,15,8);
  ctx.fillStyle=WSH;   ctx.fillRect(4,12,15,3);
  ctx.fillStyle=TAN;   ctx.fillRect(5,6,9,5);
  ctx.fillStyle=TAN_D; ctx.fillRect(5,9,9,2);
  ctx.fillStyle=TAN_H; ctx.fillRect(5,6,9,1);
  ctx.fillStyle=TAN_D; ctx.fillRect(15,11,1,1); ctx.fillRect(17,13,1,1); ctx.fillRect(7,13,1,1); ctx.fillRect(11,14,1,1);

  // collar + cruz (armadura ligera)
  ctx.fillStyle=RED;   ctx.fillRect(13,9,4,3);
  ctx.fillStyle=GOLD;  ctx.fillRect(14,9,1,3); ctx.fillRect(13,10,3,1);
  ctx.fillStyle=GOLD_H;ctx.fillRect(14,10,1,1);

  // cabeza blanca + mancha de la frente
  ctx.fillStyle=WHITE; ctx.fillRect(14,3,9,8);
  ctx.fillStyle=WSH;   ctx.fillRect(14,9,9,2);
  ctx.fillStyle=TAN;   ctx.fillRect(15,2,7,5);
  ctx.fillStyle=TAN_D; ctx.fillRect(15,5,7,1);
  ctx.fillStyle=TAN_H; ctx.fillRect(15,2,7,1);

  // oreja caida (marron) al lateral
  ctx.fillStyle=EAR;   ctx.fillRect(12,3,4,10);
  ctx.fillStyle=EAR_D; ctx.fillRect(12,8,4,5);
  ctx.fillStyle='#6e421f'; ctx.fillRect(12,3,4,1);

  // hocico blanco + nariz + pecas
  ctx.fillStyle=WHITE; ctx.fillRect(20,7,4,4);
  ctx.fillStyle=WSH;   ctx.fillRect(20,10,4,1);
  ctx.fillStyle=NOSE;  ctx.fillRect(23,8,2,2);
  ctx.fillStyle=TAN_D; ctx.fillRect(20,9,1,1); ctx.fillRect(22,11,1,1);

  // ojo amistoso
  ctx.fillStyle=EYE; ctx.fillRect(18,6,2,2);
  ctx.fillStyle = glow ? '#fff' : '#f1ead7'; ctx.fillRect(19,6,1,1);

  // casco ligero (acero + oro) entre las orejas
  ctx.fillStyle=STEEL;  ctx.fillRect(15,1,6,3);
  ctx.fillStyle=STEEL_H;ctx.fillRect(15,1,6,1);
  ctx.fillStyle=STEEL_D;ctx.fillRect(15,3,6,1);
  ctx.fillStyle=GOLD;   ctx.fillRect(15,2,6,1);
  ctx.fillStyle=GOLD;   ctx.fillRect(17,-1,2,2);
  ctx.fillStyle=GOLD_H; ctx.fillRect(17,-1,1,1);

  if(glow){ ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.fillRect(4,7,15,1); }

  ctx.restore();

  // swoosh del giro
  if(spinning){
    const cx=px+player.w/2, cy=py+player.h/2, R=player.w*0.8;
    const prog=1-G.spinTimer/SPIN_DUR, a0=prog*Math.PI*4*(player.facing<0?-1:1);
    ctx.strokeStyle='rgba(232,212,154,0.7)'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(cx,cy,R, a0, a0+1.7); ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,0.5)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.arc(cx,cy,R*0.72, a0+Math.PI, a0+Math.PI+1.4); ctx.stroke();
  }

  // anillo-temporizador del huesito
  if(player.relic>0){
    const cx=px+player.w/2, cy=py+player.h/2, rr=player.w*0.8;
    ctx.lineWidth=2; ctx.strokeStyle='rgba(40,20,10,0.5)';
    ctx.beginPath(); ctx.arc(cx,cy,rr,0,6.2832); ctx.stroke();
    ctx.strokeStyle='#e8d49a';
    ctx.beginPath(); ctx.arc(cx,cy,rr,-Math.PI/2, -Math.PI/2 + 6.2832*(player.relic/RELIC_TIME)); ctx.stroke();
  }
}
