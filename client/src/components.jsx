import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Eye, EyeOff, X, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import c from "./content/site.json";
export const copy = c;
export function replaceSiteCopy(next) {
  const merge = (target, source) => {
    if (Array.isArray(source)) return source.map((value) => value && typeof value === "object" ? merge({}, value) : value);
    if (!source || typeof source !== "object") return source;
    for (const key of Object.keys(target)) if (!(key in source)) delete target[key];
    for (const [key, value] of Object.entries(source)) {
      if (Array.isArray(value)) target[key] = merge([], value);
      else if (value && typeof value === "object") target[key] = merge(target[key] && typeof target[key] === "object" && !Array.isArray(target[key]) ? target[key] : {}, value);
      else target[key] = value;
    }
    return target;
  };
  merge(copy, next);
}
export function Reveal({ children, className = "", ...props }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: reduced ? 0 : 0.5 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
export function Action({ to, children, className = "", ...props }) {
  return to ? (
    <Link to={to} className={`button ${className}`} {...props}>
      {children}
      <ArrowUpRight size={17} />
    </Link>
  ) : (
    <button className={`button ${className}`} {...props}>
      {children}
    </button>
  );
}
export function ErrorMessage({ error }) {
  return error ? (
    <p className="error-banner" role="alert">
      {error.message || String(error)}
    </p>
  ) : null;
}
function autocompleteForField(name = "", label = "", type = "text") {
  if (type === "password") return "off";
  if (type === "file" || type === "checkbox" || type === "radio-group" || type === "checkbox-group" || type === "select") return undefined;
  const key = `${name} ${label}`.toLowerCase();
  if (type === "email" || /\bemail\b/.test(key)) return "email";
  if (name === "username" || /\busername\b/.test(key)) return "username";
  if (/phone|mobile|telephone|contact\s*(?:number|phone|no\b)/.test(key)) return "tel";
  if (/postal|pin code|pincode|zip/.test(key)) return "postal-code";
  if (/\baddress\b/.test(key)) return "street-address";
  if (/\b(full )?name\b/.test(key) && !/guardian|father|mother|spouse|emergency|reference/.test(key)) return "name";
  if (/website|portfolio|linkedin|github|url/.test(key)) return "url";
  if (/institution|college|school|organization/.test(key)) return "organization";
  if (/date of birth|\bdob\b|\bbirth date\b/.test(key)) return "bday";
  if (type === "date") return undefined;
  return "on";
}
export function Field({ field, register, error }) {
  const id = useId(),
    [show, setShow] = useState(false),
    [filePreview, setFilePreview] = useState(null);
  const {
    name,
    label,
    type = "text",
    required,
    visibleRequired,
    placeholder,
    options,
    accept,
  } = field;
  const common = {
    id,
    readOnly: field.readOnly,
    "aria-invalid": !!error,
    "aria-describedby": error ? `${id}-error` : undefined,
    required,
    ...register(name),
  };
  useEffect(() => () => { if (filePreview) URL.revokeObjectURL(filePreview); }, [filePreview]);
  let control;
  if (type === "radio-group")
    return (
      <fieldset className={`field radio-group ${field.wide ? "wide" : ""}`}>
        <legend>{label}{required && visibleRequired !== false && <span className="required"> *</span>}</legend>
        <div className="radio-options">{options.map((option) => <label className="radio-option" key={option}><input type="radio" value={option} {...register(name)} />{option}</label>)}</div>
        {error && <span className="field-error">{error.message}</span>}
      </fieldset>
    );
  if (type === "checkbox-group")
    return (
      <fieldset className={`field checkbox-group ${field.wide ? "wide" : ""}`}>
        <legend>{label}{required && visibleRequired !== false && <span className="required"> *</span>}</legend>
        <div className="checkbox-options">{options.map((option) => <label className="checkbox-option" key={option}><input type="checkbox" value={option} {...register(name)} />{option}</label>)}</div>
        {error && <span className="field-error">{error.message}</span>}
      </fieldset>
    );
  else if (type === "textarea")
    control = <textarea {...common} autoComplete={autocompleteForField(name, label, type)} rows={4} placeholder={placeholder} />;
  else if (type === "select")
    control = (
      <select {...common}>
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value || o} value={o.value || o}>
            {o.label || o}
          </option>
        ))}
      </select>
    );
  else if (type === "checkbox")
    return (
      <div className={`field checkbox-field ${field.wide ? "wide" : ""}`}>
        <label htmlFor={id}>
          <input {...common} type="checkbox" />
          {label}
          {required && visibleRequired !== false && (
            <span className="required">*</span>
          )}
        </label>
        {error && (
          <span className="field-error" id={`${id}-error`}>
            {error.message}
          </span>
        )}
      </div>
    );
  else
    control = (
      <div className={type === "password" ? "password-wrap" : ""}>
        <input
          {...common}
          type={type === "password" && show ? "text" : type}
          placeholder={placeholder}
          accept={accept}
          onChange={type === "file" && /Signature/.test(name) ? (event) => {
            common.onChange(event);
            setFilePreview(event.target.files?.[0] ? URL.createObjectURL(event.target.files[0]) : null);
          } : undefined}
          min={type === "number" ? 1 : undefined}
          max={type === "number" ? 1000000 : undefined}
          autoComplete={autocompleteForField(name, label, type)}
        />
        {type === "password" && (
          <button
            className="password-toggle"
            type="button"
            aria-label={show ? c.demo.hidePassword : c.demo.showPassword}
            onClick={() => setShow(!show)}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    );
  return (
    <div className={`field ${field.wide ? "wide" : ""}`}>
      <label htmlFor={id}>
        {label}
        {required && visibleRequired !== false && (
          <span className="required">*</span>
        )}
      </label>
      {control}
      {type === "file" && /Signature/.test(name) && <div className="signature-preview" aria-live="polite">{filePreview ? <img src={filePreview} alt={`${label} preview`} /> : <span>{label} preview</span>}</div>}
      {type === "file" && (
        <small>{name === "cv" ? c.demo.cvHelp : c.demo.imageHelp}</small>
      )}
      {error && (
        <span className="field-error" id={`${id}-error`}>
          {error.message}
        </span>
      )}
    </div>
  );
}
export function Fields({ fields, form }) {
  return fields
    .filter(
      (field, index) =>
        !field.group ||
        index === fields.findIndex((f) => f.group === field.group),
    )
    .map((field) =>
      field.group ? (
        <div className="field-stack" key={field.group}>
          <Fields
            fields={fields
              .filter((f) => f.group === field.group)
              .map(({ group, ...f }) => f)}
            form={form}
          />
        </div>
      ) : (
        <Field
          key={field.name}
          field={field}
          register={form.register}
          error={form.formState.errors[field.name]}
        />
      ),
    );
}
export function Modal({ title, onClose, children }) {
  const ref = useRef(),
    heading = useId();
  useEffect(() => {
    const previous = document.activeElement,
      oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    const handle = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const nodes = [
          ...ref.current.querySelectorAll(
            'button,a,input,select,textarea,[tabindex="0"]',
          ),
        ].filter((el) => !el.disabled);
        const first = nodes[0],
          last = nodes.at(-1);
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === ref.current)
        ) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handle);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", handle);
      previous?.focus();
    };
  }, [onClose]);
  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className="modal glass"
        role="dialog"
        aria-modal="true"
        aria-labelledby={heading}
        tabIndex={-1}
        ref={ref}
      >
        <button
          type="button"
          className="icon-button modal-close"
          aria-label={c.demo.close}
          onClick={onClose}
        >
          <X />
        </button>
        <h2 id={heading}>{title}</h2>
        {children}
      </section>
    </div>,
    document.body,
  );
}
export function Success({ result, onClose, title = c.demo.success }) {
  return (
    <Modal title={title} onClose={onClose}>
      <CheckCircle2 className="success-icon" size={48} />
      {result.reference && <p>{c.demo.paymentExplanation}</p>}
      <small>{c.demo.registrationId}</small>
      <p className="registration-id">
        {result.registrationId || result.reference}
      </p>
      <Action onClick={onClose}>{c.demo.close}</Action>
    </Modal>
  );
}
export function TextBlocks({ blocks }) {
  return blocks.map((b, i) => (
    <div className="text-block" key={i}>
      {b.title && <h3>{b.title}</h3>}
      {b.text && <p className="preserve-lines">{b.text}</p>}
      {b.items && (
        <ol>
          {b.items.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ol>
      )}
    </div>
  ));
}
export function ImageTranscript({ text }) {
  return (
    <span className="sr-only">
      {Array.isArray(text) ? text.join(". ") : text}
    </span>
  );
}
