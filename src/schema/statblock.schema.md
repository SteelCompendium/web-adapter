# Draw Steel Statblock Schema

This document describes the JSON schema for Draw Steel statblocks, which represent creatures and NPCs in the game.

## Root Object

The root object represents a complete statblock with the following properties:

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `name` | string | Yes | - | The name of the creature |
| `level` | integer | No | 0 | The creature's level |
| `roles` | string[] | No | [] | Roles assigned to the creature (e.g., Boss, Minion) |
| `ancestry` | string[] | No | [] | Ancestries or types the creature belongs to (e.g., Human, Humanoid) |
| `ev` | string | No | "0" | Encounter Value (EV) of the creature |
| `stamina` | integer | No | 0 | The creature's max stamina |
| `immunities` | string[] | No | [] | List of immunities (e.g., Magic 2, Psionic 2) |
| `speed` | string | No | "" | Movement speed of the creature, may include parenthetical modifiers (e.g., '5 (climb)') |
| `size` | string | No | "" | Size category (e.g., 1M for medium) |
| `stability` | integer | No | 0 | Stability value of the creature |
| `free_strike` | integer | No | 0 | The free strike value |
| `might` | integer | No | 0 | Might modifier |
| `agility` | integer | No | 0 | Agility modifier |
| `reason` | integer | No | 0 | Reason modifier |
| `intuition` | integer | No | 0 | Intuition modifier |
| `presence` | integer | No | 0 | Presence modifier |
| `traits` | Trait[] | No | [] | Special traits of the creature |
| `abilities` | Ability[] | No | [] | List of abilities (see Ability schema) |

## Trait Object

A trait represents a special characteristic or feature of the creature.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | Yes | The name of the trait |
| `type` | string | No | Optional action-type of the trait (e.g., Maneuver) |
| `effects` | Effect[] | Yes | List of effects of the trait. See Ability schema for Effect types. |

## Example

```json
{
  "name": "GHOUL",
  "level": 1,
  "roles": ["HORDE", "HARRIER"],
  "ancestry": ["Undead"],
  "ev": "3",
  "stamina": 15,
  "speed": "7",
  "size": "1M",
  "stability": 0,
  "free_strike": 1,
  "might": 0,
  "agility": 2,
  "reason": -2,
  "intuition": 0,
  "presence": -1,
  "immunities": ["corruption 1", "poison 1"],
  "traits": [
    {
      "name": "Hunger",
      "effects": [
        "If the ghoul charges, their speed increases by 2 until the end of their turn."
      ]
    }
  ],
  "abilities": [
    {
      "name": "Razor Claws",
      "type": "Action",
      "keywords": ["Charge", "Melee", "Strike", "Weapon"],
      "effects": [
        {
          "roll": "2d10 + 2",
          "11 or lower": "3 damage",
          "12-16": "4 damage",
          "17+": "5 damage; M<2 bleeding (save ends)"
        }
      ],
      "cost": "Signature",
      "distance": "Melee 1",
      "target": "One creature or object"
    }
  ]
}
``` 