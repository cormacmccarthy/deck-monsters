/* eslint-disable max-len */

const HitCard = require('./hit');
const { roll } = require('../helpers/chance');

class LuckyStrike extends HitCard {
	constructor (options) {
		// Set defaults for these values that can be overridden by the options passed in
		const defaultOptions = {
			icon: '🚬'
		};

		super(Object.assign(defaultOptions, options));
	}

	rollForAttack (player) {
		const attackRoll1 = roll({ primaryDice: this.attackDice, modifier: player.attackModifier, bonusDice: player.bonusAttackDice });
		const attackRoll2 = roll({ primaryDice: this.attackDice, modifier: player.attackModifier, bonusDice: player.bonusAttackDice });

		if (attackRoll2.naturalRoll.result > attackRoll1.naturalRoll.result) {
			return attackRoll2;
		}

		return attackRoll1;
	}
}

LuckyStrike.cardType = 'Lucky Strike';
LuckyStrike.probability = 20;
LuckyStrike.description = 'Roll for attack twice, use the best roll to see if you hit.';

module.exports = LuckyStrike;
