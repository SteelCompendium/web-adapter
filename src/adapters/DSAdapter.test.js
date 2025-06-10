import { describe, it, expect } from "@jest/globals";
import fs from "fs";
import path from "path";
import DSAdapter from "./DSAdapter";

describe("DSAdapter", () => {
	const adapter = new DSAdapter();
	const inputsDir = path.join(__dirname, "..", "__tests__", "data", "ds-adapter", "inputs");
	const outputsDir = path.join(__dirname, "..", "__tests__", "data", "ds-adapter", "outputs");

	const testFiles = fs.readdirSync(inputsDir).filter(file => file.endsWith(".txt"));

	testFiles.forEach(file => {
		it(`should correctly parse ${file}`, () => {
			const inputPath = path.join(inputsDir, file);
			const outputPath = path.join(outputsDir, file.replace(".txt", ".json"));

			const inputText = fs.readFileSync(inputPath, "utf-8");
			const expectedOutput = JSON.parse(fs.readFileSync(outputPath, "utf-8"));

			const result = adapter.parse(inputText);

			expect(result).toEqual(expectedOutput);
		});
	});
});