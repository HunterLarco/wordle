const chalk = require('chalk');
const inquirer = require('inquirer');

const Dictionary = require('../dictionary.js');
const Scoring  = require('../scoring.js');
const { AbstractWordleGame, LetterState } = require('../game.js');

function getKeyboardLetterColor(letter, letterScores) {
  const scores = letterScores[letter.toLowerCase()];
  if (scores) {
    if (scores.has(LetterState.Correct)) {
      return chalk.bold(chalk.green(letter));
    } else if (scores.has(LetterState.WrongLocation)) {
      return chalk.bold(chalk.yellow(letter));
    } else if (scores.has(LetterState.NotPresent)) {
      return chalk.dim(letter);
    }
  }
  return letter;
}

function formatKeyboard(letterScores) {
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
      string += getKeyboardLetterColor(key, letterScores);
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

    this.dictionary_ = new Dictionary();
    this.dictionary_.pruneWords(({ word }) => word.length != 5);

    // Select a random 5-letter word.
    const words = [...this.dictionary_.words()];
    this.answer_ = words[Math.floor(Math.random() * words.length)];

    this.letterScores_ = {};
  }

  async getGuess() {
    const { guess } = await inquirer.prompt({
      type: 'input',
      name: 'guess',
      message: 'What word would you like to guess?',
      validate: (guess) => {
        if (!guess.match(/^[a-z]{5}$/)) {
          return 'Invalid entry.';
        }
        if (!this.dictionary_.hasWord(guess)) {
          return 'Not a word.';
        }
        return true;
      },
    });

    return guess;
  }

  async scoreWord(guess) {
    const score = Scoring.score({ guess, answer: this.answer_ });

    for (let i = 0; i < score.length; ++i) {
      const guessedLetter = guess[i];
      const letterState = score[i];

      if (!this.letterScores_[guessedLetter]) {
        this.letterScores_[guessedLetter] = new Set();
      }
      this.letterScores_[guessedLetter].add(letterState);
    }

    console.log();
    console.log('    ' + guess.split('').join(' ').toUpperCase());
    console.log('    ' + LetterState.toEmojis(score));
    console.log();
    console.log(chalk.bold('     Keyboard'));
    console.log(formatKeyboard(this.letterScores_));
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
