const inquirer = require('inquirer');

const ClassicWordleGame = require('./modes/classic.js');
const SolverWordleGame = require('./modes/solver.js');

function main() {
  const game = new SolverWordleGame();
  game.run();
}

main();
