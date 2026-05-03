// ============================================================
// Select Component — Reusable dropdown with label & error
// ============================================================

import React from 'react';
import './Select.css';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: readonly SelectOption[] | string[];
  error?: string;
  placeholder?: string;
}

export function Select({
  label,
  options,
  error,
  placeholder = 'Select an option...',
  id,
  className = '',
  ...props
}: SelectProps) {
  const selectId = id || `select-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${selectId}-error`;

  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  return (
    <div className={`select-group ${error ? 'select-group--error' : ''} ${className}`}>
      <label htmlFor={selectId} className="select-group__label">
        {label}
        {props.required && <span className="select-group__required" aria-hidden="true">*</span>}
      </label>
      <div className="select-group__wrapper">
        <select
          id={selectId}
          className="select-group__select"
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          aria-required={props.required}
          {...props}
        >
          <option value="" disabled aria-label={placeholder}>
            {placeholder}
          </option>
          {normalizedOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="select-group__chevron" aria-hidden="true">
          ▾
        </span>
      </div>
      {error && (
        <p id={errorId} className="select-group__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
