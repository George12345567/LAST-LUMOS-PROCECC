# Contributing to Lumos Digital Ascent

Thank you for your interest in contributing to Lumos Digital Ascent! This document provides guidelines and standards for contributing to the project.

## 🚨 Critical Guidelines

Before making any contributions, please thoroughly read and follow these documents:

- **[CODING_GUIDELINES.md](./CODING_GUIDELINES.md)** - Strict coding standards (MUST follow)
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Project architecture and structure
- **[SECURITY.md](./SECURITY.md)** - Security considerations

## 📋 Core Rules

### File Size Limits
- ✅ **Maximum file size: 500 lines** (Recommended: 300 lines)
- ✅ If a file exceeds 500 lines, it **must** be split immediately
- ✅ Break large components into smaller, focused components

### Code Quality Standards
- ✅ **No duplicate code** - Create reusable hooks, components, and utilities
- ✅ **No duplicate data** - Use `constants.ts` for shared data
- ✅ **Use path aliases** - Always use `@/` for imports (not relative paths)
- ✅ **Use `index.ts`** - Create barrel exports in every feature folder
- ✅ **TypeScript strict mode** - All code must be properly typed

### Component Structure
- Feature-based organization in `src/features/`
- Shared components in `src/components/`
- Each feature should have its own folder with related components, hooks, and types

## 🔧 Development Setup

1. Fork the repository
2. Clone your fork:
   ```sh
   git clone https://github.com/your-username/lumos-digital-ascent.git
   cd lumos-digital-ascent
   ```
3. Install dependencies:
   ```sh
   npm install
   ```
4. Create a feature branch:
   ```sh
   git checkout -b feature/your-feature-name
   ```
5. Set up your `.env` file from `.env.example`

## 📝 Making Changes

### Before You Code
1. Check existing issues or create a new one describing your changes
2. Discuss major changes before implementation
3. Ensure your changes align with project architecture

### While Coding
1. Follow the coding guidelines strictly
2. Write TypeScript (no JavaScript)
3. Use meaningful variable and function names
4. Add comments for complex logic
5. Keep components focused and single-purpose

### Code Style
- Use functional components with hooks
- Prefer composition over inheritance
- Use Tailwind CSS for styling (no inline styles)
- Follow the existing design system in `src/index.css`

## ✅ Before Submitting

### Testing
1. Test your changes thoroughly in development mode
2. Run the build command to ensure no build errors:
   ```sh
   npm run build
   ```
3. Run linting:
   ```sh
   npm run lint
   ```
4. Fix any linting errors before submitting

### Documentation
- Update relevant documentation if needed
- Add JSDoc comments for complex functions
- Update README.md if adding new features

## 🚀 Pull Request Process

1. **Commit Your Changes**
   ```sh
   git add .
   git commit -m "feat: description of your changes"
   ```
   
   Use conventional commits:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting, etc.)
   - `refactor:` - Code refactoring
   - `test:` - Adding tests
   - `chore:` - Maintenance tasks

2. **Push to Your Fork**
   ```sh
   git push origin feature/your-feature-name
   ```

3. **Create Pull Request**
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your fork and branch
   - Provide a clear description of your changes
   - Reference any related issues

4. **PR Description Should Include**
   - What changes were made
   - Why the changes were necessary
   - How to test the changes
   - Screenshots for UI changes
   - Any breaking changes

## 🔍 Code Review

- Be responsive to feedback
- Make requested changes promptly
- Ask questions if feedback is unclear
- Be respectful and professional

## 🚫 What Not to Submit

- Code that doesn't follow the coding guidelines
- Files larger than 500 lines
- Hardcoded credentials or secrets
- Breaking changes without discussion
- Code with linting errors
- Duplicate code

## 📚 Resources

- [React Documentation](https://reactjs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)

## 💬 Questions?

If you have questions:
1. Check existing documentation
2. Search existing issues
3. Create a new issue with the `question` label

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Lumos Digital Ascent! 🚀
