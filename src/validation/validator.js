import Ajv from "ajv";
import addFormats from "ajv-formats";
import statblockSchema from "../statblock.schema.json";
import abilitySchema from "../ability.schema.json";

class JSONValidator {
	constructor () {
		this.ajv = new Ajv({ allErrors: true, strict: false });
		addFormats(this.ajv);

		// Add the ability schema to AJV so it can resolve references
		this.ajv.addSchema(abilitySchema, "ability.schema.json");

		// Compile the main statblock schema
		this.validateStatblock = this.ajv.compile(statblockSchema);
	}

	/**
     * Validates a JSON object against the statblock schema
     * @param {Object} data - The JSON data to validate
     * @returns {Object} - { valid: boolean, errors: Array }
     */
	validate (data) {
		try {
			const valid = this.validateStatblock(data);
			return {
				valid,
				errors: valid ? [] : this.validateStatblock.errors || [],
			};
		} catch (error) {
			return {
				valid: false,
				errors: [{ message: `Validation error: ${error.message}` }],
			};
		}
	}

	/**
     * Validates a JSON string against the statblock schema
     * @param {string} jsonString - The JSON string to validate
     * @returns {Object} - { valid: boolean, errors: Array, data: Object|null }
     */
	validateJSON (jsonString) {
		try {
			const data = JSON.parse(jsonString);
			const validation = this.validate(data);
			return {
				...validation,
				data: validation.valid ? data : null,
			};
		} catch (parseError) {
			return {
				valid: false,
				errors: [{ message: `JSON Parse Error: ${parseError.message}` }],
				data: null,
			};
		}
	}

	/**
     * Formats validation errors for display
     * @param {Array} errors - Array of AJV validation errors
     * @returns {Array} - Array of formatted error messages
     */
	formatErrors (errors) {
		return errors.map(error => {
			const path = error.instancePath || "root";
			const message = error.message || "Unknown error";
			return `${path}: ${message}`;
		});
	}
}

// Create a singleton instance
const validator = new JSONValidator();
export default validator;