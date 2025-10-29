import React from 'react';
import { render } from '@testing-library/react';
import { SparklesIcon, BrainCircuitIcon, AlertTriangleIcon } from './Icons';

describe('Icon components', () => {
  describe('SparklesIcon', () => {
    it('renders SVG element', () => {
      const { container } = render(<SparklesIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('has correct SVG attributes', () => {
      const { container } = render(<SparklesIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('has correct dimensions', () => {
      const { container } = render(<SparklesIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '24');
      expect(svg).toHaveAttribute('height', '24');
    });

    it('applies custom className', () => {
      const { container } = render(<SparklesIcon className="w-8 h-8 text-blue-500" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('w-8', 'h-8', 'text-blue-500');
    });

    it('renders path elements', () => {
      const { container } = render(<SparklesIcon />);
      const paths = container.querySelectorAll('path');
      expect(paths.length).toBeGreaterThan(0);
    });

    it('has currentColor stroke for styling flexibility', () => {
      const { container } = render(<SparklesIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('stroke', 'currentColor');
    });
  });

  describe('BrainCircuitIcon', () => {
    it('renders SVG element', () => {
      const { container } = render(<BrainCircuitIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('has correct SVG attributes', () => {
      const { container } = render(<BrainCircuitIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('has correct dimensions', () => {
      const { container } = render(<BrainCircuitIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '24');
      expect(svg).toHaveAttribute('height', '24');
    });

    it('applies custom className', () => {
      const { container } = render(<BrainCircuitIcon className="w-10 h-10 text-purple-600" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('w-10', 'h-10', 'text-purple-600');
    });

    it('renders multiple path elements for brain circuit design', () => {
      const { container } = render(<BrainCircuitIcon />);
      const paths = container.querySelectorAll('path');
      expect(paths.length).toBeGreaterThan(5);
    });

    it('has stroke-linecap and stroke-linejoin attributes', () => {
      const { container } = render(<BrainCircuitIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('strokeLinecap', 'round');
      expect(svg).toHaveAttribute('strokeLinejoin', 'round');
    });
  });

  describe('AlertTriangleIcon', () => {
    it('renders SVG element', () => {
      const { container } = render(<AlertTriangleIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('has correct SVG attributes', () => {
      const { container } = render(<AlertTriangleIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('has correct dimensions', () => {
      const { container } = render(<AlertTriangleIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '24');
      expect(svg).toHaveAttribute('height', '24');
    });

    it('applies custom className', () => {
      const { container } = render(<AlertTriangleIcon className="w-6 h-6 text-red-500" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('w-6', 'h-6', 'text-red-500');
    });

    it('renders path and line elements for warning icon', () => {
      const { container } = render(<AlertTriangleIcon />);
      const paths = container.querySelectorAll('path');
      const lines = container.querySelectorAll('line');
      expect(paths.length).toBeGreaterThan(0);
      expect(lines.length).toBeGreaterThan(0);
    });

    it('has correct stroke attributes', () => {
      const { container } = render(<AlertTriangleIcon />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('strokeWidth', '2');
      expect(svg).toHaveAttribute('stroke', 'currentColor');
    });
  });

  describe('Icon styling consistency', () => {
    it('all icons have consistent stroke properties', () => {
      const icons = [
        { name: 'Sparkles', component: <SparklesIcon /> },
        { name: 'BrainCircuit', component: <BrainCircuitIcon /> },
        { name: 'AlertTriangle', component: <AlertTriangleIcon /> },
      ];

      icons.forEach(({ name, component }) => {
        const { container } = render(component);
        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('fill', 'none');
        expect(svg).toHaveAttribute('stroke', 'currentColor');
        expect(svg).toHaveAttribute('strokeWidth', '2');
      });
    });

    it('icons accept undefined className gracefully', () => {
      const { container: container1 } = render(<SparklesIcon className={undefined} />);
      const { container: container2 } = render(<BrainCircuitIcon className={undefined} />);
      const { container: container3 } = render(<AlertTriangleIcon className={undefined} />);

      expect(container1.querySelector('svg')).toBeInTheDocument();
      expect(container2.querySelector('svg')).toBeInTheDocument();
      expect(container3.querySelector('svg')).toBeInTheDocument();
    });
  });
});
