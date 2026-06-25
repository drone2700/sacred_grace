// level.js — construccion de niveles, transicion y victoria
import { G, player } from './state.js';
import { GROUND_Y, levels } from './config.js';
import { rand } from './utils.js';
import { placeEnemy } from './enemies.js';
import { setScale } from './player.js';
import { SFX } from './audio.js';
import { burst } from './particles.js';
import { show } from './ui.js';

export function buildLevel(idx){
  G.levelIndex = idx;
  G.LEVEL_W = 5000;
  G.platforms=[]; G.enemies=[]; G.relics=[]; G.projectiles=[];
  G.particles=[]; G.waves=[]; G.candles=[]; G.decor=[]; G.helpers=[];
  G.killed=0;

  // suelo continuo (sin pozos mortales)
  G.platforms.push({ x:-40, y:GROUND_Y, w:G.LEVEL_W+80, h:120, oneWay:false, ground:true });

  const L = levels[idx];
  let x = 280, seg=0;
  while(x < G.LEVEL_W-340){
    const pat = seg % 4;
    if(idx!==3){ // los tejados generan sus plataformas con los gatos
      if(pat===0){ G.platforms.push({ x:x, y:GROUND_Y-46, w:74, h:9, oneWay:true }); }
      else if(pat===1){ G.platforms.push({ x:x, y:GROUND_Y-44, w:60, h:9, oneWay:true });
                        G.platforms.push({ x:x+96, y:GROUND_Y-78, w:58, h:9, oneWay:true }); }
      else if(pat===2){ G.platforms.push({ x:x+30, y:GROUND_Y-58, w:66, h:9, oneWay:true }); }
    }
    placeEnemy(L.enemy, x + rand(-20,30));
    if(seg%2===1 && idx>=1) placeEnemy(L.enemy, x + rand(90,150));
    if(seg%2===0) G.candles.push({ x:x+rand(20,60), y:GROUND_Y });
    G.decor.push({ x:x+rand(0,200), type: seg%3 });
    x += 280; seg++;
  }

  // reliquias doradas
  [820, 2050, 3300, 4250].forEach((rx,i)=>{
    G.relics.push({ x:rx, y:GROUND_Y-66, base:GROUND_Y-66, w:14, h:14, got:false, phase:i*1.7 });
  });

  // ayudantes (2a mitad del nivel): al pasar te dan el Huesito de Poder
  G.helpers = [];
  [[G.LEVEL_W*0.55,'ranger',22,34],[G.LEVEL_W*0.80,'spider',20,30]].forEach(([hx,kind,hw,hh],i)=>{
    G.helpers.push({ x: Math.round(hx + rand(-120,120)), y: GROUND_Y-hh, w:hw, h:hh, freed:false, t:0, phase:i*2.1, kind });
  });

  G.total = G.enemies.length;
  G.altarX = G.LEVEL_W - 120;
  G.candles.push({x:G.altarX-16,y:GROUND_Y}); G.candles.push({x:G.altarX+44,y:GROUND_Y});

  // reset del jugador
  player.x=40; player.vx=0; player.vy=0; player.facing=1; player.onGround=false;
  player.relic=0; player.invuln=0; player.jumpCut=true; player.jumpBuffer=0; player.coyote=0;
  setScale(1);
  player.y = GROUND_Y - player.h;
  G.hearts = G.maxHearts; G.barkCooldown=0; G.spinCooldown=0; G.spinTimer=0;
  G.cameraX=0;
  G.state='play';
}

export function triggerClear(){
  if(G.state!=='play') return;
  G.state='clear'; G.clearTimer=2.8;
  if(G.levelIndex>=levels.length-1) SFX.victory(); else SFX.clear();
  burst(player.x+player.w/2, player.y+player.h/2, '#e8d49a', 30, 220);
}
export function advance(){
  if(G.levelIndex>=levels.length-1){ G.state='victory'; show('victory'); }
  else buildLevel(G.levelIndex+1);
}
