import React, { createContext, useCallback, useContext, useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, AlertTriangle, AlertOctagon, Info, ArrowRight, RefreshCw, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ConfirmationContext = createContext(null);

export function SuccessPopupProvider({ children }) {
  const [dialogData, setDialogData] = useState(null);
  const navigate = useNavigate();
  const autoCloseTimer = useRef(null);

  const showConfirmation = useCallback((options) => {
    if (autoCloseTimer.current) {
      clearTimeout(autoCloseTimer.current);
      autoCloseTimer.current = null;
    }

    const type = options.type || "success";
    const heading = options.title || options.heading || (
      type === "success"
        ? "Operation Successful"
        : type === "error"
          ? "Action Could Not Be Completed"
          : type === "warning"
            ? "Attention Required"
            : "Information"
    );
    const message = options.message || options.description || "";
    const actionText = options.actionText || (type === "error" ? "Close" : "Continue");
    const onAction = options.onAction || null;
    const secondaryActionText = options.secondaryActionText || null;
    const onSecondaryAction = options.onSecondaryAction || null;
    const autoCloseMs = options.autoCloseMs || 0;

    setDialogData({
      type,
      heading,
      message,
      actionText,
      onAction,
      secondaryActionText,
      onSecondaryAction,
      onClose: options.onClose || null,
      category: options.category || null,
      referenceId: options.referenceId || null,
      applicantName: options.applicantName || null,
      details: Array.isArray(options.details) ? options.details : [],
    });

    if (autoCloseMs > 0) {
      autoCloseTimer.current = setTimeout(() => {
        if (options.onAction) {
          try { options.onAction(); } catch {}
        }
        setDialogData(null);
      }, autoCloseMs);
    }
  }, []);

  // Backward compatibility alias for showSuccessPopup
  const showSuccessPopup = useCallback((data) => {
    showConfirmation({
      type: data.type || "success",
      title: data.heading || "Application Submitted Successfully!",
      message: data.message || "Your kindness and generosity help us create a better tomorrow.",
      actionText: data.actionText || "Continue",
      onAction: data.onAction || null,
      onClose: data.onClose || null,
      category: data.category || null,
      referenceId: data.referenceId || data.registrationId || null,
      applicantName: data.applicantName || data.name || null,
      details: data.details || [],
    });
  }, [showConfirmation]);

  const closeDialog = useCallback(() => {
    if (autoCloseTimer.current) {
      clearTimeout(autoCloseTimer.current);
      autoCloseTimer.current = null;
    }
    if (dialogData?.onClose) {
      try { dialogData.onClose(); } catch {}
    }
    setDialogData(null);
  }, [dialogData]);

  const handlePrimaryAction = useCallback(() => {
    if (autoCloseTimer.current) {
      clearTimeout(autoCloseTimer.current);
      autoCloseTimer.current = null;
    }
    const fn = dialogData?.onAction;
    setDialogData(null);
    if (fn) {
      try { fn(); } catch {}
    }
  }, [dialogData]);

  const handleSecondaryAction = useCallback(() => {
    if (autoCloseTimer.current) {
      clearTimeout(autoCloseTimer.current);
      autoCloseTimer.current = null;
    }
    const fn = dialogData?.onSecondaryAction;
    setDialogData(null);
    if (fn) {
      try { fn(); } catch {}
    }
  }, [dialogData]);

  // Close on Escape key
  useEffect(() => {
    if (!dialogData) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeDialog();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialogData, closeDialog]);

  const dialogType = dialogData?.type || "success";

  return (
    <ConfirmationContext.Provider value={{ showConfirmation, showSuccessPopup, closeDialog, closePopup: closeDialog }}>
      {children}
      <AnimatePresence>
        {dialogData && (
          <div className="confirmation-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirmation-modal-title">
            <motion.div
              className="confirmation-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDialog}
            />
            <motion.div
              className={`confirmation-landscape-block block-type-${dialogType}`}
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
            >
              {/* Close Button */}
              <button
                type="button"
                className="confirmation-close-btn"
                onClick={closeDialog}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>

              {/* Glowing Background Radial */}
              <div className={`confirmation-glow glow-${dialogType}`} aria-hidden="true" />

              {/* Central Icon */}
              <div className="confirmation-icon-container">
                {dialogType === "success" && (
                  <div className="confirmation-badge badge-success">
                    <motion.svg
                      className="confirmation-svg-checkmark"
                      viewBox="0 0 52 52"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <motion.circle
                        cx="26"
                        cy="26"
                        r="24"
                        stroke="var(--accent, #10b981)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                      />
                      <motion.path
                        d="M15 27L22 34L37 19"
                        stroke="var(--accent, #10b981)"
                        strokeWidth="3.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.35, delay: 0.25, ease: "easeOut" }}
                      />
                    </motion.svg>
                  </div>
                )}
                {dialogType === "error" && (
                  <div className="confirmation-badge badge-error">
                    <AlertOctagon size={30} />
                  </div>
                )}
                {dialogType === "warning" && (
                  <div className="confirmation-badge badge-warning">
                    <AlertTriangle size={30} />
                  </div>
                )}
                {dialogType === "info" && (
                  <div className="confirmation-badge badge-info">
                    <Info size={30} />
                  </div>
                )}
              </div>

              {/* Heading */}
              <h2 id="confirmation-modal-title" className="confirmation-heading">
                {dialogData.heading}
              </h2>

              {/* Description Message */}
              <p className="confirmation-message">
                {dialogData.message}
              </p>

              {/* Gratitude Note for Successful Submissions */}
              {dialogType === "success" && (
                <div className="confirmation-gratitude-note">
                  <span className="confirmation-gratitude-title">Thank You for Your Support!</span>
                  <span className="confirmation-gratitude-desc">Your kindness and generosity help us create a better tomorrow.</span>
                </div>
              )}

              {/* Optional Reference or Meta pill (kept inline to preserve landscape height) */}
              {(dialogData.referenceId || dialogData.applicantName) && (
                <div className="confirmation-meta-row">
                  {dialogData.referenceId && (
                    <span className="confirmation-meta-pill">
                      <strong>Ref:</strong> <code>{dialogData.referenceId}</code>
                    </span>
                  )}
                  {dialogData.applicantName && (
                    <span className="confirmation-meta-pill">
                      <strong>Name:</strong> {dialogData.applicantName}
                    </span>
                  )}
                </div>
              )}

              {/* Action Buttons Row */}
              <div className="confirmation-actions-row">
                {dialogData.secondaryActionText && (
                  <button
                    type="button"
                    className="button secondary confirmation-btn"
                    onClick={handleSecondaryAction}
                  >
                    <span>{dialogData.secondaryActionText}</span>
                  </button>
                )}
                <button
                  type="button"
                  className={`button confirmation-btn ${dialogType === "error" ? "btn-danger" : "btn-primary"}`}
                  onClick={handlePrimaryAction}
                  autoFocus
                >
                  <span>{dialogData.actionText}</span>
                  {dialogType === "success" && <ArrowRight size={16} />}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmationContext.Provider>
  );
}

export function useConfirmationDialog() {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error("useConfirmationDialog must be used within SuccessPopupProvider");
  }
  return context;
}

export const useSuccessPopup = useConfirmationDialog;
