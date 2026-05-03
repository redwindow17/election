// ============================================================
// Button Component — Unit Tests
// ============================================================
// Covers: rendering, click handling, disabled/loading states,
// variant/size classes, icon rendering, aria attributes.
// ============================================================

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../../components/common/Button';

describe('Button', () => {
  // ── Rendering ──────────────────────────────────────────
  describe('rendering', () => {
    it('renders children text', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('renders as a <button> element', () => {
      render(<Button>Test</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('applies default variant class (primary)', () => {
      render(<Button>Default</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn--primary');
    });

    it('applies default size class (md)', () => {
      render(<Button>Default</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn--md');
    });
  });

  // ── Variants & Sizes ───────────────────────────────────
  describe('variants and sizes', () => {
    it.each(['primary', 'secondary', 'ghost', 'danger', 'saffron'] as const)(
      'applies variant class: %s',
      (variant) => {
        render(<Button variant={variant}>Btn</Button>);
        expect(screen.getByRole('button')).toHaveClass(`btn--${variant}`);
      }
    );

    it.each(['sm', 'md', 'lg'] as const)('applies size class: %s', (size) => {
      render(<Button size={size}>Btn</Button>);
      expect(screen.getByRole('button')).toHaveClass(`btn--${size}`);
    });

    it('applies fullWidth class when fullWidth=true', () => {
      render(<Button fullWidth>Full</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn--full');
    });

    it('does not apply fullWidth class by default', () => {
      render(<Button>Normal</Button>);
      expect(screen.getByRole('button')).not.toHaveClass('btn--full');
    });
  });

  // ── Interaction ────────────────────────────────────────
  describe('interaction', () => {
    it('calls onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {
      const handleClick = vi.fn();
      render(<Button disabled onClick={handleClick}>Disabled</Button>);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', () => {
      const handleClick = vi.fn();
      render(<Button loading onClick={handleClick}>Loading</Button>);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  // ── Disabled & Loading States ──────────────────────────
  describe('disabled and loading states', () => {
    it('is disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('is disabled when loading=true', () => {
      render(<Button loading>Loading</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('sets aria-busy=true when loading', () => {
      render(<Button loading>Loading</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
    });

    it('does not set aria-busy when not loading', () => {
      render(<Button>Normal</Button>);
      expect(screen.getByRole('button')).not.toHaveAttribute('aria-busy');
    });

    it('applies loading class when loading', () => {
      render(<Button loading>Loading</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn--loading');
    });
  });

  // ── Icon ───────────────────────────────────────────────
  describe('icon', () => {
    it('renders icon when not loading', () => {
      render(<Button icon={<span data-testid="icon">★</span>}>With Icon</Button>);
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('icon wrapper has aria-hidden=true', () => {
      render(<Button icon={<span data-testid="icon">★</span>}>With Icon</Button>);
      const iconWrapper = screen.getByTestId('icon').parentElement;
      expect(iconWrapper).toHaveAttribute('aria-hidden', 'true');
    });

    it('does not render icon when loading', () => {
      render(<Button loading icon={<span data-testid="icon">★</span>}>Loading</Button>);
      expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
    });
  });

  // ── Custom className ───────────────────────────────────
  describe('custom className', () => {
    it('merges custom className', () => {
      render(<Button className="my-custom">Btn</Button>);
      expect(screen.getByRole('button')).toHaveClass('my-custom');
    });
  });
});
