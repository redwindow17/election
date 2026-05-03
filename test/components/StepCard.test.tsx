// ============================================================
// StepCard Component — Unit Tests
// ============================================================
// Covers: step number/title/description rendering, optional
// requirements and tips sections, list item rendering.
// ============================================================

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StepCard } from '../../components/guide/StepCard';
import type { ElectionStep } from '../../types';

const baseStep: ElectionStep = {
  stepNumber: 1,
  title: 'Verify Your Status',
  description: 'Check your voter registration details.',
};

const fullStep: ElectionStep = {
  stepNumber: 2,
  title: 'Prepare Documents',
  description: 'Gather required identity documents.',
  requirements: ['Voter ID', 'Address proof'],
  tips: ['Carry originals', 'Arrive early'],
};

describe('StepCard', () => {
  // ── Core content ───────────────────────────────────────
  describe('core content', () => {
    it('renders step number', () => {
      render(<StepCard step={baseStep} index={0} />);
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('renders step title as heading', () => {
      render(<StepCard step={baseStep} index={0} />);
      expect(screen.getByRole('heading', { name: 'Verify Your Status' })).toBeInTheDocument();
    });

    it('renders step description', () => {
      render(<StepCard step={baseStep} index={0} />);
      expect(screen.getByText('Check your voter registration details.')).toBeInTheDocument();
    });
  });

  // ── Requirements ───────────────────────────────────────
  describe('requirements', () => {
    it('renders requirements section when provided', () => {
      render(<StepCard step={fullStep} index={0} />);
      expect(screen.getByText('Voter ID')).toBeInTheDocument();
      expect(screen.getByText('Address proof')).toBeInTheDocument();
    });

    it('renders Requirements heading', () => {
      render(<StepCard step={fullStep} index={0} />);
      expect(screen.getByText(/requirements/i)).toBeInTheDocument();
    });

    it('does not render requirements section when empty', () => {
      render(<StepCard step={baseStep} index={0} />);
      expect(screen.queryByText(/requirements/i)).not.toBeInTheDocument();
    });
  });

  // ── Tips ───────────────────────────────────────────────
  describe('tips', () => {
    it('renders tips when provided', () => {
      render(<StepCard step={fullStep} index={0} />);
      expect(screen.getByText('Carry originals')).toBeInTheDocument();
      expect(screen.getByText('Arrive early')).toBeInTheDocument();
    });

    it('renders Tips heading', () => {
      render(<StepCard step={fullStep} index={0} />);
      expect(screen.getByText(/tips/i)).toBeInTheDocument();
    });

    it('does not render tips section when empty', () => {
      render(<StepCard step={baseStep} index={0} />);
      expect(screen.queryByText(/tips/i)).not.toBeInTheDocument();
    });
  });

  // ── Animation delay ────────────────────────────────────
  describe('animation', () => {
    it('applies animation delay based on index', () => {
      const { container } = render(<StepCard step={baseStep} index={2} />);
      const card = container.firstChild as HTMLElement;
      expect(card.style.animationDelay).toBe('0.3s');
    });
  });
});
