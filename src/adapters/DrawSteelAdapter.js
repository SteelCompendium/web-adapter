import BaseAdapter from "./BaseAdapter";

class DrawSteelAdapter extends BaseAdapter {
	getName() {
		return "Draw Steel";
	}

	parse(text) {
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
		const typeMatch = /^([^,]+)(?:,\s*([^,]+))?\s+EV\s+(.+)$/.exec(typeLine);
		if (typeMatch) {
			statblock.ancestry = [typeMatch[1].trim()];
			if (typeMatch[2]) {
				statblock.ancestry.push(typeMatch[2].trim());
			}
			statblock.ev = typeMatch[3].trim();
		} else {
			statblock.ancestry = [];
			statblock.ev = 0;
		}

		// 3) Stamina
		const staminaLine = lines[idx++];
		const staminaMatch = /^Stamina\s+(\d+)/.exec(staminaLine);
		statblock.stamina = staminaMatch ? parseInt(staminaMatch[1], 10) : 0;

		const immunityMatch = /Immunity\s+(.+)$/i.exec(staminaLine);
		if (immunityMatch) {
			statblock.immunities = immunityMatch[1].split(/\s*,\s*/).map(s => s.trim());
		}

		// 4) Speed / Size / Stability
		const speedLine = lines[idx++];
		const speedMatch = /^Speed\s+(\d+)(?:\s*\(([^)]+)\))?\s+Size\s+(\S+)\s*\/\s*Stability\s+(\d+)$/.exec(speedLine);
		if (speedMatch) {
			const baseSpeed = speedMatch[1];
			const speedExtra = speedMatch[2];
			if (speedExtra) {
				statblock.speed = `${baseSpeed} (${speedExtra})`;
			} else {
				statblock.speed = baseSpeed;
			}
			statblock.size = speedMatch[3];
			statblock.stability = parseInt(speedMatch[4], 10);
		} else {
			statblock.speed = 0;
			statblock.size = "";
			statblock.stability = 0;
		}

		// 5) Free Strike
		const fsLine = lines[idx++];
		const fsMatch = /Free Strike\s+(\d+)/.exec(fsLine);
		statblock.free_strike = fsMatch ? parseInt(fsMatch[1], 10) : 0;

		const captainMatch = /With Captain\s+(.+?)(?=\s+Free Strike|$)/.exec(fsLine);
		if (captainMatch) {
			statblock.with_captain = captainMatch[1].trim();
		}

		// 6) Stats
		const statsLine = lines[idx++];
		const statsMatch = /^Might\s*([+-−]?\d+)\s+Agility\s*([+-−]?\d+)\s+Reason\s*([+-−]?\d+)\s+Intuition\s*([+-−]?\d+)\s+Presence\s*([+-−]?\d+)$/.exec(statsLine);
		if (statsMatch) {
			statblock.might = parseInt(statsMatch[1].replace("−", "-").replace("+", ""), 10);
			statblock.agility = parseInt(statsMatch[2].replace("−", "-").replace("+", ""), 10);
			statblock.reason = parseInt(statsMatch[3].replace("−", "-").replace("+", ""), 10);
			statblock.intuition = parseInt(statsMatch[4].replace("−", "-").replace("+", ""), 10);
			statblock.presence = parseInt(statsMatch[5].replace("−", "-").replace("+", ""), 10);
		} else {
			statblock.might = 0;
			statblock.agility = 0;
			statblock.reason = 0;
			statblock.intuition = 0;
			statblock.presence = 0;
		}

		// Initialize schema-compliant arrays
		if (!statblock.immunities) statblock.immunities = [];
		statblock.traits = [];
		statblock.abilities = [];

		const isNewToken = (line) => {
			if (!line.trim()) return true; // blank line
			if (/^(.+?)\s+\((Main Action|Maneuver|Free Triggered Action|Triggered Action|Villain Action\s*\d+)\)/.test(line)) return true;
			if (/^Keywords\s+/.test(line)) return true;
			if (/^Distance\s+/.test(line)) return true;
			if (/^[✦★✸]/.test(line)) return true;
			if (/^Effect\s+/.test(line)) return true;
			if (/^Trigger\s+/.test(line)) return true;
			if (/^End Effect/.test(line)) return true;
			if (/^\d+\+?\s+Malice/.test(line)) return true;
			// check for trait names (PascalCase, ALL CAPS, or Title Case)
			const words = line.split(" ");
			const isTitleCased = words.every(w => w.length > 0 && /^[A-Z]/.test(w));
			if (isTitleCased) {
				// but not if it's a multi-word line that looks like an effect
				if (words.length > 4) return false;
				const m = /^(.+?)\s+\((Main Action|Maneuver|Free Triggered Action|Triggered Action|Villain Action\s*\d+)\)/.exec(line);
				return !m;
			}
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
				effects: current.effects || [],
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

			statblock.abilities.push(ability);
			current = null;
		};

