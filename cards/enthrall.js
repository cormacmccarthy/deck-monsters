/* eslint-disable max-len */

const ImmobilizeCard = require('./immobilize');

const {
	GLADIATOR, MINOTAUR, BASILISK, WEEPING_ANGEL
} = require('../helpers/creature-types');

class EnthrallCard extends ImmobilizeCard {
	// Set defaults for these values that can be overridden by the options passed in
	constructor ({
		attackModifier,
		hitOnFail,
		icon = '🎇',
		...rest
	} = {}) {
		super({ icon, ...rest });

		this.setOptions({
			attackModifier,
			hitOnFail
		});
	}
	get stats () { // eslint-disable-line class-methods-use-this
		return `${super.stats}
Chance to immobilize your opponents with your shocking beauty.`;
	}

	getFreedomThreshold () {
		return 10 + this.freedomThresholdModifier;
	}

	effect (player, target, ring, activeContestants) {
		return new Promise(resolve => resolve(Promise.all(activeContestants.map(({ monster }) => {
			if (monster !== player) {
				return super.effect(player, monster, ring, activeContestants);
			}

			return Promise.resolve();
		}))
			.then(() => !target.dead)));
	}
}

EnthrallCard.cardType = 'Enthrall';
EnthrallCard.level = 2;
EnthrallCard.strongAgainstCreatureTypes = [GLADIATOR, BASILISK];
EnthrallCard.probability = 30;
EnthrallCard.description = 'You strut and preen. Your beauty overwhelms and enthralls everyone, except yourself.';
EnthrallCard.permittedClassesAndTypes = [WEEPING_ANGEL];
EnthrallCard.weakAgainstCreatureTypes = [MINOTAUR, WEEPING_ANGEL];
EnthrallCard.uselessAgainstCreatureTypes = [];

EnthrallCard.action = ['enthrall', 'enthralls', 'enthralled'];

EnthrallCard.defaults = {
	...ImmobilizeCard.defaults,
	attackModifier: 2,
	hitOnFail: false,
	freedomThresholdModifier: 1
};

EnthrallCard.flavors = {
	hits: [
		['You enthrall your adversaries', 80],
		['Your natural beauty overwhelms your enemies', 30],
		['Narcisus himself would be distracted by your beauty... and that\'s when you hit.', 5]
	]
};

module.exports = EnthrallCard;
