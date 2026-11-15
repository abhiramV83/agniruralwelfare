import React from "react";
import { LogIn, UserPlus, ShieldCheck } from "lucide-react";

/**
 * Clean, modern icons for Login, Register, and Admin.
 * Free of any intrusive AI text tags or clutter badges.
 */
export function AiLoginIcon({ size = 18, className = "", ...props }) {
  return <LogIn size={size} className={`app-icon app-icon-login ${className}`} aria-hidden="true" {...props} />;
}

export function AiRegisterIcon({ size = 18, className = "", ...props }) {
  return <UserPlus size={size} className={`app-icon app-icon-register ${className}`} aria-hidden="true" {...props} />;
}

export function AiAdminIcon({ size = 18, className = "", ...props }) {
  return <ShieldCheck size={size} className={`app-icon app-icon-admin ${className}`} aria-hidden="true" {...props} />;
}

export function CompositeAiIcon({ Icon = LogIn, size = 18, className = "", ...props }) {
  return <Icon size={size} className={`app-icon ${className}`} aria-hidden="true" {...props} />;
}

export function AdvancedAiLogo() {
  return null;
}