		while (idx < lines.length) {
			const line = lines[idx++].trim();
			if (!line) continue;

			// new action/maneuver header?
			const headerRe = /^(.+?)\s+\((Main Action|Action|Maneuver|Free Triggered Action|Triggered Action|Villain Action\s*\d+)\)(?:\s*◆\s*(.+))?$/;
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
					effects: [],
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

			if (!current) {
				// Potential trait
				const traitName = line.trim();
				let effect = "";
				while (idx < lines.length && lines[idx].trim() && !isNewToken(lines[idx])) {
					effect += (effect ? " " : "") + lines[idx++].trim();
				}

				if (effect) {
					statblock.traits.push({
						name: traitName,
						effect: effect,
					});
					continue;
				}
			}

			// if we have a current action, but we encounter a new token that is NOT a recognized action token,
			// then we should finalize the current action and re-process the line as a new token (e.g. trait)
			if (current && isNewToken(line)
				&& !/^Keywords\s+/.test(line)
				&& !/^Distance\s+/.test(line)
				&& !/^[✦★✸]/.test(line)
				&& !/^Effect\s+/.test(line)
				&& !/^Trigger\s+/.test(line)
				&& !/^End Effect/.test(line)
				&& !/^\d+\+?\s+Malice/.test(line)
			) {
				pushCurrent();
				idx--; // re-process this line
				continue;
			}

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
				// If next line is not another outcome, push roll effect
				if (idx >= lines.length || !/^([✦★✸])\s*/.test(lines[idx])) {
					// Check if we have a roll from the header or from a previous effect
					if (!current.roll && current.effects.length > 0) {
						const lastEffect = current.effects[current.effects.length - 1];
						if (typeof lastEffect === "string" && lastEffect.includes("test")) {
							// Create roll effect with the test description
							const rollEffect = {
								roll: lastEffect,
							};
							if (current.outcomes && current.outcomes.length > 0) {
								current.outcomes.forEach(o => {
									const tierKey = this.mapOutcomeToTierKey(o.symbol, o.threshold);
									rollEffect[tierKey] = o.description;
								});
							}
							// Replace the last effect with our roll effect
							current.effects[current.effects.length - 1] = rollEffect;
							current.outcomes = [];
						}
					} else if (current.roll) {
						const rollEffect = {
							roll: `${current.roll.dice} + ${current.roll.bonus}`,
						};
						if (current.outcomes && current.outcomes.length > 0) {
							current.outcomes.forEach(o => {
								const tierKey = this.mapOutcomeToTierKey(o.symbol, o.threshold);
								rollEffect[tierKey] = o.description;
							});
						}
						current.effects.push(rollEffect);
						current.outcomes = [];
					}
				}
				continue;
			}

			// Malice cost effect
			const malice = /^(\d+\+?\s+Malice)\s+(.+)$/.exec(line);
			if (malice) {
				let effectText = malice[2].trim();
				while (idx < lines.length && lines[idx].trim() && !isNewToken(lines[idx])) {
					effectText += ` ${lines[idx++].trim()}`;
				}
				current.effects.push({
					cost: malice[1],
					effect: effectText,
				});
				continue;
			}

			// Effect
			const ef = /^Effect\s+(.+)$/.exec(line);
			if (ef) {
				let effectText = ef[1].trim();
				while (idx < lines.length && lines[idx].trim() && !isNewToken(lines[idx])) {
					effectText += ` ${lines[idx++].trim()}`;
				}
				current.effects.push(effectText);
				continue;
			}

			// Trigger
			const tr = /^Trigger\s+(.+)$/.exec(line);
			if (tr) {
				current.trigger = tr[1].trim();
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

			if (!current && !isNewToken(line)) {
				// Potential trait name
				const traitName = line.trim();
				let effect = "";
				// The next line must be the effect
				if (idx < lines.length && !isNewToken(lines[idx])) {
					effect = lines[idx++].trim();
					// And any following lines that are not new tokens are part of the effect
					while (idx < lines.length && (lines[idx].startsWith(" ") || lines[idx].startsWith("\t") || !isNewToken(lines[idx]))) {
						effect += ` ${lines[idx++].trim()}`;
					}

					statblock.traits.push({
						name: traitName,
						effect: effect,
					});
				}
				continue;
			}

			// If we hit a blank line, push the current ability
			if (!line.trim()) {
				pushCurrent();
				current = null;
			}
		}

		// push the last action
		pushCurrent();

		return statblock;
	}

	/**
	 * Maps action category to ability type for schema compliance
	 */
	mapActionTypeToAbilityType(category) {
		if (category === "Main Action") return "Action";
		if (category === "Action") return "Action";
		if (category === "Maneuver") return "Maneuver";
		if (category === "Triggered Action") return "Triggered Action";
		if (category === "Free Triggered Action") return "Triggered Action";
		if (category.startsWith("Villain Action")) return category;
		return "Action";
	}

	/**
	 * Maps outcome symbols and thresholds to tier keys for power roll effects
	 */
	mapOutcomeToTierKey(symbol, threshold) {
		if (threshold.includes("≤")) {
			return "11 or lower";
		} else if (threshold.includes("+")) {
			return "17+";
		} else if (threshold.includes("–") || threshold.includes("-")) {
			return threshold.replace("–", "-");
		}
		return threshold;
	}

	format(statblock) {
		return JSON.stringify(statblock, null, 2);
	}
}

export default DrawSteelAdapter;
