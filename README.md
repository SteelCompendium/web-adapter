# Statblock Converter

A web-based tool for converting Draw Steel TTRPG statblocks and abilities between different formats. It can also extract entities from unstructured text, and bulk-process files.

## 🚀 Live Site

Visit the live application at: https://steelcompendium.github.io/web-adapter/

## ✨ Features

- **Universal Conversion**: Supports a variety of input and output formats.
    - **Input**: Automatically identify format, Prerelease PDF Text, JSON, and YAML.
    - **Output**: JSON and YAML.
- **Intelligent Text Extraction**: Automatically pulls statblocks and abilities directly from unstructured text, such as a copy-pasted PDF page.
- **Efficient Bulk Processing**: Upload multiple files and convert them to various formats simultaneously. The tool will conveniently bundle the results into a single zip file for download.
- **User-Friendly Interface**: A clean, modern, and responsive UI built with React and Material-UI. Includes a real-time editor and a simple "copy to clipboard" button.
- **Reliable & Validated**: All conversions are powered by the `steel-compendium-sdk`, and outgoing JSON is validated against the official schema to ensure data integrity.

## 📖 How to Use

The application is divided into three main tabs, each designed for a specific task:

### Single Conversion
1.  Paste your source text (e.g., a statblock) into the left-hand input panel.
2.  Select the input format (or leave it to be auto-detected).
3.  Select your desired output format.
4.  The converted output will appear instantly in the right-hand panel. Copy it to your clipboard with a single click.

### Bulk Conversion
1.  Select the format of your input files.
2.  Click "Select Files" to choose multiple statblock or ability files.
3.  Check the boxes for all the output formats you need.
4.  Click "Convert." A zip file containing all your converted files, organized into folders by format, will be automatically downloaded.

### Extractor
1.  Paste a body of text containing one or more statblocks (e.g., from a PDF) into the input panel.
2.  Select the extractor (e.g., "Prerelease PDF Statblock Text").
3.  Click "Extract." The tool will find and list all extracted statblocks, which you can then view or copy as JSON.

---

<details>
<summary><b>For Developers</b></summary>

## 🛠️ Local Development

1.  **Install dependencies:**
    ```bash
    npm install
    ```

1.  **Run the development server:**
    ```bash
    npm start
    ```
    This runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## 🔧 Architecture & Core Concepts

The conversion logic is powered by the [**steel-compendium-sdk**](https://github.com/SteelCompendium/data-sdk-npm), which provides a standardized way to work with statblock and ability data.

-   **`ConverterRegistry`**: A singleton that manages all available Readers, Writers, and Extractors.
-   **Readers**: Parse input text from a specific format into a standardized SDK object.
-   **Writers**: Format a standardized object into a specific output string.
-   **Extractors**: Find and parse entities from larger bodies of unstructured text.

For details on the data model, please refer to the `data-sdk-npm` documentation.

## 🤝 Contributing

Contributions are welcome! Please fork the repository, create a feature branch, and submit a pull request.

## 📄 License

This project is licensed under the MIT License.

</details>