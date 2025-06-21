# Statblock Adapter

A web-based tool for converting tabletop RPG statblocks between different formats. Paste a statblock on the left, select your desired output format, and get the converted result on the right.

## 🚀 Live Demo

Visit the live application at: https://steelcompendium.github.io/web-adapter/

## 🎯 Features

- **Multiple Input/Output Formats**: Supports "Draw Steel", JSON, YAML, and Markdown.
- **Modern UI**: Clean, responsive interface built with React and Material-UI.
- **Real-time Conversion**: Instantly see the converted output as you type.
- **Copy to Clipboard**: Easily copy the converted statblock.
- **Schema Validation**: Converted JSON is validated against a schema.

## 🛠️ Development

### Project Structure

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions CI/CD for deploying to GitHub Pages
├── build/                    # The output of the build process, deployed to GitHub pages
├── public/
│   └── index.html            # Main application shell
├── src/
│   ├── adapters/             # Contains the logic for parsing and formatting statblocks
│   ├── components/           # React components for the UI
│   ├── schema/               # JSON schema definitions for statblock data
│   ├── validation/           # Validation logic using the schemas
│   ├── App.js                # Main application component
│   └── index.js              # Entry point for the React application
├── package.json
└── README.md
```

### Local Development

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/SteelCompendium/statblock-adapter-gl-pages.git
    cd statblock-adapter-gl-pages
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm start
    ```
    This runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser. The page will reload when you make changes.

### Building for Production

To create a production-ready build, run:
```bash
npm run build
```
This builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

## 🔧 Architecture

The conversion logic is built on an **Adapter Pattern**. This makes it easy to add support for new statblock formats.

### Core Components

-   `AdapterRegistry`: A singleton that manages all the available adapters. It's responsible for orchestrating the conversion process by selecting the correct source and target adapters.
-   `BaseAdapter`: An abstract base class that defines the interface for all adapters. Each adapter must implement `parse()`, `format()`, and `getName()`.
-   **Adapters** (e.g., `DrawSteelAdapter`, `JsonAdapter`): Concrete implementations of `BaseAdapter`. Each adapter handles a specific statblock format.

### Conversion Flow

1.  The UI calls the `AdapterRegistry.convert()` method with the input text, source format, and target format.
2.  The `AdapterRegistry` retrieves the appropriate source and target adapter.
3.  The source adapter's `parse()` method is called to convert the input text into a standardized JavaScript object.
4.  The target adapter's `format()` method is called with the standardized object to produce the final output string.
5.  If the output is JSON, it is validated against the official schema.

## 📝 Data Format

The internal standardized data structure used between parsing and formatting is based on the JSON Schema defined in `src/schema/statblock.schema.json`. This ensures consistency and allows for validation.

Here is a simplified view of the main properties:

```javascript
{
  "name": "string",
  "level": "integer",
  "roles": ["string"],
  "ancestry": ["string"],
  "ev": "string",
  "stamina": "integer",
  "speed": "string",
  "size": "string",
  "stability": "integer",
  "free_strike": "integer",
  "might": "integer",
  "agility": "integer",
  "reason": "integer",
  "intuition": "integer",
  "presence": "integer",
  "traits": [/* ... */],
  "abilities": [/* ... */]
}
```
For the complete and detailed schema, please refer to `src/schema/statblock.schema.json` and `src/schema/ability.schema.json`.

## 🧩 Adding New Formats

To add support for a new format, you need to create a new adapter class.

1.  **Create the Adapter Class**:
    Create a new file in `src/adapters/`, for example `MyFormatAdapter.js`. The class must extend `BaseAdapter` and implement the `getName()`, `parse()`, and `format()` methods.

    ```javascript
    import BaseAdapter from './BaseAdapter';

    class MyFormatAdapter extends BaseAdapter {
      getName() {
        return 'My Format';
      }

      parse(text) {
        // Convert the input text into the standardized statblock object
        const statblock = { /* ... */ };
        return statblock;
      }

      format(statblock) {
        // Convert the standardized statblock object into a string
        return '...formatted string...';
      }
    }

    export default MyFormatAdapter;
    ```

2.  **Register the Adapter**:
    In `src/adapters/AdapterRegistry.js`, import your new adapter and register it in the `registerDefaultAdapters` method.

    ```javascript
    // src/adapters/AdapterRegistry.js
    import MyFormatAdapter from './MyFormatAdapter';

    class AdapterRegistry {
      // ...
      registerDefaultAdapters() {
        // ...
        this.registerAdapter(new MyFormatAdapter());
      }
      // ...
    }
    ```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new feature branch: `git checkout -b feature/my-new-feature`
3.  Make your changes.
4.  Commit your changes: `git commit -am 'Add some feature'`
5.  Push to the branch: `git push origin feature/my-new-feature`
6.  Submit a pull request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.