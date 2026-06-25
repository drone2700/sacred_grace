// helpers.js — ayudantes (estilo prisioneros de Metal Slug): al pasar, te dan algo
import { G, player } from './state.js';
import { ctx, sx } from './view.js';
import { aabb, rand } from './utils.js';
import { RELIC_TIME, VW } from './config.js';
import { burst, part } from './particles.js';
import { SFX } from './audio.js';
import { setScale } from './player.js';
import { drawBone } from './relics.js';

export function updateHelpers(dt){
  for(const h of G.helpers){
    if(h.freed){ h.t += dt; continue; }
    if(aabb(player, h)){
      h.freed = true; h.t = 0; SFX.relic();
      if(h.kind === 'spider'){                                  // cura un corazon
        G.hearts = Math.min(G.maxHearts, G.hearts + 1);
        burst(h.x + h.w/2, h.y + 12, '#e0556a', 22, 190);
        for(let i=0;i<10;i++){ const a=rand(-2.5,-0.6), s=rand(60,140);
          G.particles.push(part(h.x+h.w/2, h.y+12, Math.cos(a)*s, Math.sin(a)*s, rand(0.5,0.9), Math.random()<0.5?'#e0556a':'#ff9aa8', 2, 120)); }
      } else {                                                  // huesito de poder
        player.relic = RELIC_TIME; player.invuln = 0; setScale(2);
        burst(h.x + h.w/2, h.y + 10, '#f0e6c8', 26, 210);
        for(let i=0;i<12;i++){ const a=rand(-2.5,-0.6), s=rand(70,160);
          G.particles.push(part(h.x+h.w/2, h.y+10, Math.cos(a)*s, Math.sin(a)*s, rand(0.5,0.9), Math.random()<0.5?'#f4ecd2':'#c9a24a', 2, 130)); }
      }
    }
  }
}

export function drawHelpers(){
  for(const h of G.helpers){
    const px = sx(h.x); if(px < -40 || px > VW+40) continue;
    if(h.freed){
      if(h.t > 1.2) continue;
      ctx.globalAlpha = Math.max(0, 1 - h.t/1.2);
      drawSprite(px, Math.round(h.y - h.t*22), h, true);
      ctx.globalAlpha = 1; continue;
    }
    const cx = px + h.w/2, cy = h.y + h.h/2, gl = 1 + Math.sin(G.time*3 + h.phase)*0.15;
    const col = h.kind==='spider' ? '224,85,106' : '232,212,154';
    const gr = ctx.createRadialGradient(cx, cy, 2, cx, cy, 26*gl);
    gr.addColorStop(0,'rgba('+col+',0.26)'); gr.addColorStop(1,'rgba('+col+',0)');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(cx, cy, 26*gl, 0, 6.2832); ctx.fill();
    drawSprite(px, Math.round(h.y), h, false);
    const iy = h.y - 9 + Math.sin(G.time*3 + h.phase)*2;
    if(h.kind==='spider') drawHeart(cx, iy, 5, '#e0556a'); else drawBone(cx, iy, 4, '#f4ecd2', '#c9a24a');
  }
}
function drawSprite(px,py,h,freed){ if(h.kind==='spider') drawHelperSpider(px,py,h,freed); else drawHelperRanger(px,py,h,freed); }

