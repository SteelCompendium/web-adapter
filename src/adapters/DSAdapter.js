import BaseAdapter from "./BaseAdapter";

class DrawSteelTextAdapter extends BaseAdapter {
	getName() {
		return "Draw Steel Text → JSON Adapter";
	}

	parse(text) {
		const lines = text.split(/\r?\n/).map(l => l.trim());
		let idx = 0;

		// skip any leading blank lines
		while (idx < lines.length && !lines[idx]) idx++;

		// 1) Header: name, tags
		const nameLine = lines[idx++];
		const nameMatch = /^(.+?)\s+LEVEL\s+(\d+)\s*(.*)$/.exec(nameLine);
		const statblock = {
			name: nameMatch ? nameMatch[1].trim() : nameLine,
			level: nameMatch ? parseInt(nameMatch[2], 10) : 0,
			roles: nameMatch && nameMatch[3]
				? nameMatch[3].split(/\s+/).map(t => t.trim()).filter(Boolean)
				: [],
		};

		// 2) Type / Subtype / EV - map to ancestry array
		const typeLine = lines[idx++];
		const typeMatch = /^([^,]+),\s*([^ ]+)\s+EV\s+(\d+)$/.exec(typeLine);
		if (typeMatch) {
			// Map type and subtype to ancestry array as expected by schema
			statblock.ancestry = [typeMatch[1].trim(), typeMatch[2].trim()];
			statblock.ev = parseInt(typeMatch[3], 10);
		} else {
			statblock.ancestry = [];
			statblock.ev = 0;
		}

		// 3) Stamina
		const staminaLine = lines[idx++];
		const staminaMatch = /^Stamina\s+(\d+)$/.exec(staminaLine);
		statblock.stamina = staminaMatch ? parseInt(staminaMatch[1], 10) : 0;

		// 4) Speed / Size / Stability
		const speedLine = lines[idx++];
		const speedMatch = /^Speed\s+(\d+)(?:\s*\(([^)]+)\))?\s+Size\s+(\S+)\s*\/\s*Stability\s+(\d+)$/.exec(speedLine);
		if (speedMatch) {
			statblock.speed = parseInt(speedMatch[1], 10);
			statblock.size = speedMatch[3];
			statblock.stability = parseInt(speedMatch[4], 10);
		} else {
			statblock.speed = 0;
			statblock.size = "";
			statblock.stability = 0;
		}

		// 5) Free Strike
		const fsLine = lines[idx++];
		const fsMatch = /^Free Strike\s+(\d+)$/.exec(fsLine);
		statblock.free_strike = fsMatch ? parseInt(fsMatch[1], 10) : 0;

		// 6) Stats - map to individual properties as expected by schema
		const statsLine = lines[idx++];
		const statsMatch = /^Might\s*([−-]?\d+)\s+Agility\s*\+?(\d+)\s+Reason\s*\+?(\d+)\s+Intuition\s*\+?(\d+)\s+Presence\s*\+?(\d+)$/.exec(statsLine);
		if (statsMatch) {
			statblock.might = parseInt(statsMatch[1].replace("−", "-"), 10);
			statblock.agility = parseInt(statsMatch[2], 10);
			statblock.reason = parseInt(statsMatch[3], 10);
			statblock.intuition = parseInt(statsMatch[4], 10);
			statblock.presence = parseInt(statsMatch[5], 10);
		} else {
			statblock.might = 0;
			statblock.agility = 0;
			statblock.reason = 0;
			statblock.intuition = 0;
			statblock.presence = 0;
		}

		// Initialize schema-compliant arrays
		statblock.immunities = [];
		statblock.traits = [];
		statblock.abilities = [];

		// 7) Actions & Maneuvers - convert to abilities array
		let current = null;
		const pushCurrent = () => {
			if (!current) return;

			// Convert to ability schema format
			const ability = {
				name: current.name,
				type: this.mapActionTypeToAbilityType(current.category),
				keywords: current.keywords || [],
				effects: [],
			};

			// Add distance and target if present
			if (current.range) {
				ability.distance = current.range;
			}
			if (current.target) {
				ability.target = current.target;
			}

			// Convert roll and outcomes to effects
			if (current.roll && current.outcomes && current.outcomes.length > 0) {
				const powerRollEffect = {
					roll: `${current.roll.dice} + ${current.roll.bonus}`,
				};

				// Add outcomes as tier results
				current.outcomes.forEach(outcome => {
					const key = this.mapOutcomeToTierKey(outcome.symbol, outcome.threshold);
					powerRollEffect[key] = outcome.description;
				});

				ability.effects.push(powerRollEffect);
			}

			// Add effect as string if present
			if (current.effect) {
				ability.effects.push(current.effect);
			}

			// Ensure effects array is not empty (required by schema)
			if (ability.effects.length === 0) {
				ability.effects.push("No effect specified");
			}

			statblock.abilities.push(ability);
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

			// End Effect - convert to trait
			const endEff = /^End Effect\s*(.*)$/.exec(line);
			if (endEff) {
				statblock.traits.push({
					name: "End Effect",
					effect: endEff[1].trim() || "At the end of their turn, the creature can take 5 damage to end one save ends effect affecting them. This damage can't be reduced in any way.",
				});
				continue;
			}
		}

		// push last one
		pushCurrent();

		return statblock;
	}

	/**
	 * Maps action category to ability type for schema compliance
	 */
	mapActionTypeToAbilityType(category) {
		if (category === "Maneuver") return "Maneuver";
		if (category === "Main Action") return "Action";
		if (category === "Free Triggered Action") return "Triggered Action";
		if (/Villain Action/.test(category)) return "Villain Action";
		return "Action";
	}

	/**
	 * Maps outcome symbols and thresholds to tier keys for power roll effects
	 */
	mapOutcomeToTierKey(symbol, threshold) {
		// Map symbols to approximate tier ranges
		if (symbol === "✦") {
			if (threshold.includes("≤11") || threshold.includes("11")) return "11 or lower";
			return "tier1";
		}
		if (symbol === "★") {
			if (threshold.includes("12–16") || threshold.includes("12-16")) return "12-16";
			return "tier2";
		}
		if (symbol === "✸") {
			if (threshold.includes("17+") || threshold.includes("17")) return "17+";
			return "tier3";
		}
		return threshold; // fallback to original threshold
	}

	format(statblock) {
		return JSON.stringify(statblock, null, 2);
	}
}

export default DrawSteelTextAdapter;
