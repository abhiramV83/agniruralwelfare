import React, { useMemo, useRef } from "react";
import { createRegistrationDocument } from "./features/registration/registration-document";
import { useRegistrationBridge } from "./features/registration/useRegistrationBridge";
import { useRegistrationTheme } from "./features/registration/hooks/useRegistrationTheme";

export function RegistrationPortal() {
  const frame = useRef(null);
  const { busy, height } = useRegistrationBridge(frame);
  const sourceDoc = useMemo(createRegistrationDocument, []);

  useRegistrationTheme(frame);


  return <section className="registration-portal" aria-label="Create Account">
    {busy && <p aria-live="polite" className="registration-saving">Submitting registration…</p>}
    <iframe ref={frame} title="Agni Rural Welfare Society registration forms" srcDoc={sourceDoc} style={{width:"100%",height,display:"block",border:0,overflow:"hidden"}} />
  </section>;
}
