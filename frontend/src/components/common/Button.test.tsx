// ============================================================
// Button Component Tests
// ============================================================

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled and shows aria-busy when loading', () => {
    render(<Button loading>Loading</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies variant class', () => {
    render(<Button variant="saffron">Saffron</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn--saffron');
  });

  it('applies size class', () => {
    render(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn--lg');
  });

  it('applies fullWidth class', () => {
    render(<Button fullWidth>Full</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn--full');
  });

  it('renders icon with aria-hidden', () => {
    render(<Button icon={<span data-testid="icon">★</span>}>With Icon</Button>);
    const icon = screen.getByTestId('icon').parentElement;
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('does not render icon when loading', () => {
    render(<Button loading icon={<span data-testid="icon">★</span>}>Loading</Button>);
    expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
  });
});