function drawHeart(cx,cy,r,fill){
  ctx.save(); ctx.fillStyle=fill; ctx.beginPath();
  ctx.arc(cx-r*0.5, cy, r*0.55, 0, 6.2832); ctx.arc(cx+r*0.5, cy, r*0.55, 0, 6.2832);
  ctx.moveTo(cx-r, cy+0.2*r); ctx.lineTo(cx+r, cy+0.2*r); ctx.lineTo(cx, cy+r*1.25); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawHelperRanger(px, py, h, freed){
  const HAT='#5a3c22',HAT_D='#3a2614',HAT_HI='#7a5230',BAND='#241407',FEA='#c0492b',FEA_HI='#e0673a';
  const SKIN='#d8a878',SKIN_D='#a87850',HAIR='#2a1c12',HAIR_HI='#4a3320';
  const COAT='#8a3322',COAT_HI='#ab4a30',COAT_D='#5a1f14',SHIRT='#caa869',SHIRT_D='#9a7a44';
  const SCARF='#7d2530',SCARF_D='#5a1620',BELT='#2e1c10',BUCK='#c9a24a',BUCK_HI='#e8d49a';
  const BOOT='#3a2414',BOOT_HI='#5a3a22',EYE='#160d06';
  const bob=freed?0:Math.round(Math.sin(G.time*3+h.phase));
  ctx.save(); ctx.translate(px, py+bob);
  // cabello largo (detras)
  ctx.fillStyle=HAIR; ctx.fillRect(1,9,20,19); ctx.fillStyle=HAIR_HI; ctx.fillRect(1,9,2,15);
  // botas
  ctx.fillStyle=BOOT; ctx.fillRect(7,29,3,4); ctx.fillRect(12,29,3,4); ctx.fillStyle=BOOT_HI; ctx.fillRect(7,29,3,1); ctx.fillRect(12,29,3,1);
  // abrigo
  ctx.fillStyle=COAT; ctx.fillRect(4,17,14,13); ctx.fillStyle=COAT_HI; ctx.fillRect(4,17,3,13); ctx.fillStyle=COAT_D; ctx.fillRect(15,17,3,13);
  ctx.fillStyle=SHIRT; ctx.fillRect(9,17,4,10); ctx.fillStyle=SHIRT_D; ctx.fillRect(9,24,4,3);
  ctx.fillStyle=BUCK; ctx.fillRect(10,19,1,1); ctx.fillRect(10,21,1,1);
  ctx.fillStyle=BELT; ctx.fillRect(4,25,14,2); ctx.fillStyle=BUCK; ctx.fillRect(10,25,2,2); ctx.fillStyle=BUCK_HI; ctx.fillRect(10,25,1,1);
  // brazos + manos
  ctx.fillStyle=COAT_D;
  if(freed){ ctx.fillRect(2,12,3,6); ctx.fillRect(17,12,3,6); } else { ctx.fillRect(2,18,3,8); ctx.fillRect(17,18,3,8); }
  ctx.fillStyle=SKIN;
  if(freed){ ctx.fillRect(2,10,3,2); ctx.fillRect(17,10,3,2); } else { ctx.fillRect(2,25,3,2); ctx.fillRect(17,25,3,2); }
  // mechones largos por delante (se nota el cabello)
  ctx.fillStyle=HAIR; ctx.fillRect(5,15,2,11); ctx.fillRect(15,15,2,11); ctx.fillStyle=HAIR_HI; ctx.fillRect(5,15,1,7);
  // bufanda
  ctx.fillStyle=SCARF; ctx.fillRect(7,16,8,2); ctx.fillStyle=SCARF_D; ctx.fillRect(7,17,8,1);
  // cara
  ctx.fillStyle=SKIN; ctx.fillRect(7,9,8,7); ctx.fillStyle=SKIN_D; ctx.fillRect(7,14,8,2);
  ctx.fillStyle=HAIR; ctx.fillRect(6,9,2,6); ctx.fillRect(14,9,2,6); ctx.fillRect(7,8,8,1);
  ctx.fillStyle=EYE; ctx.fillRect(9,12,2,2); ctx.fillRect(13,12,1,2); ctx.fillStyle=SKIN_D; ctx.fillRect(11,13,1,2);
  // sombrero de bruja (ala ancha + copa puntiaguda)
  ctx.fillStyle=HAT_D; ctx.fillRect(0,8,22,2); ctx.fillStyle=HAT; ctx.fillRect(0,7,22,1);
  ctx.fillStyle=HAT; ctx.fillRect(6,2,10,6); ctx.fillRect(8,-2,6,4);
  ctx.fillStyle=HAT_HI; ctx.fillRect(6,2,2,6); ctx.fillRect(8,-2,2,4);
  ctx.fillStyle=BAND; ctx.fillRect(6,6,10,1);
  ctx.fillStyle=FEA; ctx.fillRect(15,-3,2,5); ctx.fillStyle=FEA_HI; ctx.fillRect(15,-3,1,3);
  ctx.restore();
}

function drawHelperSpider(px, py, h, freed){
  const bob = freed ? 0 : Math.round(Math.sin(G.time*3 + h.phase));
  ctx.save(); ctx.translate(px, py + bob);
  const SK='#7a4a2e',SK_D='#5e3620',SK_HI='#9a6038',HR='#15101a',HR_HI='#2a2230';
  const RED='#c0202a',RED_HI='#e0404a',BLU='#2a3a9a',BLU_D='#1a2466';
  const WEB='#cdd2e0',BLK='#0a0a0a',LIP='#c86a7a',CHK='#9a4a3a',WHT='#f0e8e0',IRIS='#3a2418';
  // pelo largo (detras)
  ctx.fillStyle=HR; ctx.fillRect(1,4,18,21); ctx.fillStyle=HR_HI; ctx.fillRect(1,4,2,17);
  // cara
  ctx.fillStyle=SK; ctx.fillRect(6,5,8,9); ctx.fillStyle=SK_D; ctx.fillRect(6,12,8,2); ctx.fillStyle=SK_HI; ctx.fillRect(6,5,8,1);
  // flequillo + mechones
  ctx.fillStyle=HR; ctx.fillRect(5,3,10,3); ctx.fillRect(5,4,2,8); ctx.fillRect(13,4,2,8);
  // ojos grandes
  ctx.fillStyle=WHT; ctx.fillRect(7,8,2,3); ctx.fillRect(11,8,2,3);
  ctx.fillStyle=IRIS; ctx.fillRect(7,9,2,2); ctx.fillRect(11,9,2,2);
  ctx.fillStyle=BLK; ctx.fillRect(8,9,1,1); ctx.fillRect(12,9,1,1);
  ctx.fillStyle='#fff'; ctx.fillRect(7,8,1,1); ctx.fillRect(11,8,1,1);
  ctx.fillStyle=CHK; ctx.fillRect(6,11,1,1); ctx.fillRect(13,11,1,1);
  ctx.fillStyle=LIP; ctx.fillRect(9,12,2,1);
  ctx.fillStyle=SK; ctx.fillRect(9,13,2,1);
  // piernas + botas rojas
  ctx.fillStyle=SK; ctx.fillRect(7,26,2,2); ctx.fillRect(11,26,2,2);
  ctx.fillStyle=RED; ctx.fillRect(6,28,4,2); ctx.fillRect(10,28,4,2); ctx.fillStyle=RED_HI; ctx.fillRect(6,28,4,1); ctx.fillRect(10,28,4,1);
  // falda azul con telarana
  ctx.fillStyle=BLU; ctx.fillRect(4,22,12,5); ctx.fillStyle=BLU_D; ctx.fillRect(4,26,12,1);
  ctx.fillStyle=WEB; ctx.fillRect(10,22,1,5); ctx.fillRect(5,24,10,1); ctx.fillRect(6,22,1,2); ctx.fillRect(14,22,1,2);
  // torso (azul lados + rojo centro)
  ctx.fillStyle=BLU; ctx.fillRect(5,14,10,8); ctx.fillStyle=BLU_D; ctx.fillRect(5,14,1,8); ctx.fillRect(14,14,1,8);
  ctx.fillStyle=RED; ctx.fillRect(8,14,4,8);
  ctx.fillStyle=WEB; ctx.fillRect(6,16,1,1); ctx.fillRect(13,18,1,1); ctx.fillRect(6,19,1,1); ctx.fillRect(13,15,1,1);
  // emblema arana
  ctx.fillStyle=BLK; ctx.fillRect(9,16,2,4); ctx.fillRect(8,17,1,1); ctx.fillRect(11,17,1,1); ctx.fillRect(8,19,1,1); ctx.fillRect(11,19,1,1); ctx.fillRect(9,15,2,1);
  // brazos (mangas azules + guantes rojos)
  ctx.fillStyle=BLU;
  if(freed){ ctx.fillRect(2,11,3,5); ctx.fillRect(15,11,3,5); } else { ctx.fillRect(3,14,2,5); ctx.fillRect(15,14,2,5); }
  ctx.fillStyle=RED;
  if(freed){ ctx.fillRect(2,9,3,2); ctx.fillRect(15,9,3,2); } else { ctx.fillRect(3,19,2,2); ctx.fillRect(15,19,2,2); }
  ctx.restore();
}
