const { describeLevels } = require('./levels');

const BASE_XP_PER_KILL = 10;
const BASE_XP_PER_KILLED_BY = 1;
const BASE_XP_PER_FLEEING = 2;
const BASE_XP_LAST_ONE_STANDING = 3;
const XP_PER_VICTORY = 10;
const XP_PER_DEFEAT = 1;
const STARTING_XP = 0;

const xpFormula = (levelDifference, base) =>
	// This formula calculates XP based on the following logarithmic function
	// -0.3x = log(y) where x is the level difference of the monsters
	Math.round(Math.pow(10, (-0.3 * levelDifference)) * base);


const calculateXP = (contestant, contestants) => {
	let gainedXP = 0;
	const { monster } = contestant;
	const killed = contestant.killed || [];
	const rounds = contestant.rounds || 1;
	let reasons = [];
	let xp;

	killed.forEach((opponentKilled) => {
		const { difference: levelDifference, description: levelDescription } = describeLevels(monster.level, opponentKilled.level);
		xp = xpFormula(levelDifference, BASE_XP_PER_KILL);

		reasons.push(`Gained ${xp > 0 ? xp : 'no'} XP for killing ${opponentKilled.givenName} (${levelDescription})`);

		gainedXP += xp;
	});

	if (contestant.killedBy) {
		if (contestant.killedBy !== contestant.monster) {
			const { difference: levelDifference, description: levelDescription } = describeLevels(monster.level, contestant.killedBy.level);
			xp = Math.min(xpFormula(levelDifference, BASE_XP_PER_KILLED_BY), BASE_XP_PER_KILLED_BY * rounds);

			reasons.push(`Gained ${xp > 0 ? xp : 'no'} XP for being killed by ${contestant.killedBy.givenName} (${levelDescription})`);

			gainedXP += xp;
		} else {
			reasons.push(`Gained no XP for being killed by ${contestant.monster.pronouns.him}self`);
		}
	} else {
		// XP for being the last monster standing or fleeing
		const levels = [monster.level];
		const opponents = [];
		contestants.forEach((opponent) => {
			if (opponent.monster !== monster) {
				levels.push(opponent.monster.level);
				opponents.push(opponent);
			}
		});

		const { description: levelDescription, difference: levelDifference } = describeLevels(...levels);

		const xpBase = contestant.fled ? BASE_XP_PER_FLEEING : BASE_XP_LAST_ONE_STANDING;
		xp = Math.min(xpFormula(levelDifference, xpBase), xpBase * rounds);

		const forText = contestant.fled ? 'fleeing' : 'being the last one standing';

		let levelText;
		if (opponents.length > 1) {
			levelText = `${contestants.length - 1} opponents at an ${levelDescription}`;
		} else {
			levelText = `${opponents[0].monster.givenName} (${levelDescription})`;
		}

		reasons.push(`Gained ${xp > 0 ? xp : 'no'} XP for ${forText} as a ${monster.displayLevel} monster lasting ${rounds} rounds in battle with ${levelText}`);// eslint-disable-line max-len

		gainedXP += xp;
	}

	reasons = reasons.join('\n');

	return { gainedXP, reasons };
};

module.exports = {
	BASE_XP_PER_KILL,
	BASE_XP_PER_KILLED_BY,
	BASE_XP_LAST_ONE_STANDING,
	XP_PER_VICTORY,
	XP_PER_DEFEAT,
	STARTING_XP,
	calculateXP,
	xpFormula
};
