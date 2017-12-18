/* eslint-disable max-len */

const EnthrallCard = require('./enthrall');
const ImmobilizeCard = require('./immobilize');

class EntranceCard extends EnthrallCard {
	// Set defaults for these values that can be overridden by the options passed in
	constructor ({
		attackModifier,
		hitOnFail,
		icon = '🎆',
		...rest
	} = {}) {
		super({ icon, ...rest });

		this.setOptions({
			attackModifier,
			hitOnFail
		});
	}
	get stats () { // eslint-disable-line class-methods-use-this
		const immobilize = new ImmobilizeCard();

		return `${immobilize.stats}
Chance to immobilize and damage your opponents with your painfully shocking beauty.`;
	}
}

EntranceCard.cardType = 'Entrance';
EntranceCard.probability = 20;
EntranceCard.level = 3;
EntranceCard.description = `You strut and preen. Your _painful_ beauty overwhelms and ${EntranceCard.actions[1]} everyone, except yourself.`;
EntranceCard.defaults = {
	...EnthrallCard.defaults,
	hitOnFail: true,
	doDamageOnImmobilize: true,
	freedomThresholdModifier: 2
};
EntranceCard.actions = ['entrance', 'entrances', 'entranced'];

EntranceCard.flavors = {
	hits: [
		[EntranceCard.actions[1], 80],
		['uses their painfully stunning natural beauty to bring falling to their knees in agonized worship', 30],
		[`${EntranceCard.actions[1]} even Narcissus himself with their beauty... And that's when they sucker punche`, 5]
	]
};

module.exports = EntranceCard;
