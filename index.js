const inquirer = require('inquirer');
const randomChoice = require('random-choice');

const Dictionary = require('./dictionary.js');

const solutionSpace = new Dictionary();

function getAnswer(trie) {
  const words = [...solutionSpace.words(trie)];
  if (words.length == 1) {
    return words[0];
  }
}

function createHistogram(words, excludes) {
  const histogram = {};

  for (const word of words) {
    for (const letter of word) {
      if (excludes.has(letter)) {
        continue;
      }
      if (letter in histogram) {
        ++histogram[letter];
      } else {
        histogram[letter] = 1;
      }
    }
  }

  for (const letter of Object.keys(histogram)) {
    histogram[letter] /= words.length;
  }

  return histogram;
}

async function main() {
  solutionSpace.pruneWords(({ word }) => word.length != 5);

  const words = [...solutionSpace.words()]
  const excludes = new Set();
  for (let i = 0; i < 5; ++i) {
    const histogram = createHistogram(words, excludes); 
    const letters = Object.entries(histogram);
    letters.sort((a, b) => {
      const a_dist = Math.abs(1/6 - a[1]);
      const b_dist = Math.abs(1/6 - b[1]);
      return a_dist < b_dist ? -1 : 1;
    });
    const letter = randomChoice(letters.slice(0, 3), [1, 1, 1])[0];
    excludes.add(letter);
    console.log(letter);
  }

  for (let j = 0; j < 6; ++j) {
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

    for (let i = 0; i < results.length; ++i) {
      const result = results[i];
      switch (result) {
        case 'n':
          solutionSpace.pruneNodes(({ letter }) => letter == guess[i]);
          break;
        case 'y':
          solutionSpace.pruneWords(
            ({ word }) => word[i] == guess[i] || !new Set(word).has(guess[i])
          );
          break;
        case 'g':
          solutionSpace.pruneNodes(
            ({ depth, letter }) => depth == i + 1 && letter != guess[i]
          );
          break;
      }
    }

    const answer = getAnswer();
    if (answer) {
      console.log(`The answer is ${answer}.`);
      break;
    }

    for (const word of solutionSpace.words()) {
      console.log(word);
    }
  }
}

main();
