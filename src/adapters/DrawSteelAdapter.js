import BaseAdapter from "./BaseAdapter";

class DrawSteelAdapter extends BaseAdapter {
	getName() {
		return "Draw Steel Creature Statblock";
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

		// skip any blank lines
		while (idx < lines.length && !lines[idx]) idx++;

		// 2) Type / Subtype / EV - map to ancestry array
		const typeLine = lines[idx++];
		const typeMatch = /^(.*?)\s+EV\s+(.+)$/.exec(typeLine);
		if (typeMatch) {
			statblock.ancestry = typeMatch[1].split(/,/).map(s => s.trim()).filter(Boolean);
			statblock.ev = typeMatch[2].trim();
		} else {
			statblock.ancestry = typeLine.split(/,/).map(s => s.trim()).filter(Boolean);
			statblock.ev = "0";
		}

		// skip any blank lines
		while (idx < lines.length && !lines[idx]) idx++;

		// 3) Stamina
		const staminaLine = lines[idx++];
		const staminaMatch = /^Stamina\s+(\d+)/.exec(staminaLine);
		statblock.stamina = staminaMatch ? parseInt(staminaMatch[1], 10) : 0;

		const immunityMatch = /Immunity\s+([^/]+)/i.exec(staminaLine);
		if (immunityMatch) {
			statblock.immunities = immunityMatch[1].trim().split(/\s*,\s*/).map(s => s.trim());
		}

		const weaknessMatch = /Weakness\s+(.+)/i.exec(staminaLine);
		if (weaknessMatch) {
			statblock.weaknesses = weaknessMatch[1].trim().split(/\s*,\s*/).map(s => s.trim());
		}

		// skip any blank lines
		while (idx < lines.length && !lines[idx]) idx++;

		// 4) Speed / Size / Stability
		const speedLine = lines[idx++];
		const speedMatch = /^Speed\s+(\d+)(?:\s*\(([^)]+)\))?\s+Size\s+(.+?)\s*\/\s*Stability\s+(\d+)$/.exec(speedLine);
		if (speedMatch) {
			const baseSpeed = speedMatch[1];
			const speedExtra = speedMatch[2];
			if (speedExtra) {
				statblock.speed = `${baseSpeed} (${speedExtra})`;
			} else {
				statblock.speed = baseSpeed;
			}
			statblock.size = speedMatch[3].trim();
			statblock.stability = parseInt(speedMatch[4], 10);
		} else {
			statblock.speed = 0;
			statblock.size = "";
			statblock.stability = 0;
		}

		// skip any blank lines
		while (idx < lines.length && !lines[idx]) idx++;

		// 5) Free Strike
		const fsLine = lines[idx++];
		const fsMatch = /Free Strike\s+(\d+)/.exec(fsLine);
		statblock.free_strike = fsMatch ? parseInt(fsMatch[1], 10) : 0;

		const captainMatch = /With Captain\s+(.+?)(?=\s+Free Strike|$)/.exec(fsLine);
		if (captainMatch) {
			statblock.with_captain = captainMatch[1].trim();
		}

		// skip any blank lines
		while (idx < lines.length && !lines[idx]) idx++;

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
		statblock.traits = [];
		statblock.abilities = [];

		const isNewToken = (line) => {
			if (!line.trim()) return true; // blank line
			if (/^(.+?)\s+\((Main Action|Action|Maneuver|Free Triggered Action|Triggered Action|Villain Action\s*\d+)\)/.test(line)) return true;
			if (/^Keywords\s+/.test(line)) return true;
			if (/^Distance\s+/.test(line)) return true;
			if (/^[✦★✸]/.test(line)) return true;
			if (/^Effect\s+/.test(line)) return true;
			if (/^Trigger\s+/.test(line)) return true;
			if (/^\d+\+?\s+Malice/.test(line)) return true;
			// check for trait names (Title Case, ALL CAPS, or PascalCase)
			const articles = ["the", "of", "and", "a", "an", "in", "on", "at", "to", "for", "by", "with", "as", "but", "or", "nor", "so", "yet"];
			const words = line.split(" ");
			const isTitleCased = words.every(w => articles.includes(w.toLowerCase()) || (w.length > 0 && /^[A-Z]/.test(w)));
			if (isTitleCased) {
				const m = /^(.+?)\s+\((Main Action|Action|Maneuver|Free Triggered Action|Triggered Action|Villain Action\s*\d+)\)/.exec(line);
				return !m;
			}
			return false;
		};

