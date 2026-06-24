// input.js — teclado: movimiento, salto (buffer + variable), giro y ladrido
import { initAudio } from './audio.js';
import { player, input } from './state.js';
import { JBUF } from './config.js';
import { trySpin, tryBark } from './player.js';

const GAME_KEYS = new Set(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyA','KeyD','KeyW','Space','KeyJ','KeyK','KeyL']);

window.addEventListener('keydown', e=>{
  initAudio();
  const c = e.code;
  if(GAME_KEYS.has(c)) e.preventDefault();
  if(c==='ArrowLeft'||c==='KeyA') input.left=true;
  else if(c==='ArrowRight'||c==='KeyD') input.right=true;
  else if(c==='Space'||c==='KeyW'||c==='ArrowUp'){
    if(!input.jump){ player.jumpBuffer = JBUF; }
    input.jump=true;
  }
  else if((c==='KeyJ'||c==='KeyK') && !e.repeat) trySpin();
  else if(c==='KeyL' && !e.repeat) tryBark();
});
window.addEventListener('keyup', e=>{
  const c=e.code;
  if(c==='ArrowLeft'||c==='KeyA') input.left=false;
  else if(c==='ArrowRight'||c==='KeyD') input.right=false;
  else if(c==='Space'||c==='KeyW'||c==='ArrowUp'){
    input.jump=false;
    if(player.vy<0 && !player.jumpCut){ player.vy*=0.45; player.jumpCut=true; }  // salto variable
  }
});
