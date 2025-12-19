import Game from './Game.js';

const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

const SCALE = 3;
canvas.width = 256 * SCALE;
canvas.height = 240 * SCALE;
context.scale(SCALE, SCALE);

const game = new Game(canvas);
game.init();
