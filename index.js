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

function printWords(trie, prefix) {
  prefix = prefix || '';
  if (trie.isEnd) {
    console.log(prefix);
  }
  for (const [letter, node] of Object.entries(trie.children)) {
    printWords(node, prefix + letter);
  }
}

prune(dictionary, (node, word) => word.length == 5);
prune(dictionary, (node, word) => node.isEnd && word[3] == 'e');
printWords(dictionary);
