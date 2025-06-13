import BaseAdapter from "./BaseAdapter";

class MarkdownAdapter extends BaseAdapter {
	getName() {
		return "Markdown";
	}

	// eslint-disable-next-line no-unused-vars
	parse(text) {
		throw new Error("Markdown adapter is output-only.");
	}

	format(statblock) {
		const lines = [];

		// Header
		const headerLines = [];
		const role = statblock.roles?.join(" ").toUpperCase() || "";
		headerLines.push(
			`| ${statblock.name} | LEVEL ${statblock.level} ${role} |`,
		);
		headerLines.push("|:---|---:|");
		headerLines.push(`| **${statblock.ancestry?.join(", ") || "Unknown"}** | **EV** ${statblock.ev} |`);

		// Stats
		const staminaLine = `**Stamina** ${statblock.stamina}`;
		let immunityLine = "";
		if (statblock.immunities && statblock.immunities.length > 0) {
			immunityLine = `**Immunity** ${statblock.immunities.join(", ")}`;
		}
		headerLines.push(`| ${staminaLine} | ${immunityLine} |`);

		const speedLine = `**Speed** ${statblock.speed}`;
		const rightColParts = [];
		if (statblock.size) {
			rightColParts.push(`**Size** ${statblock.size}`);
		}
		if (statblock.stability) {
			rightColParts.push(`**Stability** ${statblock.stability}`);
		}

		if (statblock.speed || rightColParts.length > 0) {
			headerLines.push(`| ${speedLine} | ${rightColParts.join(" ")} |`);
		}

		if (statblock.free_strike) {
			headerLines.push(`|   | **Free Strike** ${statblock.free_strike} |`);
		}
		lines.push(headerLines.join("\n"));
		lines.push("---");

		// Attributes
		const attributes = [
			`**Might** ${statblock.might}`,
			`**Agility** ${statblock.agility}`,
			`**Reason** ${statblock.reason}`,
			`**Intuition** ${statblock.intuition}`,
			`**Presence** ${statblock.presence}`,
		];
		lines.push(attributes.join(" &nbsp; "));
		lines.push("---");

		const formatEffects = (effects) => {
			if (!effects) return "";
			return effects.map(effect => {
				if (typeof effect === "string") {
					return effect;
				}
				if (effect.roll) {
					let effectText = `**${effect.roll}**`;
					if (effect["11 or lower"]) {
						effectText += `\n*   **◆ ≤11** ${effect["11 or lower"]}`;
					}
					if (effect["12-16"]) {
						effectText += `\n*   **★ 12-16** ${effect["12-16"]}`;
					}
					if (effect["17+"]) {
						effectText += `\n*   **✹ 17+** ${effect["17+"]}`;
					}
					return effectText;
				}
				if (effect.cost) {
					return `**${effect.cost}** ${effect.effect}`;
				}
				return "";
			}).join("\n");
		};

		// Abilities
		statblock.abilities?.forEach((ability) => {
			lines.push(`## ${ability.name} (${ability.type})`);
			if (ability.cost) {
				lines.push(`**Cost:** ${ability.cost}`);
			}
			if (ability.keywords?.length > 0) {
				lines.push(`**Keywords** ${ability.keywords.join(", ")}`);
			}
			if (ability.distance) {
				lines.push(`**Distance** ${ability.distance}`);
			}
			if (ability.target) {
				lines.push(`**Target** ${ability.target}`);
			}
			if (ability.trigger) {
				lines.push(`**Trigger** ${ability.trigger}`);
			}
			if (ability.effects) {
				lines.push(`**Effect** ${formatEffects(ability.effects)}`);
			}
			lines.push("---");
		});

		// Traits
		statblock.traits?.forEach((trait) => {
			lines.push(`## ${trait.name}`);
			if (trait.effect) {
				lines.push(`**Effect** ${trait.effect}`);
			}
			lines.push("---");
		});

		return lines.join("\n\n");
	}
}

export default MarkdownAdapter;