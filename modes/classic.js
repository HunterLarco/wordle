const chalk = require('chalk');
const inquirer = require('inquirer');

const Dictionary = require('../dictionary.js');
const { AbstractWordleGame, LetterState } = require('../game.js');

function formatKeyboard(excludedLetters) {
  const keyboard = [
    { keys: 'QWERTYUIOP', offset: 0 },
    { keys: 'ASDFGHJKL', offset: 1 },
    { keys: 'ZXCVBNM', offset: 3 },
  ];
  const letterSpacing = 1;

  let string = '';
  for (const { keys, offset } of keyboard) {
    for (let i = 0; i < offset; ++i) {
      string += ' ';
    }
    for (const key of keys) {
      string +=
        excludedLetters.has(key) || excludedLetters.has(key.toLowerCase())
          ? chalk.dim(key)
          : key;
      for (let i = 0; i < letterSpacing; ++i) {
        string += ' ';
      }
    }
    string.trimEnd();
    string += '\n';
  }
  return string.trimEnd();
}

function createHistogram(iterable) {
  const histogram = {};
  for (const value of iterable) {
    histogram[value] = (histogram[value] || 0) + 1;
  }
  return histogram;
}

module.exports = class ClassicWordleGame extends AbstractWordleGame {
  constructor() {
    super();

    // Select a random 5-letter word.
    const dictionary = new Dictionary();
    dictionary.pruneWords(({ word }) => word.length != 5);
    const words = [...dictionary.words()];
    this.answer_ = words[Math.floor(Math.random() * words.length)];

    this.excludedLetters_ = new Set();
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
    const remainingLetters = createHistogram(this.answer_);
    for (let i = 0; i < guess.length; ++i) {
      if (guess[i] == this.answer_[i]) {
        score.push(LetterState.Correct);
        --remainingLetters[guess[i]];
      } else if (remainingLetters[guess[i]] > 0) {
        score.push(LetterState.WrongLocation);
        --remainingLetters[guess[i]];
      } else {
        score.push(LetterState.NotPresent);
        if (this.answer_.indexOf(guess[i]) == -1) {
          this.excludedLetters_.add(guess[i]);
        }
      }
    }

    console.log();
    console.log('    ' + guess.split('').join(' ').toUpperCase());
    console.log('    ' + LetterState.toEmojis(score));
    console.log();
    console.log(chalk.bold('     Keyboard'));
    console.log(formatKeyboard(this.excludedLetters_));
    console.log();

    return score;
  }

  onWin(guesses) {
    console.log(chalk.green(`You won on guess ${guesses}!`));
  }

  onLose() {
    console.log(`${chalk.red('You lost!')} The answer was "${this.answer_}"`);
  }
};
