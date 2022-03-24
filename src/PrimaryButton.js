import { forwardRef } from "react";
import classNames from "classnames";
import "./PrimaryButton.css";

const PrimaryButton = forwardRef(({ children, className, ...props }, ref) => (
  <button {...props} ref={ref} className={classNames("primary-button", className)}>
    {children}
  </button>
));

export default PrimaryButton;
