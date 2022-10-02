const inquirer = require('inquirer');

const SolutionSpace = require('../solution_space.js');
const { AbstractWordleGame, LetterState } = require('../game.js');

module.exports = class SolverWordleGame extends AbstractWordleGame {
  constructor() {
    super();

    this.solutionSpace_ = new SolutionSpace();
  }

  async getGuess() {
    const { guess } = await inquirer.prompt({
      type: 'input',
      name: 'guess',
      message: 'What word did you guess?',
      validate: (results) => {
        if (!results.match(/^[a-z]{5}$/)) {
          return 'Invalid entry.';
        }
        return true;
      },
    });

    return guess;
  }

  async scoreWord(guess) {
    const { results } = await inquirer.prompt({
      type: 'input',
      name: 'results',
      message: `What are the results for "${guess}"?`,
      validate: (results) => {
        if (!results.match(/^(y|n|g){5}$/)) {
          return 'Invalid entry.';
        }
        return true;
      },
    });

    const score = [...results].map((c) => {
      switch (c) {
        case 'n':
          return LetterState.NotPresent;
        case 'y':
          return LetterState.WrongLocation;
        case 'g':
          return LetterState.Correct;
      }
    });

    this.solutionSpace_.prune(guess, score);
    for (const word of this.solutionSpace_.words()) {
      console.log(word);
    }

    return score;
  }

  onWin(guesses) {
    console.log(`You won on guess ${guesses}!`);
  }

  onLose() {
    console.log('You lost!');
  }
}
