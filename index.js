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

    const { rawResults } = await inquirer.prompt({
      type: 'input',
      name: 'rawResults',
      message: `What are the results for "${guess}"?`,
      validate: (results) => {
        if (!results.match(/^(y|n|g){5}$/)) {
          return 'Invalid entry.';
        }
        return true;
      },
    });

    const results = { y: [], n: [], g: [] };
    for (let i = 0; i < rawResults.length; ++i) {
      switch (rawResults[i]) {
        case 'n':
          results.n.push({ letter: guess[i], index: i });
          break;
        case 'y':
          results.y.push({ letter: guess[i], index: i });
          break;
        case 'g':
          results.g.push({ letter: guess[i], index: i });
          break;
      }
    }

    solutionSpace.pruneNodes((node) => {
      // First check if this node represents a letter position that we already
      // know the correct value for. If so, we can safely either prune when the
      // node is incorrect, or preserve when the node is correct.
      for (const { letter, index } of results.g) {
        if (node.depth == index + 1) {
          return node.letter != letter;
        }
      }

      // Next, if this node represents a letter that is not contained in the
      // solution, prune it.
      //
      // It's important that this check comes after the known correct checks.
      // This way in a situation where a letter is used twice like in "SPOON" if
      // the first "O" is green and the second, black, then we don't prune words
      // with "O" as the 3rd letter.
      for (const { letter, index } of results.n) {
        if (node.letter == letter) {
          return true;
        }
      }

      // We then partially apply the yellow constraint: we prune any nodes where
      // the yellow letter is positioned at a known incorrect position.
      for (const { letter, index } of results.y) {
        if (node.depth == index + 1 && node.letter == letter) {
          return true;
        }
      }

      return false;
    });

    // We then finish the yellow constrain by removing entire words which don't
    // contain enough of the known letters. This cannot be part of the
    // `pruneNodes` call because it requires the entire word to fulfill the
    // predicate, however, executing after `pruneNodes` reduces the search
    // space.
    const letterCounts = {};
    for (const { letter } of results.y) {
      letterCounts[letter] = (letterCounts[letter] || 0) + 1;
    }
    for (const { letter } of results.g) {
      if (letterCounts[letter]) {
        ++letterCounts[letter];
      }
    }
    solutionSpace.pruneWords(({ word }) => {
      const wordHistogram = {};
      for (const letter of word) {
        wordHistogram[letter] = (wordHistogram[letter] || 0) + 1;
      }
      for (const [letter, count] of Object.entries(letterCounts)) {
        if (!wordHistogram[letter] || wordHistogram[letter] < count) {
          return true;
        }
      }
      return false;
    });

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
