// config.js — constantes inmutables y datos de los niveles
export const VW = 480, VH = 270;
export const GROUND_Y = 236;            // borde superior del suelo

// fisica del jugador
export const ACCEL = 900, MAXRUN = 130, FRICTION = 1500, AIRACCEL = 620;
export const G_UP = 820, G_DOWN = 1500, JUMP_V = -308, RELIC_JUMP = 1.42;
export const COYOTE = 0.10, JBUF = 0.12;

// habilidades
export const BARK_CD = 3.6, RELIC_TIME = 8;
export const SPIN_CD = 0.7, SPIN_DUR = 0.45;   // giro-ataque (coletazo)

// paletas + tipo de enemigo por nivel
export const levels = [
  { name:'EL CAMPOSANTO', enemy:'squirrel',
    sky:['#241a36','#3a2240','#5a2a38'], moon:'#e8d49a', tower:'#160f22', tower2:'#241733', fog:'rgba(120,80,110,0.18)', accent:'#86202f' },
  { name:'EL ENJAMBRE', enemy:'bug',
    sky:['#101d1a','#1b3026','#3a3a1e'], moon:'#cfe0a0', tower:'#0c1714', tower2:'#16261d', fog:'rgba(90,120,80,0.18)', accent:'#7a8a2a' },
  { name:'EL CAMPANARIO', enemy:'pigeon',
    sky:['#1a1226','#2a1d3a','#43314f'], moon:'#d9c7ef', tower:'#120c1e', tower2:'#1f1630', fog:'rgba(120,100,150,0.20)', accent:'#9a6ad0' },
  { name:'LOS TEJADOS', enemy:'cat',
    sky:['#2a1220','#4a1a2a','#86202f'], moon:'#f0c98a', tower:'#1a0c14', tower2:'#2e131e', fog:'rgba(150,80,90,0.20)', accent:'#e8a24a' }
];
