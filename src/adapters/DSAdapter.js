import BaseAdapter from './BaseAdapter';

class DSAdapter extends BaseAdapter {
  getName() {
    return 'Dungeon Scum';
  }

  parse(text) {
    const lines = text.trim().split('\n').map(l => l.trim());
    const stat = {
      name: '',
      level: 1,
      type: '',
      traits: [],
      stats: {},
      speed: {},
      health: {},
      actions: []
    };

    // Header
    const header = lines.shift();
    const match = header.match(/^(.+?) LEVEL (\d+) (.+)$/i);
    if (match) {
      stat.name = match[1].trim();
      stat.level = parseInt(match[2]);
      stat.type = match[3].trim();
    }

    const statsMap = {
      Might: 'brawn',
      Agility: 'agility',
      Reason: 'smarts',
      Intuition: 'spirit',
      Presence: 'presence'
    };

    let currentAction = null;
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];

      if (line.startsWith('Stamina')) {
        stat.health.wounds = parseInt(line.match(/\d+/)[0]);
      } else if (line.startsWith('Speed')) {
        const m = line.match(/Speed (\d+)(?: \((\w+)\))?/);
        if (m) {
          stat.speed.pace = parseInt(m[1]);
          if (m[2]) stat.speed[m[2].toLowerCase()] = parseInt(m[1]);
        }
      } else if (line.startsWith('Free Strike')) {
        stat.traits.push({ name: 'Free Strike', text: line.replace('Free Strike', '').trim() });
      } else if (/Might|Agility|Reason|Intuition|Presence/.test(line)) {
        for (const [label, key] of Object.entries(statsMap)) {
          const m = line.match(new RegExp(`${label} ([−\-+]?\\d+)`));
          if (m) {
            stat.stats[key] = parseInt(m[1].replace('−', '-'));
          }
        }
      } else if (line.match(/.+ \((Main Action|Maneuver|Free Triggered Action|Villain Action \d)\)/)) {
        // Start new action
        if (currentAction) stat.actions.push(currentAction);
        const parts = line.split('◆')[0].trim();
        const [, name, type] = parts.match(/^(.+?) \((.+?)\)$/);
        currentAction = {
          name: name.trim(),
          type: type.toLowerCase(),
          text: ''
        };
      } else if (line.startsWith('End Effect')) {
        stat.traits.push({
          name: 'End Effect',
          text: lines.slice(i + 1).join(' ').trim()
        });
        break;
      } else if (currentAction && line) {
        currentAction.text += (currentAction.text ? ' ' : '') + line;
      }

      i++;
    }

    if (currentAction) stat.actions.push(currentAction);

    return stat;
  }

  format(statblock) {
    let output = `${statblock.name} LEVEL ${statblock.level} ${statblock.type}\n`;
    
    // Add health
    if (statblock.health?.wounds) {
      output += `Stamina ${statblock.health.wounds}\n`;
    }

    // Add speed
    if (statblock.speed?.pace) {
      output += `Speed ${statblock.speed.pace}`;
      const specialSpeeds = Object.entries(statblock.speed)
        .filter(([key]) => key !== 'pace')
        .map(([key, value]) => `(${key})`);
      if (specialSpeeds.length > 0) {
        output += ` ${specialSpeeds.join(', ')}`;
      }
      output += '\n';
    }

    // Add traits
    statblock.traits.forEach(trait => {
      if (trait.name === 'Free Strike') {
        output += `Free Strike ${trait.text}\n`;
      }
    });

    // Add stats
    const statsOrder = ['brawn', 'agility', 'smarts', 'spirit', 'presence'];
    const statsLabels = {
      brawn: 'Might',
      agility: 'Agility',
      smarts: 'Reason',
      spirit: 'Intuition',
      presence: 'Presence'
    };
    
    const statsLine = statsOrder
      .map(stat => `${statsLabels[stat]} ${statblock.stats[stat] >= 0 ? '+' : ''}${statblock.stats[stat]}`)
      .join(' ');
    output += statsLine + '\n\n';

    // Add actions
    statblock.actions.forEach(action => {
      output += `${action.name} (${action.type})\n`;
      output += action.text + '\n\n';
    });

    // Add end effect if present
    const endEffect = statblock.traits.find(t => t.name === 'End Effect');
    if (endEffect) {
      output += 'End Effect\n';
      output += endEffect.text;
    }

    return output;
  }
}

export default DSAdapter;
