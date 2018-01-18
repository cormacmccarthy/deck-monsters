/* eslint-disable max-len */
const BaseCard = require('./base');
const WhiskeyShotCard = require('./whiskey-shot');
const ScotchCard = require('./scotch');

const { BARD } = require('../helpers/classes');

const EFFECT_TYPE = 'BadBatchEffect';

class BadBatchCard extends BaseCard {
	// Set defaults for these values that can be overridden by the options passed in
	constructor ({
		icon = '🍻'
	} = {}) {
		super({ icon });
	}

	get targetCards () {
		return this.constructor.targetCards;
	}

	get stats () {
		return `The next ${this.targetCards.join(' or ')} played will poison rather than heal.`;
	}

	getTargets (player) { // eslint-disable-line class-methods-use-this
		return [player];
	}

	effect (badBatchPlayer, badBatchTarget, badBatchRing) {
		const badBatchEffect = ({
			card
		}) => {
			if (this.targetCards.includes(card.cardType)) {
				badBatchRing.encounterEffects = badBatchRing.encounterEffects.filter(encounterEffect => encounterEffect !== badBatchEffect);

				const { effect, getHealRoll } = card;

				if (effect && getHealRoll) {
					card.effect = (player, target) => {
						this.emit('narration', {
							narration: `${target.givenName} doesn't notice that the seal on ${target.pronouns.his} bottle has been tampered with.`
						});

						const healRoll = getHealRoll.call(card, player);

						this.emit('rolled', {
							reason: 'to measure out a shot of whiskey.',
							card: this,
							roll: healRoll,
							player,
							target,
							outcome: 'Poisoned!'
						});

						return target.hit(healRoll.result, badBatchTarget, this);
					};
				}
			}

			return card;
		};

		badBatchEffect.effectType = EFFECT_TYPE;

		badBatchRing.encounterEffects = [...badBatchRing.encounterEffects, badBatchEffect];

		this.emit('narration', {
			narration: `${badBatchTarget.identity} brews up a ${this.icon} bad batch of the strong drink.`
		});

		return true;
	}
}

BadBatchCard.cardType = 'Bad Batch';
BadBatchCard.permittedClassesAndTypes = [BARD];
BadBatchCard.targetCards = [WhiskeyShotCard.cardType, ScotchCard.cardType];
BadBatchCard.probability = 30;
BadBatchCard.description = 'Nothing like a little bathtub moonshine stored in sturdy lead jugs.';
BadBatchCard.level = 1;
BadBatchCard.cost = 30;
BadBatchCard.notForSale = true;

BadBatchCard.flavors = {
	hits: [
		['poisons', 80],
		['slips a mysterious liquid in the cup of', 60],
		['buys a round for', 60],
		['offers a drink to', 60],
		['"accidentally" gives lead poisoning to', 20],
		['pours acid straight down the throat of', 5]
	]
};

module.exports = BadBatchCard;