// utils.js — funciones puras de matemática y colisión
export const clamp = (v,a,b)=> v<a?a:(v>b?b:v);
export const lerp  = (a,b,t)=> a+(b-a)*t;
export const rand  = (a,b)=> a+Math.random()*(b-a);
export const randi = (a,b)=> Math.floor(rand(a,b+1));

export function aabb(a,b){
  return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
}
export function pseudo(n){
  const s = Math.sin(n*127.1+0.5)*43758.5453;
  return Math.floor((s-Math.floor(s))*1000);
}
// aclara un color hex por amt (0-255) y devuelve rgb()
export function shade(hex, amt){
  const n = parseInt(hex.slice(1),16);
  let r=(n>>16)+amt, g=((n>>8)&255)+amt, b=(n&255)+amt;
  r=clamp(r,0,255); g=clamp(g,0,255); b=clamp(b,0,255);
  return 'rgb('+r+','+g+','+b+')';
}
