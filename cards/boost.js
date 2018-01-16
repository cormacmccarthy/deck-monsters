const BaseCard = require('./base');

const { difference } = require('../helpers/difference');
const { getFlavor } = require('../helpers/flavor');

class BoostCard extends BaseCard {
	// Set defaults for these values that can be overridden by the options passed in
	constructor ({
		boostAmount,
		icon = '🆙',
		boostedProp
	} = {}) {
		super({ boostAmount, icon, boostedProp });
	}

	get boostAmount () {
		return this.options.boostAmount;
	}

	get boostedProp () {
		return this.options.boostedProp;
	}

	get stats () {
		return `Boost: ${this.boostedProp} +${this.boostAmount}`;
	}

	getTargets (player) { // eslint-disable-line class-methods-use-this
		return [player];
	}

	getBoostNarrative (player, target) { // eslint-disable-line class-methods-use-this
		const items = {
			str: [
				['pops some Ant nectar', 50],
				['eats some Mississippi Quantum Pie', 30],
				['drinks some beer', 60],
				['pops some Buffout', 50]
			],
			int: [
				['pops some Mentats', 50],
				['pops some Berry Mentats', 30],
				['puts on Button\'s wig', 10],
				['puts on Lincoln\'s hat', 10],
			],
			ac: [
				['pops some Buffout', 50],
				['drinks some Nuka-Cola Quantum', 60],
				['eats some Nukalurk meat', 40],
				['drinks some Jet', 30],
				['drinks some Ultrajet', 10]
			],
			dex: [
				['drinks some Fire ant nectar', 60],
				['puts on  Poplar\'s hood', 10],
				['wishes on the monkey\'s paw', 1]
			],
			hp: [
				['eats a red mushroom', 40],
				['absorbs a purple circle strangely floating in the air', 30],
				['eats a bowl of nazi guard dog food', 10],
				['steps on a red-cross med-pack', 10]
			]
		}

		const item = getFlavor(this.boostedProp, items);
		return `${player.givenName} ${item} and boosts their ${this.boostedProp}`;
	}

	getBoostOverflowNarrative (player, target) {
		return `${player.givenName}'s ${this.cursedProp} boosts have been maxed out. Boost will be granted to hp instead.`;
	}

	effect (player, target) {
		const preBoostedPropValue = target[this.boostedProp];
		let boostAmount = Math.abs(this.boostAmount);
		const postBoostedPropValue = preBoostedPropValue + boostAmount;
		const preBattlePropValue = target.getPreBattlePropValue(this.boostedProp);
		const aggregateTotalBoostAmount = difference(preBattlePropValue, postBoostedPropValue);

		// If the target has already been boosted for the max amount, make the boost overflow into their HP
		const hpBoostOverflow = this.boostedProp !== 'hp' ? aggregateTotalBoostAmount - target.getMaxModifications(this.boostedProp) : 0;
		if (hpBoostOverflow > 0) {
			boostAmount -= hpBoostOverflow;

			this.emit('narration', {
				narration: this.getBoostOverflowNarrative(player, target)
			});
			player.heal(hpBoostOverflow, player, this);
		}

		if (boostAmount > 0) {
			this.emit('narration', {
				narration: this.getBoostNarrative(player, target)
			});
			target.setModifier(this.boostedProp, boostAmount);
		}

		return true;
	}
}

BoostCard.cardType = 'Harden';
BoostCard.probability = 30;
BoostCard.description = "It's time to put on your big boy pants, and toughen up!";
BoostCard.level = 1;
BoostCard.cost = 10;

BoostCard.defaults = {
	boostAmount: 1,
	boostedProp: 'ac'
};

module.exports = BoostCard;
