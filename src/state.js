// state.js — estado mutable compartido por todos los módulos
// (todo lo que se reasigna vive como propiedad de G para que las
//  referencias importadas sigan apuntando al valor actualizado)
export const G = {
  state:'intro',          // intro | play | clear | dead | victory
  levelIndex:0,
  time:0,
  cameraX:0,
  LEVEL_W:5000,

  platforms:[], enemies:[], relics:[], projectiles:[],
  particles:[], waves:[], candles:[], decor:[], helpers:[],

  killed:0, total:0, altarX:0, clearTimer:0,

  settings:{ diff:1, hearts:4 },
  hearts:4, maxHearts:4,
  barkCooldown:0, spinCooldown:0, spinTimer:0
};

// el jugador es un objeto fijo: mutamos sus campos, nunca lo reasignamos
export const player = {
  x:40, y:0, bw:24, bh:18, w:24, h:18, scale:1,
  vx:0, vy:0, facing:1, onGround:false,
  coyote:0, jumpBuffer:0, jumpCut:false,
  relic:0, invuln:0, runFrame:0, stepT:0, stepT2:0
};

// flags de teclado, leidos por la fisica y escritos por input.js
export const input = { left:false, right:false, jump:false };
