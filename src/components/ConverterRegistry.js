import {
	JsonReader,
	JsonWriter,
	YamlReader,
	YamlWriter,
	MarkdownAbilityWriter,
	MarkdownAbilityReader,
	PrereleasePdfStatblockReader,
	PrereleasePdfAbilityReader,
	PrereleasePdfStatblockExtractor,
	validator,
	Statblock,
	Ability,
	AutoDataReader,
} from "steel-compendium-sdk";

class ConverterRegistry {
	constructor() {
		this.readers = new Map();
		this.writers = new Map();
		this.extractors = new Map();
		this.registerDefaultReadersAndWriters();
	}

	registerDefaultReadersAndWriters() {
		this.registerReader("Automagically Identify Input Format", new AutoDataReader());
		this.registerReader("Statblock: Prerelease PDF Text", new PrereleasePdfStatblockReader());
		this.registerReader("Statblock: JSON", new JsonReader(Statblock.modelDTOAdapter));
		this.registerReader("Statblock: YAML", new YamlReader(Statblock.modelDTOAdapter));
		this.registerReader("Ability: Prerelease PDF Text", new PrereleasePdfAbilityReader());
		this.registerReader("Ability: JSON", new JsonReader(Ability.modelDTOAdapter));
		this.registerReader("Ability: YAML", new YamlReader(Ability.modelDTOAdapter));
		this.registerReader("Ability: Markdown (Steel Compendium formatted)", new MarkdownAbilityReader());

		this.registerWriter("JSON", new JsonWriter());
		this.registerWriter("YAML", new YamlWriter());
		this.registerWriter("Markdown Ability", new MarkdownAbilityWriter());

		this.registerExtractor("Prerelease PDF Statblock Text", new PrereleasePdfStatblockExtractor());
	}

	registerReader(name, reader) {
		this.readers.set(name, reader);
	}

	registerWriter(name, writer) {
		this.writers.set(name, writer);
	}

	registerExtractor(name, extractor) {
		this.extractors.set(name, extractor);
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

	getExtractor(name) {
		const extractor = this.extractors.get(name);
		if (!extractor) {
			throw new Error(`No extractor found for format: ${name}`);
		}
		return extractor;
	}

	getAvailableReaderFormats() {
		return Array.from(this.readers.keys());
	}

	getAvailableWriterFormats() {
		return Array.from(this.writers.keys());
	}

	getAvailableExtractorFormats() {
		return Array.from(this.extractors.keys());
	}

	convert(text, sourceFormat, targetFormat) {
		const sourceReader = this.getReader(sourceFormat);

		const standardizedStatblock = sourceReader.read(text);

		const result = this.write(standardizedStatblock, targetFormat);

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

	extract(text, extractorFormat) {
		const extractor = this.getExtractor(extractorFormat);
		return extractor.extract(text);
	}

	write(model, targetFormat) {
		const targetWriter = this.getWriter(targetFormat);
		return targetWriter.write(model);
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