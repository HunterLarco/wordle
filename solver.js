const inquirer = require('inquirer');

const Dictionary = require('./dictionary.js');
const { AbstractWordleGame, LetterState } = require('./game.js');

class ClassicWordleGame extends AbstractWordleGame {
  constructor() {
    super();

    this.solutionSpace_ = new Dictionary();
    this.solutionSpace_.pruneWords(({ word }) => word.length != 5);
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

    const score = [...results].map(c => {
      switch (c) {
        case 'n':
          return LetterState.NotPresent;
        case 'y':
          return LetterState.WrongLocation;
        case 'g':
          return LetterState.Correct;
      }
    });

    this.pruneSolutionSpace(guess, score);
    return score;
  }

  pruneSolutionSpace(guess, score) {
    for (let i = 0; i < guess.length; ++i) {
      switch (score[i]) {
        case LetterState.NotPresent:
          this.solutionSpace_.pruneNodes(({ letter }) => letter == guess[i]);
          break;
        case LetterState.WrongLocation:
          this.solutionSpace_.pruneWords(
            ({ word }) => word[i] == guess[i] || !new Set(word).has(guess[i])
          );
          break;
        case LetterState.Correct:
          this.solutionSpace_.pruneNodes(
            ({ depth, letter }) => depth == i + 1 && letter != guess[i]
          );
          break;
      }
    }

    for (const word of this.solutionSpace_.words()) {
      console.log(word);
    }
  }

  onWin(guesses) {
    console.log(`You won on guess ${guesses}!`);
  }

  onLose() {
    console.log('You lost!');
  }
};

const game = new ClassicWordleGame();
game.run();
