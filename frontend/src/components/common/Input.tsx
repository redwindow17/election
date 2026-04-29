// ============================================================
// Input Component — Reusable text input with label & error
// ============================================================

import React from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helpText?: string;
}

export function Input({
  label,
  error,
  helpText,
  id,
  className = '',
  ...props
}: InputProps) {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${inputId}-error`;
  const helpId = `${inputId}-help`;

  return (
    <div className={`input-group ${error ? 'input-group--error' : ''} ${className}`}>
      <label htmlFor={inputId} className="input-group__label">
        {label}
        {props.required && <span className="input-group__required" aria-hidden="true">*</span>}
      </label>
      <input
        id={inputId}
        className="input-group__input"
        aria-invalid={!!error}
        aria-describedby={error ? errorId : helpText ? helpId : undefined}
        {...props}
      />
      {error && (
        <p id={errorId} className="input-group__error" role="alert">
          {error}
        </p>
      )}
      {helpText && !error && (
        <p id={helpId} className="input-group__help">
          {helpText}
        </p>
      )}
    </div>
  );
}
