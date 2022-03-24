import classNames from "classnames";
import "./SecondaryButton.css";

function SecondaryButton({ children, className, ...props }) {
  return (
    <button className={classNames("secondary-button", className)} {...props}>
      {children}
    </button>
  );
}

export default SecondaryButton;
