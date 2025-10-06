# Contributing to HelloEmily.dev

Thank you for your interest in contributing to this project!

## Commit Message Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files

### Examples
```
feat: add presentations section to main page
fix: resolve blog post loading issue
docs: update README with setup instructions
chore: remove development artifacts
```

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes following the coding standards
3. Test your changes locally
4. Use conventional commit messages
5. Create a pull request with a clear description
6. Ensure all checks pass

## Development Setup

```bash
# Clone the repository
git clone https://github.com/emscape/HelloEmilyDev.git
cd HelloEmilyDev

# Install dependencies
npm install

# Start local development server
npm run dev
# or
python -m http.server 8000

# Run tests
npm test
```

## Code Style

- Use meaningful variable and function names
- Add JSDoc comments for functions
- Follow existing code patterns
- Keep functions small and focused
- Use ES6+ features consistently

## Questions?

Feel free to open an issue for any questions or suggestions!
