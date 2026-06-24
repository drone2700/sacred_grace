// ui.js — control de las pantallas/overlays HTML
const OVERLAYS = ['intro','death','victory'];

export function show(id){
  OVERLAYS.forEach(o=> document.getElementById(o).classList.toggle('hidden', o!==id));
}
export function hideAll(){
  OVERLAYS.forEach(o=> document.getElementById(o).classList.add('hidden'));
}
