const HitCard = require('./hit');
const HealCard = require('./heal');

const { FIGHTER } = require('../helpers/classes');
const { UNCOMMON } = require('../helpers/probabilities');
const { VERY_CHEAP } = require('../helpers/costs');

class SurvivalKnifeCard extends HitCard {
	// Set defaults for these values that can be overridden by the options passed in
	constructor ({
		icon = '🗡',
		...rest
	} = {}) {
		super({ icon, ...rest });

		this.healCard = new HealCard({ healthDice: this.damageDice });
	}

	get stats () {
		return `${super.stats}
- or, below 1/4 health -
${this.healCard.stats}`;
	}

	effect (player, target, ring, activeContestants) {
		if (player.hp < (player.bloodiedValue / 2)) {
			return this.healCard.effect(player, player, ring);
		}

		return super.effect(player, target, ring, activeContestants);
	}
}

SurvivalKnifeCard.cardType = 'Survival Knife';
SurvivalKnifeCard.probability = UNCOMMON.probability;
SurvivalKnifeCard.description = 'If times get too rough, stab yourself in the thigh and press the pommel for a Stimpak injection.';
SurvivalKnifeCard.permittedClassesAndTypes = [FIGHTER];
SurvivalKnifeCard.level = 1;
SurvivalKnifeCard.cost = VERY_CHEAP.cost;
SurvivalKnifeCard.notForSale = true;

SurvivalKnifeCard.defaults = {
	...HitCard.defaults,
	damageDice: '2d4'
};

module.exports = SurvivalKnifeCard;
