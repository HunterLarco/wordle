const inquirer = require('inquirer');

const dictionary = require('./dictionary.trie.json');

function pruneHelper(trie, word, predicate) {
  for (const [letter, node] of Object.entries(trie.children)) {
    if (!predicate(node, word + letter)) {
      node.isEnd = false;
    }

    pruneHelper(node, word + letter, predicate);

    if (!node.isEnd && Object.keys(node.children).length == 0) {
      delete trie.children[letter];
    }
  }
}

function prune(node, predicate) {
  pruneHelper(node, '', predicate);
}

function getAnswer(trie) {
  const words = getWords(trie);
  if (words.length == 1) {
    return words[0];
  }
}

function getWords(trie, prefix) {
  prefix = prefix || '';

  let words = [];

  if (trie.isEnd) {
    words.push(prefix);
  }

  for (const [letter, node] of Object.entries(trie.children)) {
    words = words.concat(getWords(node, prefix + letter));
  }

  return words;
}

async function main() {
  prune(dictionary, (node, word) => word.length == 5);

  for (let j = 0; j < 6; ++j) {
    const {guess} = await inquirer.prompt({
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

    const {results} = await inquirer.prompt({
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
      const letter = guess[i];
      switch (result) {
        case 'n':
          prune(dictionary, (node, word) => node.isEnd &&
              !(new Set(word).has(letter)));
          break;
        case 'y':
          prune(dictionary, (node, word) => node.isEnd && word[i] != letter &&
              new Set(word).has(letter));
          break;
        case 'g':
          prune(dictionary, (node, word) => node.isEnd && word[i] == letter)
          break;
      }
    }

    const answer = getAnswer(dictionary);
    if (answer) {
      console.log(`The answer is ${answer}.`);
      break;
    }

    console.log(getWords(dictionary).join('\n'));
  }
}

main();
