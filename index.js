const inquirer = require('inquirer');

const Dictionary = require('./dictionary.js');

const solutionSpace = new Dictionary();

function getAnswer(trie) {
  const words = [...solutionSpace.words(trie)];
  if (words.length == 1) {
    return words[0];
  }
}

async function main() {
  solutionSpace.pruneWords(({ word }) => word.length != 5);

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
