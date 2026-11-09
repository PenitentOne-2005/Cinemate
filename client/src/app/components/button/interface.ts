export interface ButtonProps {
  children: React.ReactNode;
  type: buttonType;
  className: classNameType;
  onClick?: () => void;
  disabled?: boolean;
}

type buttonType = "button" | "submit" | "reset";

type classNameType =
  | "primaryButton"
  | "dangerButton"
  | "secondaryButton"
  | "cancelButton"
  | "saveButton"
  | "closeButton"
  | "editButton";
