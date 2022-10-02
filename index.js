const inquirer = require('inquirer');

async function createGame() {
  const { mode } = await inquirer.prompt({
    type: 'list',
    name: 'mode',
    message: 'What game mode would you like to play?',
    choices: ['Classic', 'Solver'],
  });

  switch (mode) {
    case 'Classic':
      const ClassicWordleGame = require('./modes/classic.js');
      return new ClassicWordleGame();
    case 'Solver':
      const SolverWordleGame = require('./modes/solver.js');
      return new SolverWordleGame();
  }

  throw `Unexpected game mode ${mode}.`;
}

async function main() {
  const game = await createGame();
  game.run();
}

main();
