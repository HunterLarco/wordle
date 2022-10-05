const inquirer = require('inquirer');

async function getGameMode() {
  if (process.argv[2]) {
    return process.argv[2];
  }

  const { mode } = await inquirer.prompt({
    type: 'list',
    name: 'mode',
    message: 'What game mode would you like to play?',
    choices: ['Classic', 'Solver'],
  });
  return mode;
}

async function createGame() {
  const mode = await getGameMode();
  switch (mode.toLowerCase()) {
    case 'classic':
      const ClassicWordleGame = require('./modes/classic.js');
      return new ClassicWordleGame();
    case 'solver':
      const SolverWordleGame = require('./modes/solver.js');
      return new SolverWordleGame();
  }

  throw `Unexpected game mode ${mode}.`;
}

async function main() {
  const game = await createGame();
  game.run();
}

main().catch((error) => {
  console.error(error);
});
