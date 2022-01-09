const inquirer = require("inquirer");

const dictionary = require("./dictionary.trie.json");

function pruneHelper(trie, word, predicate) {
  for (const [letter, node] of Object.entries(trie.children)) {
    if (predicate(node, letter, word + letter)) {
      delete trie.children[letter];
      continue;
    }

    pruneHelper(node, word + letter, predicate);

    if (!node.isEnd && Object.keys(node.children).length == 0) {
      delete trie.children[letter];
    }
  }
}

function prune(node, predicate) {
  pruneHelper(node, "", predicate);
}

function getAnswer(trie) {
  const words = getWords(trie);
  if (words.length == 1) {
    return words[0];
  }
}

function getWords(trie, prefix) {
  prefix = prefix || "";

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
  prune(dictionary, (node, letter, word) => node.isEnd && word.length != 5);

  for (let j = 0; j < 6; ++j) {
    const { guess } = await inquirer.prompt({
      type: "input",
      name: "guess",
      message: "What word did you guess?",
      validate: (results) => {
        if (!results.match(/^[a-z]{5}$/)) {
          return "Invalid entry.";
        }
        return true;
      },
    });

    const { results } = await inquirer.prompt({
      type: "input",
      name: "results",
      message: `What are the results for "${guess}"?`,
      validate: (results) => {
        if (!results.match(/^(y|n|g){5}$/)) {
          return "Invalid entry.";
        }
        return true;
      },
    });

    for (let i = 0; i < results.length; ++i) {
      const result = results[i];
      switch (result) {
        case "n":
          prune(dictionary, (node, letter, word) => letter == guess[i]);
          break;
        case "y":
          prune(
            dictionary,
            (node, _, word) =>
              node.isEnd &&
              (word[i] == guess[i] || !new Set(word).has(guess[i]))
          );
          break;
        case "g":
          prune(
            dictionary,
            (node, letter, word) => word.length == i + 1 && letter != guess[i]
          );
          break;
      }
    }

    const answer = getAnswer(dictionary);
    if (answer) {
      console.log(`The answer is ${answer}.`);
      break;
    }

    console.log(getWords(dictionary).join("\n"));
  }
}

main();
