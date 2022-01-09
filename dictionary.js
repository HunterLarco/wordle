const deepcopy = require('deepcopy');

const DICTIONARY = require('./dictionary.trie.json');

function pruneNodes(trie, word, predicate) {
  for (const [letter, node] of Object.entries(trie.children)) {
    if (
      predicate({ node, letter, depth: word.length + 1, word: word + letter })
    ) {
      delete trie.children[letter];
      continue;
    }

    pruneNodes(node, word + letter, predicate);

    if (!node.isEnd && Object.keys(node.children).length == 0) {
      delete trie.children[letter];
    }
  }
}

function pruneWords(trie, word, predicate) {
  if (trie.isEnd && predicate({ word })) {
    trie.isEnd = false;
  }

  for (const [letter, node] of Object.entries(trie.children)) {
    pruneWords(node, word + letter, predicate);

    if (!node.isEnd && Object.keys(node.children).length == 0) {
      delete trie.children[letter];
    }
  }
}

function* iterate(trie, word) {
  yield { node: trie, word };
  for (const [letter, node] of Object.entries(trie.children)) {
    yield* iterate(node, word + letter);
  }
}

module.exports = class Dictionary {
  constructor() {
    this._trie = deepcopy(DICTIONARY);
  }

  pruneWords(predicate) {
    pruneWords(this._trie, '', predicate);
  }

  pruneNodes(predicate) {
    pruneNodes(this._trie, '', predicate);
  }

  *words() {
    for (const { node, word } of iterate(this._trie, '')) {
      if (node.isEnd) {
        yield word;
      }
    }
  }
};
