const { LetterState } = require('./game.js');

function createHistogram(iterable) {
  const histogram = {};
  for (const value of iterable) {
    histogram[value] = (histogram[value] || 0) + 1;
  }
  return histogram;
}

function score({ guess, answer }) {
  const score = [];

  const remainingLetters = createHistogram(answer);
  for (let i = 0; i < guess.length; ++i) {
    const guessedLetter = guess[i];
    const correctLetter = answer[i];

    if (guessedLetter == correctLetter) {
      score.push(LetterState.Correct);
      --remainingLetters[guessedLetter];
    } else if (remainingLetters[guessedLetter] > 0) {
      score.push(LetterState.WrongLocation);
      --remainingLetters[guessedLetter];
    } else {
      score.push(LetterState.NotPresent);
    }
  }

  return score;
}

module.exports = {score};
