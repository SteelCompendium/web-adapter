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
		const nameMatch = /^(.+?)\s+L\s*EVEL\s+(\d+)\s*(.*)$/i.exec(nameLine);
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

		// 6) Stats
		const statsLine = lines[idx++];
		const statsMatch = /^Might\s*([−-]?\d+)\s+Agility\s*([+-−]?\d+)\s+Reason\s*([+-−]?\d+)\s+Intuition\s*([+-−]?\d+)\s+Presence\s*([+-−]?\d+)$/.exec(statsLine);
		if (statsMatch) {
			statblock.might = parseInt(statsMatch[1].replace("−", "-"), 10);
			statblock.agility = parseInt(statsMatch[2].replace("−", "-"), 10);
			statblock.reason = parseInt(statsMatch[3].replace("−", "-"), 10);
			statblock.intuition = parseInt(statsMatch[4].replace("−", "-"), 10);
			statblock.presence = parseInt(statsMatch[5].replace("−", "-"), 10);
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

		const isNewToken = (line) => {
			if (!line.trim()) return true; // blank line
			if (/^(.+?)\s+\((Main Action|Maneuver|Free Triggered Action|Villain Action\s*\d+)\)/.test(line)) return true;
			if (/^Keywords\s+/.test(line)) return true;
			if (/^Distance\s+/.test(line)) return true;
			if (/^[✦★✸]/.test(line)) return true;
			if (/^Effect\s+/.test(line)) return true;
			if (/^Trigger\s+/.test(line)) return true;
			if (/^End Effect/.test(line)) return true;
			if (/^\d+\s+Malice/.test(line)) return true;
			return false;
		};

		// 7) Actions & Maneuvers
		let current = null;
		const pushCurrent = () => {
			if (!current) return;

			const ability = {
				name: current.name,
				type: this.mapActionTypeToAbilityType(current.category),
				keywords: current.keywords,
				effects: [],
			};

			if (current.cost) {
				ability.cost = current.cost;
			}

			if (current.range) {
				ability.distance = current.range;
			}

			if (current.target) {
				ability.target = current.target;
			}

			if (current.trigger) {
				ability.trigger = current.trigger;
			}

			// Create effects from roll and outcomes
			if (current.roll) {
				const rollEffect = {
					roll: `${current.roll.dice} + ${current.roll.bonus}`,
				};
				if (current.outcomes && current.outcomes.length > 0) {
					current.outcomes.forEach(o => {
						const tierKey = this.mapOutcomeToTierKey(o.symbol, o.threshold);
						rollEffect[tierKey] = o.description;
					});
				}
				ability.effects.push(rollEffect);
			}

			if (current.effect) {
				ability.effects.push(current.effect);
			}

			if (current.sub_effects && current.sub_effects.length > 0) {
				ability.effects.push(...current.sub_effects);
			}

			statblock.abilities.push(ability);
		};

		while (idx < lines.length) {
			const line = lines[idx++];
			if (!line) continue;

			// new action/maneuver header?
			const headerRe = /^(.+?)\s+\((Main Action|Maneuver|Free Triggered Action|Villain Action\s*\d+)\)(?:\s*◆\s*(.+))?$/;
			const m = headerRe.exec(line);
			if (m) {
				pushCurrent();
				current = {
					name: m[1].trim(),
					category: m[2],
					keywords: [],
					range: "",
					target: "",
					outcomes: [],
					effect: "",
					trigger: "",
					sub_effects: [],
				};

				const details = m[3] ? m[3].trim() : "";
				if (details) {
					const rollRegex = /(\d+d\d+)\s*\+\s*(\d+)/;
					const rollMatch = rollRegex.exec(details);
					if (rollMatch) {
						current.roll = { dice: rollMatch[1], bonus: parseInt(rollMatch[2], 10) };
						const remaining = details.replace(rollMatch[0], "").replace("◆", "").trim();
						if (remaining) {
							current.cost = remaining;
						}
					} else {
						current.cost = details;
					}
				}
				continue;
			}

			if (!current) continue;

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
			const out = /^([✦★✸])\s*(≤?\d+(?:–\d+)?|\d+\+?)\s+(.+)$/.exec(line);
			if (out) {
				current.outcomes.push({
					symbol: out[1],
					threshold: out[2],
					description: out[3].trim(),
				});
				continue;
			}

			// Effect
			const eff = /^Effect\s+(.+)$/.exec(line);
			if (eff) {
				current.effect = eff[1].trim();
				// collect following indented lines
				while (idx < lines.length && !isNewToken(lines[idx])) {
					current.effect += ` ${lines[idx++].trim()}`;
				}
				continue;
			}

			// Trigger
			const trigger = /^Trigger\s+(.+)$/.exec(line);
			if (trigger) {
				current.trigger = trigger[1].trim();
				// collect following indented lines
				while (idx < lines.length && !isNewToken(lines[idx])) {
					current.trigger += ` ${lines[idx++].trim()}`;
				}
				continue;
			}

			// End Effect
			const endEff = /^End Effect\s*(.*)$/.exec(line);
			if (endEff) {
				pushCurrent();
				current = null;

				let effectText = endEff[1].trim();
				while (idx < lines.length && !isNewToken(lines[idx])) {
					const nextLine = lines[idx++].trim();
					if (nextLine) {
						effectText += (effectText ? " " : "") + nextLine;
					}
				}
				statblock.traits.push({
					name: "End Effect",
					effect: effectText || "At the end of their turn, the creature can take 5 damage to end one save ends effect affecting them. This damage can't be reduced in any way.",
				});
				continue;
			}

			// Malice cost
			const malice = /^(\d+)\s+Malice\s+(.+)$/.exec(line);
			if (malice) {
				let maliceEffectText = malice[2].trim();
				while (idx < lines.length && !isNewToken(lines[idx])) {
					maliceEffectText += ` ${lines[idx++].trim()}`;
				}
				current.sub_effects.push({
					cost: `${malice[1]} Malice`,
					effect: maliceEffectText,
				});
				continue;
			}

			// If we hit a blank line, push the current ability
			if (!line.trim()) {
				pushCurrent();
				current = null;
			}
		}

		// push last one
		pushCurrent();

		return statblock;
	}

	/**
	 * Maps action category to ability type for schema compliance
	 */
	mapActionTypeToAbilityType (category) {
		if (category === "Main Action") return "Action";
		if (category === "Maneuver") return "Maneuver";
		if (category === "Free Triggered Action") return "Triggered Action";
		if (category.startsWith("Villain Action")) return category;
		return "Action";
	}

	/**
	 * Maps outcome symbols and thresholds to tier keys for power roll effects
	 */
	mapOutcomeToTierKey (symbol, threshold) {
		if (threshold.includes("≤")) {
			return "11 or lower";
		} else if (threshold.includes("+")) {
			return "17+";
		} else if (threshold.includes("–") || threshold.includes("-")) {
			return threshold.replace("–", "-");
		}
		return threshold;
	}

	format (statblock) {
		return JSON.stringify(statblock, null, 2);
	}
}

export default DrawSteelTextAdapter;
