# Contributing to Statblock Adapter

Thank you for your interest in contributing to the Statblock Adapter! This document provides guidelines and information for contributors.

## 🚀 Quick Start

1. Fork the repository
2. Clone your fork: `git clone https://github.com/[your-username]/statblock-adapter-gl-pages.git`
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`
5. Open `http://localhost:8000` in your browser

## 🏗️ Project Structure

```
├── .github/workflows/main.yml    # GitHub Actions CI/CD
├── public/index.html            # Main application (single file)
├── package.json                 # Development dependencies
├── README.md                    # Project documentation
└── CONTRIBUTING.md             # This file
```

## 🎯 Areas for Contribution

### High Priority
- **Parser Implementation**: D&D 5e and Pathfinder statblock parsers
- **Format Detection**: Auto-detection logic for input formats
- **Output Formatters**: Improve XML, add CSV, improve YAML
- **Error Handling**: Better validation and error messages

### Medium Priority
- **UI Improvements**: Better responsive design, accessibility
- **New Formats**: Support for other RPG systems
- **Testing**: Unit tests for parsers and formatters
- **Documentation**: More examples, better API docs

### Low Priority
- **Performance**: Optimization for large statblocks
- **Features**: Import/export, batch processing
- **Integrations**: API endpoints, browser extensions

## 🔧 Development Guidelines

### Code Style
- Use modern JavaScript (ES6+)
- Keep the single-file architecture for simplicity
- Add comprehensive comments for complex logic
- Use meaningful variable and function names

### Parser Development
When implementing a new parser:

```javascript
parseNewFormat(input) {
  // 1. Split input into logical sections
  // 2. Extract key information using regex or string methods
  // 3. Return standardized object format
  return {
    name: string,
    type: string,
    size: string,
    alignment: string,
    ac: number,
    hp: number,
    speed: string,
    stats: { str, dex, con, int, wis, cha },
    raw_input: input
  };
}
```

### Formatter Development
When implementing a new formatter:

```javascript
formatAsNewFormat(data) {
  // Convert standardized object to desired output format
  // Handle missing or optional fields gracefully
  // Return formatted string
}
```

### Testing
- Test with real statblock examples
- Verify responsive design on mobile
- Check accessibility with screen readers
- Test error conditions and edge cases

## 📝 Commit Guidelines

Use conventional commit messages:
- `feat: add D&D 5e parser`
- `fix: handle missing AC in statblocks`
- `docs: update parser documentation`
- `style: improve mobile responsive design`
- `refactor: simplify format detection logic`
- `test: add parser unit tests`

## 🐛 Bug Reports

When reporting bugs, please include:
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Sample statblock that causes the issue
- Console errors (if any)

## 💡 Feature Requests

For new features, please:
- Check existing issues first
- Describe the use case
- Provide examples if applicable
- Consider implementation complexity

## 🔍 Code Review Process

1. All changes require a pull request
2. Maintain backward compatibility
3. Update documentation as needed
4. Test thoroughly before submitting
5. Respond to review feedback promptly

## 📚 Resources

### RPG System References
- [D&D 5e SRD](https://dnd.wizards.com/resources/systems-reference-document)
- [Pathfinder SRD](https://www.d20pfsrd.com/)
- [Open Game License](https://en.wikipedia.org/wiki/Open_Game_License)

### Web Development
- [MDN Web Docs](https://developer.mozilla.org/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 🤝 Community

- Be respectful and inclusive
- Help newcomers get started
- Share knowledge and best practices
- Focus on constructive feedback

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to the Statblock Adapter! 🎲 