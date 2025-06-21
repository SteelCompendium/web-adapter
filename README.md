# Statblock Converter

A web-based tool for converting tabletop RPG statblocks and abilities between different formats. It can also extract entities from unstructured text, and bulk-process files.

## 🚀 Live Demo

Visit the live application at: https://steelcompendium.github.io/web-adapter/

## 🎯 Features

- **Flexible I/O**: Supports multiple formats for reading and writing.
    - **Input Formats**: Automatically detect, Prerelease PDF Text, JSON, and YAML.
    - **Output Formats**: JSON and YAML.
- **Statblock and Ability Extraction**: Pulls statblocks directly from unstructured Prerelease PDF text.
- **Bulk Conversion**: Upload multiple files and convert them to various formats simultaneously, conveniently bundled into a zip file.
- **Modern UI**: Clean, responsive interface built with React and Material-UI.
- **Real-time Conversion**: Instantly see the converted output as you type in the main editor.
- **Copy to Clipboard**: Easily copy the converted statblock.
- **Schema Validation**: Converted JSON is validated against the official `steel-compendium-sdk` schema.

## 🛠️ Development

### Local Development

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/SteelCompendium/web-adapter.git
    cd web-adapter
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

## 🔧 Architecture & Core Concepts

The conversion logic is powered by the [**steel-compendium-sdk**](https://github.com/SteelCompendium/steel-compendium-sdk), which provides a standardized way to work with statblock and ability data. This makes it easy to add support for new formats.

### Core Components

-   `ConverterRegistry`: A singleton that manages all available Readers, Writers, and Extractors. It orchestrates the conversion process.
-   **Readers**: Classes that parse input text from a specific format (e.g., `PrereleasePdfStatblockReader`, `JsonReader`) into a standardized JavaScript object defined by the SDK.
-   **Writers**: Classes that format a standardized JavaScript object into a specific output string (e.g., `JsonWriter`, `YamlWriter`).
-   **Extractors**: Classes that find and parse entities from larger bodies of unstructured text (e.g., `PrereleasePdfStatblockExtractor`).

### Conversion Flow

1.  The UI calls the `ConverterRegistry` with the input text, source format, and target format.
2.  The `ConverterRegistry` selects the correct **Reader** to parse the text into a standardized model object.
3.  The `ConverterRegistry` then uses the appropriate **Writer** to format the object into the target output string.
4.  If the output is JSON, it is validated against the official SDK schema.

## 📝 Data Format

The internal standardized data structure used for statblocks and abilities is defined and managed by the `steel-compendium-sdk`. This ensures consistency, enables validation, and allows for seamless interoperability between different formats.

For details on the data model, please refer to the `steel-compendium-sdk` documentation.

## 🧩 Adding New Formats

To add support for a new format, you need to create a new Reader or Writer class and register it. While the core classes are in the SDK, you can register new ones within this project.

1.  **Create the Reader/Writer Class**:
    Your new class should conform to the Reader or Writer interface expected by the `ConverterRegistry`.

    ```javascript
    class MyFormatReader {
      read(text) {
        // Convert the input text into the standardized statblock object
        const statblock = { /* ... */ };
        return statblock;
      }
    }

    class MyFormatWriter {
      write(statblock) {
        // Convert the standardized statblock object into a string
        return '...formatted string...';
      }
    }
    ```

2.  **Register the new class**:
    In `src/components/ConverterRegistry.js`, import your new class and register an instance of it in the `registerDefaultReadersAndWriters` method.

    ```javascript
    // src/components/ConverterRegistry.js
    import { MyFormatReader, MyFormatWriter } from './my-format-sdk-extension'; // or wherever it's defined

    class ConverterRegistry {
      // ...
      registerDefaultReadersAndWriters() {
        // ...
        this.registerReader("My Awesome Format", new MyFormatReader());
        this.registerWriter("My Awesome Format", new MyFormatWriter());
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

This project is licensed under the MIT License.