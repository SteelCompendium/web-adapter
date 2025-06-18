import {
	JsonReader,
	JsonWriter,
	YamlReader,
	YamlWriter,
	MarkdownAbilityWriter,
	PrereleasePdfStatblockReader,
	validator,
} from "steel-compendium-sdk";

class ConverterRegistry {
	constructor() {
		this.readers = new Map();
		this.writers = new Map();
		this.registerDefaultReadersAndWriters();
	}

	registerDefaultReadersAndWriters() {
		this.registerReader("Prerelease PDF Statblock Text", new PrereleasePdfStatblockReader());
		this.registerReader("JSON", new JsonReader());
		this.registerReader("YAML", new YamlReader());

		this.registerWriter("JSON", new JsonWriter());
		this.registerWriter("YAML", new YamlWriter());
		this.registerWriter("Markdown Ability", new MarkdownAbilityWriter());
	}

	registerReader(name, reader) {
		this.readers.set(name, reader);
	}

	registerWriter(name, writer) {
		this.writers.set(name, writer);
	}

	getReader(name) {
		const reader = this.readers.get(name);
		if (!reader) {
			throw new Error(`No reader found for format: ${name}`);
		}
		return reader;
	}

	getWriter(name) {
		const writer = this.writers.get(name);
		if (!writer) {
			throw new Error(`No writer found for format: ${name}`);
		}
		return writer;
	}

	getAvailableReaderFormats() {
		return Array.from(this.readers.keys());
	}

	getAvailableWriterFormats() {
		return Array.from(this.writers.keys());
	}

	convert(text, sourceFormat, targetFormat) {
		const sourceReader = this.getReader(sourceFormat);
		const targetWriter = this.getWriter(targetFormat);

		const standardizedStatblock = sourceReader.read(text);

		const result = targetWriter.write(standardizedStatblock);

		if (targetFormat.toLowerCase().includes("json") || this.isJSONFormat(result)) {
			try {
				const validationResult = validator.validateJSON(result);
				if (!validationResult.valid) {
					const errorMessages = validator.formatErrors(validationResult.errors);
					// eslint-disable-next-line no-console
					console.warn("Generated JSON does not conform to schema:", errorMessages);
				}
			} catch (validationError) {
				// eslint-disable-next-line no-console
				console.warn("Could not validate generated JSON:", validationError.message);
			}
		}

		return result;
	}

	isJSONFormat(text) {
		if (typeof text !== "string") return false;
		const trimmed = text.trim();
		return (trimmed.startsWith("{") && trimmed.endsWith("}"))
			|| (trimmed.startsWith("[") && trimmed.endsWith("]"));
	}
}

const registry = new ConverterRegistry();
export default registry;