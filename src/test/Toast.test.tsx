import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { ToastProvider, useToast } from '../contexts/ToastContext';
import { ToastContainer } from '../components/Toast';

// Test component that uses the toast hook
function TestComponent() {
  const { showToast, dismissToast, toasts } = useToast();

  return (
    <div>
      <button
        data-testid="show-toast"
        onClick={() => showToast({ message: 'Test message' })}
      >
        Show Toast
      </button>
      <button
        data-testid="show-toast-action"
        onClick={() =>
          showToast({
            message: 'With action',
            action: { label: 'Undo', onClick: () => {} },
          })
        }
      >
        Show Toast With Action
      </button>
      <button
        data-testid="show-long-toast"
        onClick={() => showToast({ message: 'Long toast', duration: 10000 })}
      >
        Show Long Toast
      </button>
      <button
        data-testid="show-persistent-toast"
        onClick={() => showToast({ message: 'No auto dismiss', duration: 0 })}
      >
        Show Persistent Toast
      </button>
      {toasts.length > 0 && (
        <button data-testid="dismiss-first" onClick={() => dismissToast(toasts[0].id)}>
          Dismiss First
        </button>
      )}
      <span data-testid="toast-count">{toasts.length}</span>
    </div>
  );
}

describe('Toast System', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('ToastProvider', () => {
    it('shows toast when showToast is called', () => {
      render(
        <ToastProvider>
          <TestComponent />
          <ToastContainer />
        </ToastProvider>
      );

      fireEvent.click(screen.getByTestId('show-toast'));

      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('auto-dismisses toast after default duration (4000ms)', () => {
      render(
        <ToastProvider>
          <TestComponent />
          <ToastContainer />
        </ToastProvider>
      );

      fireEvent.click(screen.getByTestId('show-toast'));
      expect(screen.getByText('Test message')).toBeInTheDocument();

      // Advance time past the default 4000ms duration
      act(() => {
        vi.advanceTimersByTime(4500);
      });

      expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    });

    it('uses custom duration when specified', () => {
      render(
        <ToastProvider>
          <TestComponent />
          <ToastContainer />
        </ToastProvider>
      );

      fireEvent.click(screen.getByTestId('show-long-toast'));
      expect(screen.getByText('Long toast')).toBeInTheDocument();

      // Advance past default duration
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Should still be visible
      expect(screen.getByText('Long toast')).toBeInTheDocument();

      // Advance past custom duration
      act(() => {
        vi.advanceTimersByTime(6000);
      });

      expect(screen.queryByText('Long toast')).not.toBeInTheDocument();
    });

    it('does not auto-dismiss when duration is 0', () => {
      render(
        <ToastProvider>
          <TestComponent />
          <ToastContainer />
        </ToastProvider>
      );

      fireEvent.click(screen.getByTestId('show-persistent-toast'));
      expect(screen.getByText('No auto dismiss')).toBeInTheDocument();

      // Advance time significantly
      act(() => {
        vi.advanceTimersByTime(60000);
      });

      // Should still be visible
      expect(screen.getByText('No auto dismiss')).toBeInTheDocument();
    });

    it('allows manual dismissal', () => {
      render(
        <ToastProvider>
          <TestComponent />
          <ToastContainer />
        </ToastProvider>
      );

      fireEvent.click(screen.getByTestId('show-toast'));
      expect(screen.getByText('Test message')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('dismiss-first'));
      expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    });

    it('clears timer when manually dismissed (no lingering timers)', () => {
      render(
        <ToastProvider>
          <TestComponent />
          <ToastContainer />
        </ToastProvider>
      );

      fireEvent.click(screen.getByTestId('show-toast'));
      expect(screen.getByTestId('toast-count').textContent).toBe('1');

      // Manually dismiss
      fireEvent.click(screen.getByTestId('dismiss-first'));
      expect(screen.getByTestId('toast-count').textContent).toBe('0');

      // Advance past original timer - should not cause issues
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Count should still be 0 (timer was cleared)
      expect(screen.getByTestId('toast-count').textContent).toBe('0');
    });

    it('shows multiple toasts', () => {
      render(
        <ToastProvider>
          <TestComponent />
          <ToastContainer />
        </ToastProvider>
      );

      fireEvent.click(screen.getByTestId('show-toast'));
      fireEvent.click(screen.getByTestId('show-long-toast'));

      expect(screen.getByText('Test message')).toBeInTheDocument();
      expect(screen.getByText('Long toast')).toBeInTheDocument();
      expect(screen.getByTestId('toast-count').textContent).toBe('2');
    });
  });

  describe('ToastContainer', () => {
    it('renders toasts with action buttons', () => {
      render(
        <ToastProvider>
          <TestComponent />
          <ToastContainer />
        </ToastProvider>
      );

      fireEvent.click(screen.getByTestId('show-toast-action'));

      expect(screen.getByText('With action')).toBeInTheDocument();
      expect(screen.getByText('Undo')).toBeInTheDocument();
    });

    it('calls action onClick when action button clicked', () => {
      const actionFn = vi.fn();

      function TestWithAction() {
        const { showToast } = useToast();
        return (
          <button
            data-testid="show"
            onClick={() =>
              showToast({
                message: 'Test',
                action: { label: 'Do it', onClick: actionFn },
              })
            }
          >
            Show
          </button>
        );
      }

      render(
        <ToastProvider>
          <TestWithAction />
          <ToastContainer />
        </ToastProvider>
      );

      fireEvent.click(screen.getByTestId('show'));
      fireEvent.click(screen.getByText('Do it'));

      expect(actionFn).toHaveBeenCalled();
    });

    it('has dismiss button on toasts', () => {
      render(
        <ToastProvider>
          <TestComponent />
          <ToastContainer />
        </ToastProvider>
      );

      fireEvent.click(screen.getByTestId('show-toast'));

      const dismissBtn = screen.getByLabelText('Dismiss');
      expect(dismissBtn).toBeInTheDocument();

      fireEvent.click(dismissBtn);
      expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    });
  });
});

describe('Undo Flow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('undo action reverts the toggle', () => {
    const toggleFn = vi.fn();
    let toggleCount = 0;

    function UndoTestComponent() {
      const { showToast } = useToast();

      const handleToggle = () => {
        toggleCount++;
        toggleFn(`toggle-${toggleCount}`);

        showToast({
          message: 'Toggled',
          action: {
            label: 'Undo',
            onClick: () => {
              toggleCount++;
              toggleFn(`undo-${toggleCount}`);
            },
          },
        });
      };

      return <button data-testid="toggle" onClick={handleToggle}>Toggle</button>;
    }

    render(
      <ToastProvider>
        <UndoTestComponent />
        <ToastContainer />
      </ToastProvider>
    );

    // First toggle
    fireEvent.click(screen.getByTestId('toggle'));
    expect(toggleFn).toHaveBeenCalledWith('toggle-1');

    // Click undo
    fireEvent.click(screen.getByText('Undo'));
    expect(toggleFn).toHaveBeenCalledWith('undo-2');
    expect(toggleFn).toHaveBeenCalledTimes(2);
  });
});
