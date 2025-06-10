import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";

export default [
	{
		ignores: [
			"build/**/*",
			"dist/**/*",
			"node_modules/**/*",
			"*.min.js",
		],
	},
	{
		files: ["**/*.{js,mjs,cjs,jsx}"],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
			parserOptions: {
				ecmaVersion: "latest",
				sourceType: "module",
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		rules: {
			...js.configs.recommended.rules,
			"quotes": ["error", "double"],
			"indent": ["error", "tab"],
			"comma-dangle": ["error", "always-multiline"],
			"no-trailing-spaces": "error",
			"space-before-function-paren": ["error", "always"],
		},
	},
	{
		files: ["**/*.{js,jsx}"],
		plugins: {
			react: pluginReact,
		},
		rules: {
			...pluginReact.configs.recommended.rules,
			"react/react-in-jsx-scope": "off", // Not needed in React 17+
		},
		settings: {
			react: {
				version: "detect",
			},
		},
	},
];