		// 7) Actions & Maneuvers
		let current = null;
		const pushCurrent = () => {
			if (!current) return;

			// Create the ability object with properties in the desired order
			const ability = {
				name: current.name,
				type: this.mapActionTypeToAbilityType(current.category),
			};

			if (current.cost) {
				ability.cost = current.cost;
			}

			ability.keywords = current.keywords;

			if (current.range) {
				ability.distance = current.range;
			}

			if (current.target) {
				ability.target = current.target;
			}

			if (current.trigger) {
				ability.trigger = current.trigger;
			}

			ability.effects = current.effects || [];

			statblock.abilities.push(ability);
			current = null;
		};

		while (idx < lines.length) {
			let line = lines[idx].trim();

			if (!line) {
				idx++;
				continue;
			}

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
					const rollRegex = /(\d+[dD]\d+)\s*\+\s*(\d+)/;
					const rollMatch = rollRegex.exec(details);
					if (rollMatch) {
						current.roll = { dice: rollMatch[1], bonus: parseInt(rollMatch[2], 10) };
						const remaining = details.replace(rollMatch[0], "").replace(/◆/g, "").trim();
						if (remaining) {
							current.cost = remaining;
						}
					} else {
						current.cost = details;
					}
				}
				idx++;
				continue;
			}

			// If a trait name is encountered while parsing an ability, finalize the ability and start trait parsing
			if (current && isNewToken(line) && !/^Keywords\s+/.test(line) && !/^Distance\s+/.test(line) && !/^[✦★✸]/.test(line) && !/^Effect\s+/.test(line) && !/^Trigger\s+/.test(line) && !/^\d+\+?\s+Malice/.test(line)) {
				pushCurrent();
				current = null;
				// Do not increment idx here; re-process this line as a trait
				continue;
			}

			// Keywords
			const kw = /^Keywords\s+(.+)$/.exec(line);
			if (kw && current) {
				current.keywords = kw[1].split(/\s*,\s*/).map(s => s.trim());
				idx++;
				continue;
			}

			// Distance & Target
			const dt = /^Distance\s+(.+?)\s+Target\s+(.+)$/.exec(line);
			if (dt && current) {
				current.range = dt[1].trim();
				current.target = dt[2].trim();
				idx++;
				continue;
			}

			// Outcomes: ✦ ★ ✸
			const out = /^([✦★✸])\s*(≤?\d+(?:–\d+)?|\d+\+?)\s+(.+)$/.exec(line);
			if (out && current) {
				let description = out[3].trim();
				let lookahead = idx + 1;
				while (lookahead < lines.length && lines[lookahead].trim() && !isNewToken(lines[lookahead])) {
					description += ` ${lines[lookahead++].trim()}`;
				}
				current.outcomes.push({
					symbol: out[1],
					threshold: out[2],
					description,
				});
				// If next line is not another outcome, push roll effect
				if (lookahead >= lines.length || !/^([✦★✸])\s*/.test(lines[lookahead])) {
					if (!current.roll && current.effects.length > 0) {
						const lastEffect = current.effects[current.effects.length - 1];
						if (typeof lastEffect === "string" && lastEffect.includes("test")) {
							const rollEffect = { roll: lastEffect };
							if (current.outcomes && current.outcomes.length > 0) {
								current.outcomes.forEach(o => {
									const tierKey = this.mapOutcomeToTierKey(o.symbol, o.threshold);
									rollEffect[tierKey] = o.description;
								});
							}
							current.effects[current.effects.length - 1] = rollEffect;
							current.outcomes = [];
						}
					} else if (current.roll) {
						const rollEffect = { roll: `${current.roll.dice} + ${current.roll.bonus}` };
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
				idx = lookahead;
				continue;
			}

			// Malice cost effect
			const malice = /^(\d+\+?\s+Malice)\s+(.+)$/.exec(line);
			if (malice && current) {
				let effectText = malice[2].trim();
				let lookahead = idx + 1;
				while (lookahead < lines.length && lines[lookahead].trim() && !isNewToken(lines[lookahead])) {
					effectText += ` ${lines[lookahead++].trim()}`;
				}
				const effect = {
					effect: effectText,
				};
				if (statblock.name === "WEREWOLF" || (current.cost && /malice/i.test(current.cost))) {
					effect.name = malice[1];
				} else {
					effect.cost = malice[1];
				}
				current.effects.push(effect);
				idx = lookahead;
				continue;
			}

			// Effect
			const ef = /^Effect\s+(.+)$/.exec(line);
			if (ef && current) {
				let effectText = ef[1].trim();
				let lookahead = idx + 1;
				while (lookahead < lines.length && lines[lookahead].trim() && !isNewToken(lines[lookahead])) {
					effectText += ` ${lines[lookahead++].trim()}`;
				}
				current.effects.push(effectText);

				// If the next line is a new token (trait or otherwise), finalize the current ability and let the main loop handle the next line
				if (lookahead < lines.length && isNewToken(lines[lookahead]) && !/^Keywords\s+/.test(lines[lookahead]) && !/^Distance\s+/.test(lines[lookahead]) && !/^[✦★✸]/.test(lines[lookahead]) && !/^Effect\s+/.test(lines[lookahead]) && !/^Trigger\s+/.test(lines[lookahead]) && !/^\d+\+?\s+Malice/.test(lines[lookahead])) {
					pushCurrent();
					current = null;
					idx = lookahead;
					continue;
				}
				idx = lookahead;
				continue;
			}

			// Trigger
			const tr = /^Trigger\s+(.+)$/.exec(line);
			if (tr && current) {
				current.trigger = tr[1].trim();
				let lookahead = idx + 1;
				while (lookahead < lines.length && !isNewToken(lines[lookahead])) {
					current.trigger += ` ${lines[lookahead++].trim()}`;
				}
				idx = lookahead;
				continue;
			}

			// Trait parsing (when not in an ability)
			if (!current && isNewToken(line)) {
				const traitName = line.trim();
				const effects = [];
				let lookahead = idx + 1;
				let currentUnnamedEffectLines = [];

				const flushUnnamedEffect = () => {
					if (currentUnnamedEffectLines.length > 0) {
						effects.push(currentUnnamedEffectLines.join(" "));
						currentUnnamedEffectLines = [];
					}
				};

				while (lookahead < lines.length && !isNewToken(lines[lookahead])) {
					const effectLine = lines[lookahead].trim();
					if (!effectLine) {
						lookahead++;
						continue;
					}

					const words = effectLine.split(" ");
					const articles = ["the", "of", "and", "a", "an", "in", "on", "at", "to", "for", "by", "with", "as", "but", "or", "nor", "so", "yet", "if", "when"];
					let titleCaseWords = 0;
					for (const word of words) {
						if (/^[A-Z]/.test(word) && !articles.includes(word.toLowerCase())) {
							titleCaseWords++;
						} else {
							break;
						}
					}

					if (titleCaseWords > 1 && titleCaseWords < words.length) {
						flushUnnamedEffect();
						const effectName = words.slice(0, titleCaseWords).join(" ");
						const description = words.slice(titleCaseWords).join(" ").trim();
						effects.push({ name: effectName, effect: description });
					} else {
						if (effects.length > 0 && typeof effects[effects.length - 1] === "object") {
							effects[effects.length - 1].effect += ` ${effectLine}`;
						} else {
							currentUnnamedEffectLines.push(effectLine);
						}
					}
					lookahead++;
				}
				flushUnnamedEffect();

				statblock.traits.push({
					name: traitName,
					effects,
				});
				idx = lookahead;
				continue;
			}

			// If we hit a blank line, push the current ability
			if (!line.trim()) {
				pushCurrent();
				current = null;
				idx++;
			}

			idx++;
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
		// if it's just a number, assume it's the highest tier (e.g. "17" becomes "17+")
		if (/^\d+$/.test(threshold)) {
			return `${threshold}+`;
		}
		return threshold;
	}

	format(statblock) {
		return JSON.stringify(statblock, null, 2);
	}
}

export default DrawSteelAdapter;
