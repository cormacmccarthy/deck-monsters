/* eslint-disable max-len */

const CobraKaiScroll = require('./cobra-kai');
const { TARGET_LOWEST_HP_PLAYER_ACCORDING_TO_HANS } = require('../../helpers/targeting-strategies');
const { ALMOST_NOTHING } = require('../../helpers/costs');

class CobraKaiAccordingToCleverHansScroll extends CobraKaiScroll {
	// Set defaults for these values that can be overridden by the options passed in
	constructor ({
		icon = '👦'
	} = {}) {
		super({ icon });
	}

	getTargetingDetails (monster) { // eslint-disable-line class-methods-use-this
		return `Clever ${monster.givenName}'s mother told ${monster.pronouns.him} that ${monster.pronouns.he} should target the player with the lowest current xp while ${monster.pronouns.he} is in the ring unless directed otherwise by a specific card, and that's exactly what ${monster.pronouns.he}'ll do.`;
	}
}

CobraKaiAccordingToCleverHansScroll.notForSale = true;
CobraKaiAccordingToCleverHansScroll.cost = ALMOST_NOTHING;
CobraKaiAccordingToCleverHansScroll.itemType = 'The Way of the Cobra Kai According to Clever Hans';
CobraKaiAccordingToCleverHansScroll.targetingStrategy = TARGET_LOWEST_HP_PLAYER_ACCORDING_TO_HANS;
CobraKaiScroll.description = `We do not train to be merciful here. Mercy is for the weak. Here, in the streets, in competition: A man confronts you, he is the enemy. An enemy deserves no mercy.

Your mother told you to target the weakest player in the ring, every time, and that's exactly what you'll do.`;

module.exports = CobraKaiAccordingToCleverHansScroll;
