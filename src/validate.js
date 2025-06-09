// validate.js
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const schema = require('./schema.json');

const ajv = new Ajv({ allErrors: true });

const validate = ajv.compile(schema);

const inputFile = process.argv[2];
if (!inputFile) {
  console.error('Usage: node validate.js <path-to-json>');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));

const valid = validate(data);

if (valid) {
  console.log('✅ JSON is valid!');
} else {
  console.error('❌ JSON validation failed:');
  console.error(validate.errors);
  process.exit(1);
}
