import { useState } from "react";
import "./App.css";
import Session from "./Session";
import SessionSummary from "./SessionSummary";
import Welcome from "./Welcome";

// TODO: Create component to check if session and local storage are available. If they aren't show an error.
function App() {
  const [sessionState, setSessionState] = useState("welcome");
  const [sessionSummary, setSessionSummary] = useState([]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Spelling Bee 🐝</h1>
      </header>
      <div>
        {sessionState === "welcome" && (
          <Welcome
            startSession={() => {
              setSessionState("session");
              setSessionSummary([]);
            }}
          />
        )}
        {sessionState === "session" && (
          <Session
            showSummary={() => setSessionState("summary")}
            sessionSummary={sessionSummary}
            setSessionSummary={setSessionSummary}
          />
        )}
        {sessionState === "summary" && (
          <SessionSummary sessionSummary={sessionSummary} endSession={() => setSessionState("welcome")} />
        )}
      </div>
    </div>
  );
}

export default App;
