const BaseCreature = require('../creatures/base');

const { monsterCard } = require('../helpers/card');

const DEFAULT_CARD_SLOTS = 7;

class BaseMonster extends BaseCreature {
	constructor (options) {
		super(options);

		if (this.name === BaseMonster.name) {
			throw new Error('The BaseMonster should not be instantiated directly!');
		}
	}

	get cards () {
		if (this.options.cards === undefined) this.cards = [];

		return this.options.cards || [];
	}

	set cards (cards) {
		this.setOptions({
			cards
		});
	}

	get cardSlots () {
		if (this.options.cardSlots === undefined) this.cardSlots = DEFAULT_CARD_SLOTS;
		if (this.options.cardSlots !== DEFAULT_CARD_SLOTS) this.cardSlots = DEFAULT_CARD_SLOTS; // enforce default for now
		const cardSlots = this.options.cardSlots || 0;

		return cardSlots;
	}

	set cardSlots (cardSlots) {
		this.setOptions({
			cardSlots
		});
	}

	look (channel) {
		return Promise
			.resolve()
			.then(() => channel({ announce: monsterCard(this, true) }));
	}
}

module.exports = BaseMonster;
