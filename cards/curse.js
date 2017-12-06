const BaseCard = require('./base');

class CurseCard extends BaseCard {
	// Set defaults for these values that can be overridden by the options passed in
	constructor ({
		curseAmount,
		icon = '😖',
		cursedProp = 'ac'
	} = {}) {
		super({ curseAmount, icon, cursedProp });

		this.defaults = {
			curseAmount: -1,
			cursedProp: 'ac'
		};
	}

	get curseAmount () {
		return this.options.curseAmount || this.defaults.curseAmount;
	}

	get cursedProp () {
		return this.options.cursedProp || this.defaults.cursedProp;
	}

	get stats () {
		return `Curse: ${this.cursedProp} ${this.curseAmount}`;
	}

	effect (player, target, ring) { // eslint-disable-line no-unused-vars
		return new Promise((resolve) => {
			target.setModifier(this.cursedProp, this.curseAmount);

			resolve(true);
		});
	}
}

CurseCard.cardType = 'Soften';
CurseCard.probability = 10;
CurseCard.description = 'Sweep the leg... You have a problem with that? No mercy.';
CurseCard.cost = 2;
CurseCard.level = 1;

module.exports = CurseCard;
