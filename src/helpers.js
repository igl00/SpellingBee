export function FindWordDifference(wordOne, wordTwo) {
  let hasLetterError = [];
  for (let i = 0; i < wordOne.length; i++) {
    if (i >= wordTwo.length) {
      hasLetterError[i] = true;
    } else if (wordOne[i].toLowerCase() !== wordTwo[i].toLowerCase()) {
      hasLetterError[i] = true;
    } else {
      hasLetterError[i] = false;
    }
  }

  return [...wordOne].map((letter, index) => {
    const className = hasLetterError[index] ? "difference-incorrect" : "difference-correct";

    return (
      <span key={index} className={className}>
        {letter}
      </span>
    );
  });
}
