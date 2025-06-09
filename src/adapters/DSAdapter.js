import BaseAdapter from "./BaseAdapter";

class DrawSteelTextAdapter extends BaseAdapter {
	getName () {
		return "Draw Steel Text → JSON Adapter";
	}

	parse (text) {
		const lines = text.split(/\r?\n/).map(l => l.trim());
		let idx = 0;

		// skip any leading blank lines
		while (idx < lines.length && !lines[idx]) idx++;

		// 1) Header: name, tags
		const nameLine = lines[idx++];
		const nameMatch = /^(.+?)\s+LEVEL\s+(\d+)\s*(.*)$/.exec(nameLine);
		const statblock = {
			name: nameMatch ? nameMatch[1].trim() : nameLine,
			level: nameMatch ? parseInt(nameMatch[2], 10) : undefined,
			tags: nameMatch && nameMatch[3]
				? nameMatch[3].split(/\s+/).map(t => t.trim()).filter(Boolean)
				: [],
		};

		// 2) Type / Subtype / EV
		const typeLine = lines[idx++];
		const typeMatch = /^([^,]+),\s*([^ ]+)\s+EV\s+(\d+)$/.exec(typeLine);
		if (typeMatch) {
			statblock.type = typeMatch[1].trim();
			statblock.subtype = typeMatch[2].trim();
			statblock.ev = parseInt(typeMatch[3], 10);
		}

		// 3) Stamina
		const staminaLine = lines[idx++];
		const staminaMatch = /^Stamina\s+(\d+)$/.exec(staminaLine);
		if (staminaMatch) statblock.stamina = parseInt(staminaMatch[1], 10);

		// 4) Speed / Size / Stability
		const speedLine = lines[idx++];
		const speedMatch = /^Speed\s+(\d+)(?:\s*\(([^)]+)\))?\s+Size\s+(\S+)\s*\/\s*Stability\s+(\d+)$/.exec(speedLine);
		if (speedMatch) {
			statblock.speed = parseInt(speedMatch[1], 10);
			if (speedMatch[2]) statblock.speedModes = speedMatch[2].split(/\s*,\s*/);
			statblock.size = speedMatch[3];
			statblock.stability = parseInt(speedMatch[4], 10);
		}

		// 5) Free Strike
		const fsLine = lines[idx++];
		const fsMatch = /^Free Strike\s+(\d+)$/.exec(fsLine);
		if (fsMatch) statblock.free_strike = parseInt(fsMatch[1], 10);

		// 6) Stats
		const statsLine = lines[idx++];
		const statsMatch = /^Might\s*([−-]?\d+)\s+Agility\s*\+?(\d+)\s+Reason\s*\+?(\d+)\s+Intuition\s*\+?(\d+)\s+Presence\s*\+?(\d+)$/.exec(statsLine);
		if (statsMatch) {
			statblock.stats = {
				might: parseInt(statsMatch[1].replace("−", "-"), 10),
				agility: parseInt(statsMatch[2], 10),
				reason: parseInt(statsMatch[3], 10),
				intuition: parseInt(statsMatch[4], 10),
				presence: parseInt(statsMatch[5], 10),
			};
		}

		// 7) Actions & Maneuvers
		statblock.features = [];
		statblock.actions = [];
		statblock.maneuvers = [];

		let current = null;
		const pushCurrent = () => {
			if (!current) return;
			if (current.category === "Maneuver") statblock.maneuvers.push(current);
			else if (/Villain Action/.test(current.category)) statblock.actions.push(current);
			else statblock.actions.push(current);
		};

		while (idx < lines.length) {
			const line = lines[idx++];

			// new action/maneuver header?
			const headerRe = /^(.+?)\s+\((Main Action|Maneuver|Free Triggered Action|Villain Action\s*\d+)\)\s+◆\s*(\d+d\d+)\s*\+\s*(\d+)(?:\s*◆\s*(.+))?$/;
			const m = headerRe.exec(line);
			if (m) {
				pushCurrent();
				current = {
					name: m[1].trim(),
					category: m[2],
					roll: { dice: m[3], bonus: parseInt(m[4], 10) },
					traits: m[5] ? m[5].split(/\s*,\s*/).map(t => t.trim()) : [],
					keywords: [],
					range: "",
					target: "",
					outcomes: [],
					effect: "",
				};
				continue;
			}

			if (!current) continue; // skip until we hit first action

			// Keywords
			const kw = /^Keywords\s+(.+)$/.exec(line);
			if (kw) {
				current.keywords = kw[1].split(/\s*,\s*/).map(s => s.trim());
				continue;
			}

			// Distance & Target
			const dt = /^Distance\s+(.+?)\s+Target\s+(.+)$/.exec(line);
			if (dt) {
				current.range = dt[1].trim();
				current.target = dt[2].trim();
				continue;
			}

			// Outcomes: ✦ ★ ✸
			const out = /^([✦★✸])\s*(≤?\d+(?:–\d+)?|\d\+?)\s+(.+)$/.exec(line);
			if (out) {
				current.outcomes.push({
					symbol: out[1],
					threshold: out[2],
					description: out[3].trim(),
				});
				continue;
			}

			// Effect (may span multiple lines)
			const eff = /^Effect\s+(.+)$/.exec(line);
			if (eff) {
				current.effect = eff[1].trim();
				// collect following indented lines
				while (idx < lines.length && lines[idx].startsWith(" ")) {
					current.effect += ` ${lines[idx++].trim()}`;
				}
				continue;
			}

			// End Effect
			const endEff = /^End Effect\s*(.*)$/.exec(line);
			if (endEff) {
				statblock.features.push({
					name: "End Effect",
					description: endEff[1].trim(),
					keywords: [],
				});
				continue;
			}
		}

		// push last one
		pushCurrent();

		return statblock;
	}

	format (statblock) {
		return JSON.stringify(statblock, null, 2);
	}
}

export default DrawSteelTextAdapter;
