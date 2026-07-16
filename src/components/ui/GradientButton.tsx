import React from "react";
import "@/styles/GradientButton.css";

type CommonProps = {
  text?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

type AsLink = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "style" | "children"> & {
    href: string;
  };

type AsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "style" | "children"> & {
    href?: undefined;
  };

export type GradientButtonProps = AsLink | AsButton;

export default function GradientButton({
  text = "Start Trading",
  className = "",
  style,
  children,
  ...rest
}: GradientButtonProps) {
  const content = (
    <>
      <div className="border"></div>
      <div className="color1"></div>
      <div className="color1-glow"></div>
      <div className="color2"></div>
      <div className="color2-glow"></div>
      <div className="fill"></div>
      <span className="btn-text">{children ?? text}</span>
    </>
  );

  if ("href" in rest && rest.href) {
    const { href, target, ...anchorRest } = rest as AsLink;
    return (
      <a
        href={href}
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : undefined}
        className={`framer-btn ${className}`}
        style={style}
        aria-label={typeof text === "string" ? text : undefined}
        {...anchorRest}
      >
        {content}
      </a>
    );
  }

  const { type = "button", ...buttonRest } = rest as AsButton;
  return (
    <button
      type={type}
      className={`framer-btn ${className}`}
      style={style}
      aria-label={typeof text === "string" ? text : undefined}
      {...buttonRest}
    >
      {content}
    </button>
  );
}
