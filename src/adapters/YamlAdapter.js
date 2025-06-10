import BaseAdapter from "./BaseAdapter";
import yaml from "js-yaml";

class YamlAdapter extends BaseAdapter {
	getName() {
		return "YAML";
	}

	parse(text) {
		try {
			return yaml.load(text);
		} catch (e) {
			// eslint-disable-next-line no-console
			console.error("Error parsing YAML:", e);
			throw new Error("Invalid YAML input.");
		}
	}

	format(statblock) {
		return yaml.dump(statblock);
	}
}

export default YamlAdapter;