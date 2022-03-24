import "./SessionSummary.css";
import classNames from "classnames";
import { FindWordDifference } from "./helpers";
import PrimaryButton from "./PrimaryButton";

function SessionSummary({ sessionSummary, endSession }) {
  return (
    <div className="summary">
      <h2>Quiz Summary</h2>
      <ul className="summary-list">
        {sessionSummary.map(({ word, userAnswer, isCorrect }, i) => (
          <li key={i} className="summary-list-item">
            <span>
              <span className="summary-number">{i + 1}.</span>
              <span className={classNames("summary-word", { correct: isCorrect, incorrect: !isCorrect })}>{word}</span>
            </span>
            {!isCorrect && (
              <span className="summary-user-answer">Your answer: {FindWordDifference(userAnswer, word)}</span>
            )}
          </li>
        ))}
      </ul>

      <div className="summary-score">
        Score: {sessionSummary.filter((wordSummary) => wordSummary.isCorrect).length} / {sessionSummary.length}
      </div>

      <PrimaryButton className="summary-next-button" autoFocus onClick={() => endSession()}>
        Next
      </PrimaryButton>
    </div>
  );
}

export default SessionSummary;
