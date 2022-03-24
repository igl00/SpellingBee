import {
  NextWordIndexKey,
  DoOverWordsKey,
  startSession,
  saveSession,
  ArchivedDoOverWordsKey,
  MinutesTillReAttempt,
} from "./selectWords";

const safeMsTillReAttempt = (MinutesTillReAttempt + 1) * 60 * 1000;

jest.mock("./resources/dictionary.json", () => ({
  words: [
    { word: "one", partOfSpeech: "noun" },
    { word: "two", partOfSpeech: "noun" },
    { word: "three", partOfSpeech: "noun" },
    { word: "four", partOfSpeech: "noun" },
    { word: "five", partOfSpeech: "noun" },
    { word: "six", partOfSpeech: "noun" },
    { word: "seven", partOfSpeech: "noun" },
    { word: "eight", partOfSpeech: "noun" },
    { word: "nine", partOfSpeech: "noun" },
    { word: "ten", partOfSpeech: "noun" },
  ],
}));

test("startSession when session exists start from last word index", () => {
  global.localStorage.setItem(NextWordIndexKey, "2");

  expect(startSession(2)).toStrictEqual([
    { word: "three", partOfSpeech: "noun", isNew: true },
    { word: "four", partOfSpeech: "noun", isNew: true },
  ]);
});

test("startSession when no session exists starts from beginning of dictionary", () => {
  expect(startSession(2)).toStrictEqual([
    { word: "one", partOfSpeech: "noun", isNew: true },
    { word: "two", partOfSpeech: "noun", isNew: true },
  ]);
});

test("startSession when at end of dictionary wraps round to the start of the dictionary", () => {
  global.localStorage.setItem(NextWordIndexKey, "9");

  expect(startSession(2)).toStrictEqual([
    { word: "ten", partOfSpeech: "noun", isNew: true },
    { word: "one", partOfSpeech: "noun", isNew: true },
  ]);
});

test("startSession when do over words are available should include do over words", () => {
  global.localStorage.setItem(NextWordIndexKey, "9");
  const now = new Date();
  const doOverWordData = [
    {
      word: "one",
      partOfSpeech: "noun",
      attempts: [{ correct: false, date: new Date(now.getTime() - safeMsTillReAttempt) }],
    },
    {
      word: "five",
      partOfSpeech: "noun",
      attempts: [{ correct: false, date: new Date(now.getTime() - safeMsTillReAttempt) }],
    },
    {
      word: "ten",
      partOfSpeech: "noun",
      attempts: [{ correct: false, date: new Date(now.getTime() - safeMsTillReAttempt) }],
    },
  ];
  global.localStorage.setItem(DoOverWordsKey, JSON.stringify(doOverWordData));

  expect(startSession(4)).toStrictEqual([
    { word: "one", partOfSpeech: "noun", isNew: false },
    { word: "five", partOfSpeech: "noun", isNew: false },
    { word: "ten", partOfSpeech: "noun", isNew: true },
    { word: "two", partOfSpeech: "noun", isNew: true },
  ]);
});

test("startSession when do over word is recent should not include do over word", () => {
  global.localStorage.setItem(NextWordIndexKey, "9");
  const now = new Date();
  const doOverWordData = [
    {
      word: "one",
      partOfSpeech: "noun",
      attempts: [{ correct: false, date: new Date(now.getTime() - 10 * 60 * 1000) }],
    },
    {
      word: "five",
      partOfSpeech: "noun",
      attempts: [{ correct: false, date: new Date(now.getTime() - safeMsTillReAttempt) }],
    },
    {
      word: "ten",
      partOfSpeech: "noun",
      attempts: [{ correct: false, date: new Date(now.getTime() - safeMsTillReAttempt) }],
    },
  ];
  global.localStorage.setItem(DoOverWordsKey, JSON.stringify(doOverWordData));

  expect(startSession(4)).toStrictEqual([
    { word: "five", partOfSpeech: "noun", isNew: false },
    { word: "ten", partOfSpeech: "noun", isNew: false },
    { word: "one", partOfSpeech: "noun", isNew: true },
    { word: "two", partOfSpeech: "noun", isNew: true },
  ]);
});

test("saveSession when called should update next word index", () => {
  saveSession([{ word: "one", isNew: true, date: new Date(), correct: true }]);
  expect(global.localStorage.getItem(NextWordIndexKey)).toBe("1");
});

test("saveSession when called new incorrect words should add them to the do over word list", () => {
  const now = new Date();
  saveSession([{ word: "one", partOfSpeech: "noun", isNew: true, date: now, isCorrect: false }]);
  const savedDoOverWords = JSON.parse(global.localStorage.getItem(DoOverWordsKey));
  expect(savedDoOverWords).toStrictEqual([
    { word: "one", partOfSpeech: "noun", attempts: [{ isCorrect: false, date: now.toISOString() }] },
  ]);
});

test("saveSession when called with do over words should update the do over words attempts", () => {
  const now = new Date();
  const oldDoOverWords = [{ word: "one", partOfSpeech: "noun", attempts: [{ isCorrect: false, date: now }] }];
  global.localStorage.setItem(DoOverWordsKey, JSON.stringify(oldDoOverWords));

  saveSession([{ word: "one", partOfSpeech: "noun", isNew: false, date: now, isCorrect: true }]);
  const savedDoOverWords = JSON.parse(global.localStorage.getItem(DoOverWordsKey));
  expect(savedDoOverWords).toStrictEqual([
    {
      word: "one",
      partOfSpeech: "noun",
      attempts: [
        { isCorrect: false, date: now.toISOString() },
        { isCorrect: true, date: now.toISOString() },
      ],
    },
  ]);
});

test("saveSession when do over word has been answered correctly n times should remove it from do over word list", () => {
  const now = new Date();
  const oldDoOverWords = [
    {
      word: "one",
      partOfSpeech: "noun",
      attempts: [
        { isCorrect: false, date: now },
        { isCorrect: true, date: now },
        { isCorrect: true, date: now },
      ],
    },
  ];
  global.localStorage.setItem(DoOverWordsKey, JSON.stringify(oldDoOverWords));

  saveSession([{ word: "one", partOfSpeech: "noun", isNew: false, date: now, isCorrect: true }]);
  const savedDoOverWords = JSON.parse(global.localStorage.getItem(DoOverWordsKey));
  expect(savedDoOverWords).toStrictEqual([]);
  const archivedDoOverWords = JSON.parse(global.localStorage.getItem(ArchivedDoOverWordsKey));
  expect(archivedDoOverWords).toStrictEqual([
    {
      word: "one",
      partOfSpeech: "noun",
      attempts: [
        { isCorrect: false, date: now.toISOString() },
        { isCorrect: true, date: now.toISOString() },
        { isCorrect: true, date: now.toISOString() },
        { isCorrect: true, date: now.toISOString() },
      ],
    },
  ]);
});

afterEach(() => {
  global.localStorage.clear();
});
