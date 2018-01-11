const Promise = require('bluebird');

const BaseItem = require('../items/base');

const { max } = require('../helpers/chance');

class BaseCard extends BaseItem {
	constructor (options) {
		super(options);

		if (this.name === BaseCard.name) {
			throw new Error('The BaseCard should not be instantiated directly!');
		}
	}

	get itemType () {
		return this.constructor.cardType;
	}

	get cardType () {
		return this.itemType;
	}

	checkSuccess (roll, targetNumber) { // eslint-disable-line class-methods-use-this
		let strokeOfLuck = false;
		let curseOfLoki = false;

		// Stroke of Luck
		if (roll.naturalRoll.result === max(roll.primaryDice)) {
			strokeOfLuck = true;
		} else if (roll.naturalRoll.result === 1) {
			curseOfLoki = true;
		}

		const success = !curseOfLoki && (strokeOfLuck || targetNumber < roll.result);

		return { success, strokeOfLuck, curseOfLoki };
	}

	getTargets (player, proposedTarget, area, activeContestants) { // eslint-disable-line class-methods-use-this, no-unused-vars
		return [proposedTarget];
	}

	play (player, proposedTarget, area, activeContestants) {
		return Promise.resolve()
			.then(() => {
				this.emit('played', { player });

				const targets = this.getTargets(player, proposedTarget, area, activeContestants);

				if (this.effect) {
					return Promise.map(targets, target => this.effect(player, target, area, activeContestants))
						.then(results => results.reduce((result, val) => result && val, true));
				}

				return Promise.resolve(true);
			});
	}
}

BaseCard.eventPrefix = 'card';

module.exports = BaseCard;
