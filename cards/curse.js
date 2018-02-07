const HitCard = require('./hit');

const { difference } = require('../helpers/difference');
const { roll, max } = require('../helpers/chance');
const { UNCOMMON } = require('../helpers/probabilities');
const { VERY_CHEAP } = require('../helpers/costs');

const STATS = require('../helpers/stat-constants');

class CurseCard extends HitCard {
	// Set defaults for these values that can be overridden by the options passed in
	constructor ({
		curseAmount,
		icon = '😖',
		cursedProp,
		hasChanceToHit,
		...rest
	} = {}) {
		super({ icon, ...rest });

		this.setOptions({
			hasChanceToHit,
			cursedProp,
			curseAmount
		});
	}

	get hasChanceToHit () {
		return this.options.hasChanceToHit;
	}

	set curseAmount (curseAmount) {
		this.setOptions({
			curseAmount
		});
	}

	get curseAmount () {
		return this.options.curseAmount;
	}

	get cursedProp () {
		return this.options.cursedProp;
	}

	get stats () {
		let stats = `Curse: ${this.cursedProp} ${this.curseAmount}
maximum total curse of -${STATS.MAX_PROP_MODIFICATIONS[this.cursedProp] * 3} per level, afterwards penalties come out of hp instead.`;

		if (this.hasChanceToHit) {
			stats = `${super.stats}
${stats}`;
		}

		return stats;
	}

	getCurseNarrative (player, target) { // eslint-disable-line class-methods-use-this
		const targetName = target.givenName === player.givenName ? `${player.pronouns.him}self` : target.givenName;
		return `${player.givenName} skillfully harries ${targetName} with a targetted sweeping blow intended to sting and distract.`;
	}

	getCurseOverflowNarrative (player, target) {
		const playerName = target.givenName === player.givenName ? player.pronouns.his : `${player.givenName}'s`;
		return `${target.givenName}'s ${this.cursedProp} penalties have been maxed out.
${playerName} harrying jab takes from hp instead.`;
	}

	getAttackRoll (player) {
		return roll({ primaryDice: this.attackDice, modifier: player.intModifier, bonusDice: player.bonusAttackDice, crit: true });
	}

	effect (player, target, ring) {
		const preCursedPropValue = target[this.cursedProp];
		let curseAmount = Math.abs(this.curseAmount);
		const postCursedPropValue = preCursedPropValue - curseAmount;
		const preBattlePropValue = target.getPreBattlePropValue(this.cursedProp);
		const aggregateTotalCurseAmount = difference(preBattlePropValue, postCursedPropValue);

		// If the target has already been cursed for the max amount, make the curse overflow into their HP
		const hpCurseOverflow = this.cursedProp !== 'hp' ? aggregateTotalCurseAmount - target.getMaxModifications(this.cursedProp) : 0;
		if (hpCurseOverflow > 0) {
			curseAmount -= hpCurseOverflow;

			this.emit('narration', {
				narration: this.getCurseOverflowNarrative(player, target)
			});
			target.hit(Math.min(hpCurseOverflow, max(this.damageDice)), player, this);
		}

		if (curseAmount > 0) {
			this.emit('narration', {
				narration: this.getCurseNarrative(player, target)
			});
			target.setModifier(this.cursedProp, -curseAmount);
		}

		if (this.hasChanceToHit) {
			return super.effect(player, target, ring);
		}
		return !target.dead;
	}
}

CurseCard.cardType = 'Soften';
CurseCard.probability = UNCOMMON.probability;
CurseCard.description = 'Sweep the leg... You have a problem with that? No mercy.';
CurseCard.level = 1;
CurseCard.cost = VERY_CHEAP.cost;

CurseCard.defaults = {
	...HitCard.defaults,
	curseAmount: -1,
	cursedProp: 'ac',
	hasChanceToHit: true,
	damageDice: '1d4'
};

module.exports = CurseCard;
