/* eslint-disable max-len */

const BaseCard = require('./base');

class DeathCard extends BaseCard {
	// Set defaults for these values that can be overridden by the options passed in
	constructor ({
		icon = '💀'
	} = {}) {
		super({ icon });
	}

	get stats () {
		return this.flavor;
	}

	effect (player) { // eslint-disable-line no-unused-vars
		player.dead = true;

		return player;
	}
}

DeathCard.cardType = 'Death';
DeathCard.probability = 1;
DeathCard.description = 'It is dangerous out there...';

DeathCard.flavors = {
	hazard: [
		['Your monster mistakenly eats some green potatoes', 100]
	]
};

module.exports = DeathCard;
