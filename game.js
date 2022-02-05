const LetterState = {
  NotPresent: Symbol('NotPresent'),
  WrongLocation: Symbol('WrongLocation'),
  Correct: Symbol('Correct'),

  toEmoji(state) {
    switch (state) {
      case LetterState.NotPresent:
        return '⬜';
      case LetterState.WrongLocation:
        return '🟨';
      case LetterState.Correct:
        return '🟩';
    }
  },

  toEmojis(states) {
    return states.map(s => LetterState.toEmoji(s)).join('');
  },
};

class AbstractWordleGame {
  async run() {
    for (let i = 0; i < 6; ++i) {
      const word = await this.getGuess();
      const score = await this.scoreWord(word);
      if (score.every(s => s == LetterState.Correct)) {
        this.onWin(i + 1);
        return;
      }
    }

    this.onLose();
  }

  async getGuess() {
    throw Error('Not implemented');
  }

  async scoreWord() {
    throw Error('Not implemented');
  }

  onWin() {
    throw Error('Not implemented');
  }

  onLose() {
    throw Error('Not implemented');
  }
};

module.exports = {
  LetterState,
  AbstractWordleGame,
};
