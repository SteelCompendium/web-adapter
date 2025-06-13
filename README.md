# Statblock Adapter - GitHub Pages

A web-based tool for converting tabletop RPG statblocks between different formats. Paste your statblock on the left, select your desired output format, and get the converted result on the right.

## 🎯 Features

- **Multiple Input Formats**: Support for D&D 5e, Pathfinder, and custom formats
- **Multiple Output Formats**: JSON, XML, YAML, and Markdown
- **Auto-Detection**: Automatically detect input format when possible
- **Modern UI**: Clean, responsive interface with real-time feedback
- **Copy to Clipboard**: Easy copying of converted results
- **Character Counter**: Track input length
- **Status Indicators**: Visual feedback for conversion status

## 🚀 Live Demo

Visit the live application at: https://steelcompendium.io/statblock-adapter-gl-pages/

## 🛠️ Development

### Project Structure

```
├── .github/
│   └── workflows/
│       └── main.yml          # GitHub Actions CI/CD
├── public/
│   └── index.html           # Main application
├── LICENSE
└── README.md
```

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/[your-username]/statblock-adapter-gl-pages.git
   cd statblock-adapter-gl-pages
   ```

2. Serve the `public` directory locally:
   ```bash
   # Using Python
   cd public && python -m http.server 8000
   
   # Using Node.js
   npx serve public
   
   # Using PHP
   cd public && php -S localhost:8000
   ```

3. Open `http://localhost:8000` in your browser

### GitHub Pages Setup

1. Go to your repository settings
2. Navigate to "Pages" in the sidebar
3. Under "Source", select "GitHub Actions"
4. The workflow will automatically deploy on pushes to `main`

## 🔧 Architecture

### StatblockConverter Class

The main conversion logic is handled by the `StatblockConverter` class with the following structure:

```javascript
class StatblockConverter {
  // Parsers for different input formats
  parsers = {
    'auto': autoDetectParser,
    'dnd5e': parseDnD5e,
    'pathfinder': parsePathfinder,
    'custom': parseCustom
  }
  
  // Formatters for different output formats
  formatters = {
    'json': formatAsJSON,
    'xml': formatAsXML,
    'yaml': formatAsYAML,
    'markdown': formatAsMarkdown
  }
}
```

### Adding New Formats

#### Input Parsers

To add a new input format:

1. Add a new parser method to the `StatblockConverter` class
2. Register it in the `parsers` object
3. Add the option to the input format selector in HTML

```javascript
parseNewFormat(input) {
  // Parse the input text and return a standardized object
  return {
    name: "Creature Name",
    type: "creature type",
    // ... other properties
  };
}
```

#### Output Formatters

To add a new output format:

1. Add a new formatter method to the `StatblockConverter` class
2. Register it in the `formatters` object
3. Add the option to the output format selector in HTML

```javascript
formatAsNewFormat(data) {
  // Convert the standardized object to your desired format
  return "formatted string";
}
```

## 📝 Data Format

The internal data structure used between parsers and formatters:

```javascript
{
  name: string,           // Creature name
  type: string,           // Creature type (humanoid, beast, etc.)
  size: string,           // Size category (Small, Medium, Large, etc.)
  alignment: string,      // Alignment
  ac: number,            // Armor Class
  hp: number,            // Hit Points
  speed: string,         // Speed description
  stats: {               // Ability scores
    str: number,
    dex: number,
    con: number,
    int: number,
    wis: number,
    cha: number
  },
  // Additional fields can be added as needed
  raw_input: string      // Original input for reference
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-format`
3. Make your changes
4. Test locally
5. Commit your changes: `git commit -am 'Add new format support'`
6. Push to the branch: `git push origin feature/new-format`
7. Submit a pull request

### Development Guidelines

- Keep the single-file architecture for simplicity
- Add TODO comments for stub implementations
- Maintain responsive design principles
- Test with various statblock formats
- Update this README when adding new features

## 📋 TODO

- [ ] Implement D&D 5e parser
- [ ] Implement Pathfinder parser
- [ ] Add auto-detection logic
- [ ] Improve XML formatter
- [ ] Add more output formats (CSV, etc.)
- [ ] Add validation for parsed data
- [ ] Add unit tests
- [ ] Add error handling for malformed input
- [ ] Add support for more RPG systems

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the tabletop RPG community
- Inspired by the need for format standardization
- Uses modern web technologies for accessibility