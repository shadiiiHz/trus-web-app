import React from "react";
import "@/styles/GradientButton.css";
import { ButtonSpinner } from "./ButtonSpinner";

type CommonProps = {
  text?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  /** Replaces the label with a centred spinner and blocks clicks until cleared. */
  loading?: boolean;
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
  loading = false,
  ...rest
}: GradientButtonProps) {
  const classes = `framer-btn ${loading ? "btn-loading is-loading" : ""} ${className}`;
  const content = (
    <>
      <div className="border"></div>
      <div className="color1"></div>
      <div className="color1-glow"></div>
      <div className="color2"></div>
      <div className="color2-glow"></div>
      <div className="fill"></div>
      <span className="btn-text">{children ?? text}</span>
      <span className="btn-spinner-slot">
        <ButtonSpinner size={20} />
      </span>
    </>
  );

  if ("href" in rest && rest.href) {
    const { href, target, ...anchorRest } = rest as AsLink;
    return (
      <a
        href={href}
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : undefined}
        className={classes}
        style={style}
        aria-label={typeof text === "string" ? text : undefined}
        aria-busy={loading || undefined}
        {...anchorRest}
      >
        {content}
      </a>
    );
  }

  const { type = "button", disabled, ...buttonRest } = rest as AsButton;
  return (
    <button
      type={type}
      className={classes}
      style={style}
      aria-label={typeof text === "string" ? text : undefined}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      {...buttonRest}
    >
      {content}
    </button>
  );
}
