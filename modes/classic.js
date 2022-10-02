const inquirer = require('inquirer');

const Dictionary = require('../dictionary.js');
const { AbstractWordleGame, LetterState } = require('../game.js');

module.exports = class ClassicWordleGame extends AbstractWordleGame {
  constructor() {
    super();

    const dictionary = new Dictionary();
    dictionary.pruneWords(({ word }) => word.length != 5);
    const words = [...dictionary.words()];
    this.answer_ = words[Math.floor(Math.random() * words.length)];
  }

  async getGuess() {
    const { guess } = await inquirer.prompt({
      type: 'input',
      name: 'guess',
      message: 'What word would you like to guess?',
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
    const score = [];
    for (let i = 0; i < guess.length; ++i) {
      if (guess[i] == this.answer_[i]) {
        score.push(LetterState.Correct);
      } else if (this.answer_.indexOf(guess[i]) >= 0) {
        score.push(LetterState.WrongLocation);
      } else {
        score.push(LetterState.NotPresent);
      }
    }

    console.log(LetterState.toEmojis(score));
    return score;
  }

  onWin(guesses) {
    console.log(`You won on guess ${guesses}!`);
  }

  onLose() {
    console.log('You lost!');
    console.log(`The answer was "${this.answer_}"`);
  }
}
