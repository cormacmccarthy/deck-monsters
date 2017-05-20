const BaseClass = require('../baseClass');

const { actionCard } = require('../helpers/card');
const { max } = require('../helpers/chance');

class BaseCard extends BaseClass {
	constructor (options) {
		super(options);

		if (this.name === BaseCard.name) {
			throw new Error('The BaseCard should not be instantiated directly!');
		}
	}

	get cardType () {
		return this.constructor.cardType;
	}

	get description () {
		return this.constructor.description;
	}

	get icon () {
		return this.options.icon;
	}

	get cost () {
		return this.constructor.cost;
	}

	get level () {
		return this.constructor.level;
	}

	get probability () {
		return this.constructor.probability;
	}

	checkSuccess (roll, targetNumber) { // eslint-disable-line class-methods-use-this
		let strokeOfLuck = false;
		let curseOfLoki = false;

		// Stroke of Luck
		if (roll.naturalRoll.result === max(roll.primaryDice)) {
			strokeOfLuck = true;
		} else if (roll.naturalRoll === 1) {
			curseOfLoki = true;
		}

		const success = !curseOfLoki && (strokeOfLuck || targetNumber < roll.result);

		return { success, strokeOfLuck, curseOfLoki };
	}

	play (player, target, ring) {
		this.emit('played', {
			player,
			target,
			ring
		});

		if (this.effect) {
			return this.effect(player, target, ring);
		}

		return true;
	}

	look (channel) {
		return Promise
			.resolve()
			.then(() => channel({
				announce: actionCard(this)
			}));
	}
}

BaseCard.eventPrefix = 'card';

module.exports = BaseCard;
