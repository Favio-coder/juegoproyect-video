import { useEffect, useRef } from "react";
import panelSvg from "../../../assets/paneles/PanelMensaje.svg";
import "./GameModal.css";

export interface GameModalAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
}

export interface GameModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Optional avatar/icon image shown above the panel */
  avatarSrc?: string;
  avatarAlt?: string;
  /** Title shown inside the panel */
  title?: string;
  /** Body text shown inside the panel */
  message?: string;
  /** Custom content rendered inside the panel (replaces title+message) */
  children?: React.ReactNode;
  /** Action buttons rendered below the panel content */
  actions?: GameModalAction[];
  /** Close when clicking the backdrop */
  closeOnBackdrop?: boolean;
  onClose?: () => void;
  /** Extra CSS class for the panel wrapper */
  className?: string;
  /** Width of the modal (default 520px) */
  width?: number | string;
}

/**
 * GameModal — a reusable SweetAlert-style modal that uses the
 * PanelMensaje.svg wooden-board asset as the visual frame.
 *
 * The SVG is rendered as a real <img> positioned absolutely behind
 * the content, so text/buttons always stay inside the panel area.
 */
export default function GameModal({
  isOpen,
  avatarSrc,
  avatarAlt = "avatar",
  title,
  message,
  children,
  actions = [],
  closeOnBackdrop = true,
  onClose,
  className = "",
  width = 520,
}: GameModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  /* Trap focus & ESC key */
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  /* Lock body scroll while modal is open */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdrop && e.target === backdropRef.current && onClose) {
      onClose();
    }
  };

  return (
    <div
      ref={backdropRef}
      className="gm-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`gm-container ${className}`}
        style={{ maxWidth: width }}
      >
        {/* Avatar floating above the panel */}
        {avatarSrc && (
          <div className="gm-avatar-wrap">
            <img src={avatarSrc} alt={avatarAlt} className="gm-avatar" />
          </div>
        )}

        {/* Panel wrapper: SVG as real img + content overlaid */}
        <div className="gm-panel-wrap">
          {/* The wooden board background — rendered as real <img> */}
          <img
            src={panelSvg}
            alt=""
            aria-hidden="true"
            className="gm-panel-bg"
            draggable={false}
          />

          {/* Content sits on top of the SVG */}
          <div className="gm-panel-content">
            {children ? (
              children
            ) : (
              <>
                {title && <h2 className="gm-title">{title}</h2>}
                {message && <p className="gm-message">{message}</p>}
              </>
            )}
          </div>
        </div>

        {/* Action buttons below the panel */}
        {actions.length > 0 && (
          <div className="gm-actions">
            {actions.map((action, i) => (
              <button
                key={i}
                className={`gm-btn gm-btn--${action.variant ?? "primary"}`}
                onClick={action.onClick}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
