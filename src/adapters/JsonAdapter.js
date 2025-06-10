import BaseAdapter from "./BaseAdapter";

class JsonAdapter extends BaseAdapter {
	getName() {
		return "JSON";
	}

	parse(text) {
		try {
			return JSON.parse(text);
		} catch (e) {
			// eslint-disable-next-line no-console
			console.error("Error parsing JSON:", e);
			throw new Error("Invalid JSON input.");
		}
	}

	format(statblock) {
		return JSON.stringify(statblock, null, 2);
	}
}

export default JsonAdapter;