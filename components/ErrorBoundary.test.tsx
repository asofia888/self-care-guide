import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ErrorBoundary } from './ErrorBoundary';

vi.mock('../utils/errorHandler', () => {
  return {
    logError: vi.fn(),
  };
});

// Component that throws error for testing
const ThrowError = (): never => {
  throw new Error('Test error');
};

// Component that renders normally
const NormalComponent = () => <div>Normal Component</div>;

describe('ErrorBoundary component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console.error for tests since error boundaries log errors
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <NormalComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Normal Component')).toBeInTheDocument();
  });

  it('renders fallback UI when error occurs', () => {
    const fallbackUI = <div>Custom Error Fallback</div>;
    render(
      <ErrorBoundary fallback={fallbackUI}>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText('Custom Error Fallback')).toBeInTheDocument();
  });

  it('renders default error UI when error occurs and no fallback provided', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    // Should display Japanese error message (since it's the default)
    expect(screen.getByText(/問題が発生しました/)).toBeInTheDocument();
  });

  it('displays error message in default fallback', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText(/アプリケーションでエラーが発生しました/)).toBeInTheDocument();
  });

  it('renders retry button in default fallback', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByRole('button', { name: /再試行/ })).toBeInTheDocument();
  });

  it('renders reload button in default fallback', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByRole('button', { name: /ページを再読み込み/ })).toBeInTheDocument();
  });

  it('resets error state when retry button is clicked', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <NormalComponent />
      </ErrorBoundary>
    );

    // First render should show normal component
    expect(screen.getByText('Normal Component')).toBeInTheDocument();

    // Rerender with error component
    rerender(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Should show error UI
    expect(screen.getByText(/問題が発生しました/)).toBeInTheDocument();

    // Click retry button
    const retryButton = screen.getByRole('button', { name: /再試行/ });
    fireEvent.click(retryButton);

    // Component should still show error because children still throws
    expect(screen.getByText(/問題が発生しました/)).toBeInTheDocument();
  });

  it('calls logError when error is caught', async () => {
    const module = await import('../utils/errorHandler');
    const { logError } = module;
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(logError).toHaveBeenCalledWith('ErrorBoundary', expect.any(Object));
  });

  it('passes error and componentStack to logError', async () => {
    const module = await import('../utils/errorHandler');
    const { logError } = module;
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    const callArgs = vi.mocked(logError).mock.calls[0][1];
    expect(callArgs).toHaveProperty('error');
    expect(callArgs).toHaveProperty('componentStack');
  });

  it('shows error details in development mode', () => {
    // `vi.stubEnv` reliably overrides process.env.NODE_ENV for the component read.
    vi.stubEnv('NODE_ENV', 'development');

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Should show details section in development
    expect(screen.getByText(/エラー詳細/)).toBeInTheDocument();

    vi.unstubAllEnvs();
  });

  it('applies correct styling classes to error container', () => {
    const { container } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    const errorContainer = container.querySelector(
      '.min-h-screen.flex.items-center.justify-center'
    );
    expect(errorContainer).toBeInTheDocument();
  });

  it('has correct gradient background', () => {
    const { container } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    const errorContainer = container.querySelector('.bg-gradient-to-br');
    expect(errorContainer).toBeInTheDocument();
    expect(errorContainer).toHaveClass('from-cream-50', 'to-cream-100');
  });

  it('renders alert icon with correct styling', () => {
    const { container } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    const iconContainer = container.querySelector('.bg-rose-50.rounded-full');
    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer).toHaveClass('w-16', 'h-16');
  });

  it('renders SVG icon for error', () => {
    const { container } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('has correct button styling', () => {
    const { container } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    const retryButton = container.querySelector('button');
    expect(retryButton).toHaveClass('px-6', 'py-3', 'font-medium', 'rounded-full');
  });

  it('renders two buttons in error state', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });

  it('calls window.location.reload when reload button is clicked', () => {
    // jsdom's window.location.reload is not directly spy-able, so replace the
    // whole location object with one whose reload is a mock, then restore it.
    const originalLocation = window.location;
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, reload: reloadMock },
    });

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    const reloadButton = screen.getByRole('button', { name: /ページを再読み込み/ });
    fireEvent.click(reloadButton);
    expect(reloadMock).toHaveBeenCalled();

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });
});
