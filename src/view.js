// view.js — contexto del canvas y transformacion de camara
import { G } from './state.js';

const canvas = document.getElementById('game');
export const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// world-x -> screen-x segun la camara actual
export const sx = wx => Math.round(wx - G.cameraX);
