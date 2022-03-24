import PrimaryButton from "./PrimaryButton";
import "./Welcome.css";

function Welcome({ startSession }) {
  return (
    <PrimaryButton autoFocus onClick={() => startSession()} className="begin-button">
      Begin Quiz!
    </PrimaryButton>
  );
}

export default Welcome;
