const Dictionary = require('./dictionary.js');
const { LetterState } = require('./game.js');

function groupByLetterStates(guess, score) {
  const results = {
    [LetterState.NotPresent]: [],
    [LetterState.WrongLocation]: [],
    [LetterState.Correct]: [],
  };

  for (let i = 0; i < score.length; ++i) {
    results[score[i]].push({
      letter: guess[i],
      index: i,
    });
  }

  return results;
}

function createHistogram(iterable) {
  const histogram = {};
  for (const value of iterable) {
    histogram[value] = (histogram[value] || 0) + 1;
  }
  return histogram;
}

/**
 * Represents the wordle solution space. Starting with all 5-letter words which
 * can be further reduced by providing wordle guess + score pairs.
 */
module.exports = class SolutionSpace {
  constructor() {
    this.dictionary_ = new Dictionary();
    this.dictionary_.pruneWords(({ word }) => word.length != 5);
  }

  prune(guess, score) {
    const scores = groupByLetterStates(guess, score);

    this.dictionary_.pruneNodes((node) => {
      // First check if this node represents a letter position that we already
      // know the correct value for. If so, we can safely either prune when the
      // node is incorrect, or preserve when the node is correct.
      for (const { letter, index } of scores[LetterState.Correct]) {
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
      for (const { letter, index } of scores[LetterState.NotPresent]) {
        if (node.letter == letter) {
          return true;
        }
      }

      // We then partially apply the yellow constraint: we prune any nodes where
      // the yellow letter is in the wrong position.
      for (const { letter, index } of scores[LetterState.WrongLocation]) {
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
    for (const { letter } of scores[LetterState.WrongLocation]) {
      letterCounts[letter] = (letterCounts[letter] || 0) + 1;
    }
    for (const { letter } of scores[LetterState.Correct]) {
      if (letterCounts[letter]) {
        ++letterCounts[letter];
      }
    }

    this.dictionary_.pruneWords(({ word }) => {
      const histogram = createHistogram(word);
      for (const [letter, count] of Object.entries(letterCounts)) {
        if (!histogram[letter] || histogram[letter] < count) {
          return true;
        }
      }
      return false;
    });
  }

  *words() {
    for (const word of this.dictionary_.words()) {
      yield word;
    }
  }
};
