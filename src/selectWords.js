import dictionary from "./resources/dictionary.json";

const storage = window.localStorage;

export const NextWordIndexKey = "NextWordIndex";
export const DoOverWordsKey = "DoOverWords";
export const ArchivedDoOverWordsKey = "ArchivedDoOverWords";
export const MinutesTillReAttempt = 15;
export const CorrectReAttemptTillDone = 3;

export function startSession(numberOfWords) {
  const nextWordIndex = parseInt(storage.getItem(NextWordIndexKey)) || 0;

  const numberOfDoOverWords = Math.floor(numberOfWords / 2);
  const doOverWords = selectDoOverWords(numberOfDoOverWords);
  const words = doOverWords.map((doOverWord) => ({
    word: doOverWord.word,
    partOfSpeech: doOverWord.partOfSpeech,
    isNew: false,
  }));

  let i = nextWordIndex;
  while (words.length < numberOfWords) {
    const word = dictionary.words[i % dictionary.words.length];

    // Make sure the new word hasn't already been added as a do over word
    if (!words.some((x) => x.word === word.word)) {
      words.push({ word: word.word, isNew: true, partOfSpeech: word.partOfSpeech });
    }
    i++;
  }

  return words;
}

// const attemptedWordExample = {
//   word: "test",
//   partOfSpeech: "noun",
//   isNew: false,
//   date: new Date(),
//   isCorrect: true,
// };

export function saveSession(attemptedWords) {
  // Update the word list index for the number of words attempted
  const newWords = attemptedWords.filter((x) => x.isNew);
  if (newWords.length > 0) {
    const lastWord = newWords[newWords.length - 1];
    const indexOfLastWord = dictionary.words.map((x) => x.word).indexOf(lastWord.word);
    storage.setItem(NextWordIndexKey, indexOfLastWord + 1);
  }

  // Save the changes to the do over words list
  const doOverWords = JSON.parse(storage.getItem(DoOverWordsKey)) || [];

  // Log re-attempted do over words
  const updatedDoOverWords = attemptedWords.filter((x) => !x.isNew);
  updatedDoOverWords.forEach((updatedWord) => {
    const doOverWord = doOverWords.find((word) => word.word === updatedWord.word);
    if (doOverWord == null) {
      console.error(`Expected do over word to exist in storage: ${updatedWord.word}`);
    }
    doOverWord.attempts.push({ isCorrect: updatedWord.isCorrect, date: updatedWord.date });
  });

  // Log new incorrect words as do over words
  const newDoOverWords = newWords.filter((x) => !x.isCorrect);
  newDoOverWords.forEach((newWord) => {
    doOverWords.push({
      word: newWord.word,
      partOfSpeech: newWord.partOfSpeech,
      attempts: [{ isCorrect: newWord.isCorrect, date: newWord.date }],
    });
  });

  // Move any do over words that have been answered correctly N times to an archive
  const archivedDoOverWords = JSON.parse(storage.getItem(ArchivedDoOverWordsKey)) || [];
  const liveDoOverWords = [];

  doOverWords.forEach((word) => {
    const lastAttempts = word.attempts.slice(-CorrectReAttemptTillDone);
    if (lastAttempts.length < CorrectReAttemptTillDone || !lastAttempts.every((attempt) => attempt.isCorrect)) {
      liveDoOverWords.push(word);
    } else {
      archivedDoOverWords.push(word);
    }
  });

  // Save changes to storage
  storage.setItem(DoOverWordsKey, JSON.stringify(liveDoOverWords));
  storage.setItem(ArchivedDoOverWordsKey, JSON.stringify(archivedDoOverWords));
}

// const doOverWord = {
//   word: "test",
//   partOfSpeech: "noun",
//   attempts: [{ isCorrect: false, date: Date() }],
// };

function selectDoOverWords(numberOfWords) {
  const doOverWords = JSON.parse(storage.getItem(DoOverWordsKey)) || {};

  const doOverWordKeys = Object.keys(doOverWords);
  const selectedDoOverWords = [];
  for (let i = 0; i < doOverWordKeys.length; i++) {
    const doOverWord = doOverWords[doOverWordKeys[i]];

    const lastAttempt = doOverWord.attempts[doOverWord.attempts.length - 1];
    if (new Date() - new Date(lastAttempt.date) > MinutesTillReAttempt * 60 * 1000) {
      selectedDoOverWords.push(doOverWord);
    }

    if (selectedDoOverWords.length >= numberOfWords) {
      break;
    }
  }

  return selectedDoOverWords;
}
