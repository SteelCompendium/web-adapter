// validate.js
const fs = require("fs");
const Ajv = require("ajv");
const statblockSchema = require("./statblock.schema.json");
const abilitySchema = require("./ability.schema.json");

const ajv = new Ajv({ allErrors: true });

// Add the ability schema to AJV so it can resolve references
ajv.addSchema(abilitySchema, "ability.schema.json");

const validate = ajv.compile(statblockSchema);

const inputFile = process.argv[2];
if (!inputFile) {
	console.error("Usage: node validate.js <path-to-json>");
	process.exit(1);
}

const data = JSON.parse(fs.readFileSync(inputFile, "utf-8"));

const valid = validate(data);

if (valid) {
	console.log("✅ JSON is valid!");
} else {
	console.error("❌ JSON validation failed:");
	console.error(validate.errors);
	process.exit(1);
}
