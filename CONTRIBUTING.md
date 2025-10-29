# Contributing to Self-Care Guide for Wellness

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

Be respectful, inclusive, and professional in all interactions with the community.

---

## Getting Started

### Fork & Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

   ```bash
   git clone https://github.com/YOUR_USERNAME/self-care-guide-for-wellness.git
   cd self-care-guide-for-wellness
   ```

3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/asofia888/self-care-guide-for-wellness.git
   ```

### Set Up Development Environment

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` with your Gemini API key:

   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

---

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

**Branch naming conventions:**

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code refactoring
- `test/` - Test additions
- `chore/` - Maintenance tasks

### 2. Make Changes

Write code following our standards (see below).

### 3. Commit Changes

Use descriptive commit messages:

```bash
git commit -m "feat: Add feature description

Detailed explanation of changes if needed.

- Bullet point 1
- Bullet point 2"
```

**Commit prefixes:**

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Test additions/modifications
- `chore:` - Maintenance

### 4. Keep Branch Up to Date

```bash
git fetch upstream
git rebase upstream/main
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then open a pull request on GitHub.

---

## Code Standards

### TypeScript & JavaScript

✅ **DO:**

- Use TypeScript for all new code
- Write self-documenting code with clear variable names
- Add JSDoc comments for complex functions
- Handle errors explicitly
- Use const by default, let if needed

❌ **DON'T:**

- Use `any` types (use specific types instead)
- Commit console.log statements (use proper logging)
- Leave commented-out code
- Use var keyword

### React Components

✅ **DO:**

- Use functional components with hooks
- Memoize expensive computations (useMemo)
- Use useCallback for event handlers
- Write semantic HTML
- Include ARIA attributes for accessibility

❌ **DON'T:**

- Use class components for new features
- Create unnecessary wrapper components
- Ignore prop types/TypeScript types
- Forget about re-renders

### Styling

✅ **DO:**

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Test on multiple screen sizes
- Use semantic color classes (text-emerald-700, etc.)

❌ **DON'T:**

- Add inline styles (except dynamic values)
- Mix different CSS approaches
- Use arbitrary values without good reason
- Forget about dark mode

### File Organization

```
✅ GOOD
components/
├── Compendium.tsx
├── Compendium.test.tsx
└── CompendiumEntry.tsx

❌ BAD
components/
├── compendium.tsx
├── Compendium.jsx
└── compendiumEntry.tsx
```

---

## Code Quality Checks

### Pre-Commit Checks

Before committing, ensure:

```bash
npm run lint          # Check for ESLint issues
npm run lint:fix      # Auto-fix ESLint issues
npm run format        # Format with Prettier
npm run type-check    # Check TypeScript
```

### Testing Requirements

All contributions must include tests:

```bash
npm run test          # Run tests in watch mode
npm run test:run      # Run tests once
npm run test:coverage # Check coverage
```

**Coverage minimums:**

- **Statements:** 70%
- **Branches:** 70%
- **Functions:** 70%
- **Lines:** 70%

### Writing Tests

Use React Testing Library:

```typescript
import { render, screen } from '@testing-library/react';
import { Compendium } from './Compendium';

describe('Compendium Component', () => {
  it('renders search input', () => {
    render(<Compendium />);
    const input = screen.getByRole('searchbox');
    expect(input).toBeInTheDocument();
  });

  it('displays results after search', async () => {
    render(<Compendium />);
    const input = screen.getByRole('searchbox');

    await userEvent.type(input, 'ginger');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    expect(screen.getByText(/ginger/i)).toBeInTheDocument();
  });
});
```

---

## Documentation

### README Updates

If your change affects usage, update [README.md](README.md):

- Add new features to Features section
- Update API documentation if needed
- Update architecture diagram if applicable

### Code Comments

Use JSDoc for complex functions:

```typescript
/**
 * Fetches compendium information from the API
 * @param query - The search query (e.g., "ginger")
 * @param language - Response language ("ja" or "en")
 * @returns Promise containing compendium data
 * @throws APIError if request fails
 */
export const getCompendiumInfo = async (
  query: string,
  language: Language
): Promise<CompendiumResult> => {
  // implementation
};
```

---

## Pull Request Process

### 1. Create PR Description

Use this template:

```markdown
## Description

Briefly describe your changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues

Fixes #123

## Testing

- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests pass
- [ ] No new warnings generated
```

### 2. CI/CD Checks

All PRs must pass:

- ✅ ESLint checks
- ✅ Prettier formatting
- ✅ TypeScript type checking
- ✅ Unit tests
- ✅ E2E tests
- ✅ Security audit
- ✅ Lighthouse performance tests

### 3. Code Review

- Address feedback from maintainers
- Keep commits logical and clean
- Avoid force pushes after review starts

### 4. Merge

Once approved:

- Commits will be squashed if needed
- Your PR will be merged to main
- Automatic deployment to Vercel will occur

---

## Adding Features

### New API Endpoint

1. Create function in appropriate service file
2. Add TypeScript types in `types.ts`
3. Add unit tests
4. Update API documentation in README.md
5. Add E2E tests if user-facing

### New Component

1. Create component file with TypeScript
2. Add component tests
3. Export from appropriate index file
4. Test accessibility (ARIA, keyboard nav)
5. Update stories if using Storybook

### New Page/View

1. Create component and route
2. Add translations (ja.json, en.json)
3. Update navigation
4. Add E2E test
5. Update README features

---

## Bug Reports

When reporting bugs, include:

1. **Description:** What happened?
2. **Steps to reproduce:**
   1. Step 1
   2. Step 2
3. **Expected behavior:** What should happen?
4. **Actual behavior:** What actually happened?
5. **Environment:**
   - Browser and version
   - OS
   - Node.js version
6. **Screenshots:** If applicable
7. **Error logs:** Console output if available

---

## Feature Requests

Before requesting a feature:

1. Check if it's already been requested
2. Explain the use case
3. Describe the expected behavior
4. Provide examples if helpful

---

## Questions or Need Help?

- 📖 Check [README.md](README.md) for documentation
- 🔒 Check [SECURITY.md](SECURITY.md) for security info
- 💬 Open a discussion on GitHub
- 🐛 Create an issue with your question

---

## Release Process

Releases follow semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR:** Breaking changes
- **MINOR:** New features
- **PATCH:** Bug fixes

Changelog is automatically generated from commits.

---

## Licensing

By contributing to this project, you agree your contributions will be licensed under the MIT License.

---

## Recognition

Contributors will be recognized in:

- GitHub Contributors page
- Release notes (for significant contributions)
- Project acknowledgments (if requested)

---

Thank you for contributing to Self-Care Guide for Wellness! 🙏
