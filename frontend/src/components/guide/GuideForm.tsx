// ============================================================
// GuideForm Component — User profile input form
// ============================================================

import { useState } from 'react';
import type { FormEvent } from 'react';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { INDIAN_STATES, VOTER_ID_STATUS_OPTIONS, LANGUAGE_OPTIONS, SAMPLE_QUESTIONS } from '../../utils/constants';
import type { ElectionQueryInput } from '../../types';
import './GuideForm.css';

interface GuideFormProps {
  onSubmit: (input: ElectionQueryInput) => void;
  loading: boolean;
}

export function GuideForm({ onSubmit, loading }: GuideFormProps) {
  const [age, setAge] = useState('');
  const [state, setState] = useState('');
  const [question, setQuestion] = useState('');
  const [voterIdStatus, setVoterIdStatus] = useState('unsure');
  const [language, setLanguage] = useState('en');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errs: Record<string, string> = {};
    const ageNum = parseInt(age);

    if (!age || isNaN(ageNum)) {
      errs.age = 'Please enter your age';
    } else if (ageNum < 18) {
      errs.age = 'You must be at least 18 years old to vote';
    } else if (ageNum > 120) {
      errs.age = 'Please enter a valid age';
    }

    if (!state) {
      errs.state = 'Please select your state';
    }

    if (!question.trim()) {
      errs.question = 'Please enter your question';
    } else if (question.trim().length < 5) {
      errs.question = 'Question must be at least 5 characters';
    } else if (question.length > 500) {
      errs.question = 'Question must be at most 500 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      age: parseInt(age),
      state,
      question: question.trim(),
      voterIdStatus: voterIdStatus as ElectionQueryInput['voterIdStatus'],
      language: language as ElectionQueryInput['language'],
    });
  }

  function handleSampleClick(sample: string) {
    setQuestion(sample);
    setErrors((prev) => ({ ...prev, question: '' }));
  }

  return (
    <form onSubmit={handleSubmit} className="guide-form glass-card" noValidate>
      <div className="guide-form__header">
        <h2 className="guide-form__title">Your Profile</h2>
        <p className="guide-form__desc">
          Tell us about yourself so we can personalize your election guide
        </p>
      </div>

      <div className="guide-form__fields">
        <div className="guide-form__row">
          <Input
            label="Age"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            error={errors.age}
            placeholder="25"
            min={18}
            max={120}
            required
          />

          <Select
            label="State / UT"
            options={[...INDIAN_STATES]}
            value={state}
            onChange={(e) => setState(e.target.value)}
            error={errors.state}
            placeholder="Select your state..."
            required
          />
        </div>

        <div className="guide-form__row">
          <Select
            label="Voter ID Status"
            options={VOTER_ID_STATUS_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
            value={voterIdStatus}
            onChange={(e) => setVoterIdStatus(e.target.value)}
          />

          <Select
            label="Preferred Language"
            options={LANGUAGE_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          />
        </div>

        <div className="guide-form__question-group">
          <label htmlFor="guide-question" className="guide-form__label">
            Your Question <span className="guide-form__required">*</span>
          </label>
          <textarea
            id="guide-question"
            className={`guide-form__textarea ${errors.question ? 'guide-form__textarea--error' : ''}`}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything about voting, elections, or your democratic rights..."
            rows={4}
            maxLength={500}
            aria-invalid={!!errors.question}
            aria-describedby={errors.question ? 'question-error' : undefined}
            aria-required="true"
            required
          />
          <div className="guide-form__textarea-footer">
            {errors.question && (
              <p id="question-error" className="guide-form__error" role="alert">
                ⚠ {errors.question}
              </p>
            )}
            <span className="guide-form__char-count">
              {question.length}/500
            </span>
          </div>
        </div>

        {/* Sample questions */}
        <div className="guide-form__samples">
          <p className="guide-form__samples-label" id="sample-questions-label">💡 Try a sample question:</p>
          <div className="guide-form__samples-grid" role="group" aria-labelledby="sample-questions-label">
            {SAMPLE_QUESTIONS.map((sample) => (
              <button
                key={sample}
                type="button"
                className="guide-form__sample-chip"
                onClick={() => handleSampleClick(sample)}
                aria-label={`Use sample question: ${sample}`}
              >
                {sample}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="guide-form__actions">
        <Button
          type="submit"
          variant="saffron"
          size="lg"
          fullWidth
          loading={loading}
          icon={<span>✨</span>}
        >
          Generate My Election Guide
        </Button>
      </div>
    </form>
  );
}
