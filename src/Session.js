import { saveSession, startSession } from "./selectWords";
import { useState, useRef, useEffect } from "react";
import SessionProgress from "./SessionProgress";
import "./Session.css";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";
import classNames from "classnames";
import { FindWordDifference } from "./helpers";
import { BASE_URL } from "./config";

const WordsPerQuiz = 10;

function Session({ showSummary, sessionSummary, setSessionSummary }) {
  const [quizWords] = useState(startSession(WordsPerQuiz));
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const audioPlayer = useRef(null);
  const answerInput = useRef(null);
  const nextButton = useRef(null);

  const currentWord = quizWords[currentWordIndex];
  const isLastQuestion = currentWordIndex === WordsPerQuiz - 1;
  const wordSummary = sessionSummary[currentWordIndex];
  const isCorrectAnswer = wordSummary && wordSummary.isCorrect;

  useEffect(() => {
    const input = answerInput.current;
    if (!input) {
      return;
    }
    const listener = (event) => {
      if (event.code === "Enter" || event.code === "NumpadEnter") {
        event.preventDefault();
        document.getElementById("check-answer-button").click();
      }
    };

    input.addEventListener("keydown", listener);

    return () => {
      input.removeEventListener("keydown", listener);
    };
  }, [answerInput, currentWordIndex]);

  // Using this effect to focus the next button as passing autoFocus to a wrapped component doesn't seem
  // to work when the element is initially hidden. Works with an unwrapped button.
  useEffect(() => {
    if (!nextButton.current) {
      return;
    }
    nextButton.current.focus();
  }, [showAnswer]);

  const handleNext = () => {
    if (isLastQuestion) {
      saveSession(sessionSummary);
      showSummary();
    }

    setShowAnswer(false);
    setUserAnswer("");
    setCurrentWordIndex(currentWordIndex + 1);
    audioPlayer.current.pause();
    audioPlayer.current.load();
  };

  const handleCheckAnswer = () => {
    // TODO: Trigger validation if input is missing

    const newSessionSummary = [...sessionSummary];
    const answerSummary = {
      ...currentWord,
      date: new Date(),
      userAnswer: userAnswer,
      isCorrect: ValidateSpelling(userAnswer, currentWord.word),
    };
    newSessionSummary.splice(currentWordIndex, 1, answerSummary);
    setSessionSummary(newSessionSummary);
    audioPlayer.current.pause();
    setShowAnswer(true);
  };

  return (
    <div className="session">
      <SessionProgress sessionSummary={sessionSummary} numberOfQuestions={WordsPerQuiz} className="session-progress" />

      <audio controls autoPlay ref={audioPlayer} className="audio-player">
        <source src={`${BASE_URL}/audio/${currentWord.word}.mp3`} type="audio/mp3" />
      </audio>
      <div>
        Part of Speech: <span className="bold">{currentWord.partOfSpeech}</span>
      </div>

      {showAnswer && (
        <div className="answer-container">
          <div className={classNames("answer", { correct: isCorrectAnswer, incorrect: !isCorrectAnswer })}>
            {currentWord.word}
          </div>
          {!isCorrectAnswer && (
            <div className="user-answer">Your answer: {FindWordDifference(userAnswer, currentWord.word)}</div>
          )}
        </div>
      )}

      {!showAnswer && (
        <>
          <input
            autoFocus
            ref={answerInput}
            className="answer-input"
            placeholder="Enter your answer"
            onChange={(event) => setUserAnswer(event.target.value)}
          />
        </>
      )}
      <div className="options-footer">
        <SecondaryButton
          className="quit-button"
          onClick={() => {
            showSummary();
          }}
        >
          Quit
        </SecondaryButton>

        {showAnswer ? (
          <PrimaryButton ref={nextButton} className="next-button" onClick={handleNext}>
            {isLastQuestion ? "Done" : "Next"}
          </PrimaryButton>
        ) : (
          <PrimaryButton className="check-button" id="check-answer-button" onClick={handleCheckAnswer}>
            Check Answer
          </PrimaryButton>
        )}
      </div>
    </div>
  );
}

function ValidateSpelling(userAnswer, correctSpelling) {
  return userAnswer.trim().toLowerCase() === correctSpelling.trim().toLowerCase();
}

export default Session;
