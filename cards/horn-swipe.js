/* eslint-disable max-len */

const LuckyStrikeCard = require('./lucky-strike');

const { MINOTAUR } = require('../helpers/creature-types');

const { roll } = require('../helpers/chance');

class HornSwipeCard extends LuckyStrikeCard {
	constructor ({
		icon = '⾓', // This character means "horn"
		targetProp,
		...rest
	} = {}) {
		super({ targetProp, icon, ...rest });
	}

	// use strMod for some variety. Idea being it is less about precision and more about brute force. If they block the
	// first one you power through and stab with the second
	getAttackRoll (player) {
		return roll({ primaryDice: this.attackDice, modifier: player.getBonus('str'), bonusDice: player.bonusAttackDice, crit: true });
	}
}

HornSwipeCard.cardType = 'Horn Swipe';
HornSwipeCard.permittedClassesAndTypes = [MINOTAUR];
HornSwipeCard.description = 'Swing your horns at your opponent. If they block the first, maybe you\'ll power through and hit with the second out of sheer brute force.';
HornSwipeCard.defaults = {
	...LuckyStrikeCard.defaults,
	targetProp: 'str'
};

HornSwipeCard.flavors = {
	hits: [
		['rams a horn into', 80, '🐮'],
		['slams the side of a horn into', 70, '🐮'],
		['stabs with a horn', 50, '🐮'],
		['just barely catches, and rips a huge chunk out of, the arm of', 5, '🐮'],
		['bellows in rage and charges, swinging horns back and forth in a blind rage. The crowds winces as a sickening wet sucking plunging sound reverberates throughout the ring and a horn stabs all the way into', 1, '🐮']
	]
};

module.exports = HornSwipeCard;
