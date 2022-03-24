import classNames from "classnames";
import "./SessionProgress.css";

function Progress({ sessionSummary, numberOfQuestions, className }) {
  const answers = sessionSummary.map(({ isCorrect }) => isCorrect);
  while (answers.length < numberOfQuestions) {
    answers.push(null);
  }
  const margin = (400 - numberOfQuestions * 8) / numberOfQuestions / 2;

  return (
    <div className={classNames("session-progress", className)}>
      {answers.map((answer, i) => {
        return (
          <span
            key={i}
            style={{ marginLeft: margin, marginRight: margin }}
            className={classNames("session-progress-item", { correct: answer === true, incorrect: answer === false })}
          />
        );
      })}
    </div>
  );
}

export default Progress;
