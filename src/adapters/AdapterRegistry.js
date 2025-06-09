import DnD5EAdapter from "./DnD5EAdapter";
import DSAdapter from "./DSAdapter";
import validator from "../validation/validator";

class AdapterRegistry {
	constructor() {
		this.adapters = new Map();
		this.registerDefaultAdapters();
	}

	registerDefaultAdapters() {
		this.registerAdapter(new DnD5EAdapter());
		this.registerAdapter(new DSAdapter());
		// Register more default adapters here
	}

	registerAdapter(adapter) {
		this.adapters.set(adapter.getName(), adapter);
	}

	getAdapter(name) {
		const adapter = this.adapters.get(name);
		if (!adapter) {
			throw new Error(`No adapter found for format: ${name}`);
		}
		return adapter;
	}

	getAvailableFormats() {
		return Array.from(this.adapters.keys());
	}

	convert(text, sourceFormat, targetFormat) {
		const sourceAdapter = this.getAdapter(sourceFormat);
		const targetAdapter = this.getAdapter(targetFormat);

		// Parse the input text into a standardized format
		const standardizedStatblock = sourceAdapter.parse(text);

		// Format the standardized statblock into the target format
		const result = targetAdapter.format(standardizedStatblock);

		// If the target format is JSON, validate it against the schema
		if (targetFormat.toLowerCase().includes("json") || this.isJSONFormat(result)) {
			try {
				const validationResult = validator.validateJSON(result);
				if (!validationResult.valid) {
					const errorMessages = validator.formatErrors(validationResult.errors);
					// eslint-disable-next-line no-console
					console.warn("Generated JSON does not conform to schema:", errorMessages);
					// Note: We're not throwing an error here to avoid breaking existing functionality
					// but we log the validation issues for debugging
				}
			} catch (validationError) {
				// eslint-disable-next-line no-console
				console.warn("Could not validate generated JSON:", validationError.message);
			}
		}

		return result;
	}

	/**
	 * Helper method to detect if a string is JSON format
	 * @param {string} text - The text to check
	 * @returns {boolean} - True if the text appears to be JSON
	 */
	isJSONFormat(text) {
		if (typeof text !== "string") return false;
		const trimmed = text.trim();
		return (trimmed.startsWith("{") && trimmed.endsWith("}"))
			|| (trimmed.startsWith("[") && trimmed.endsWith("]"));
	}
}

// Create a singleton instance
const registry = new AdapterRegistry();
export default registry;