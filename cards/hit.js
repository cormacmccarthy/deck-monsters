const BaseCard = require('./base');
const { roll, max } = require('../helpers/chance');

class HitCard extends BaseCard {
	constructor (options) {
		// Set defaults for these values that can be overridden by the options passed in
		const defaultOptions = {
			attackDice: '1d20',
			damageDice: '1d6'
		};

		super(Object.assign(defaultOptions, options));
	}

	get attackDice () {
		return this.options.attackDice;
	}

	get damageDice () {
		return this.options.damageDice;
	}

	get stats () {
		return `Attack: ${this.attackDice} / Damage: ${this.damageDice}`;
	}

	effect (player, target, game) { // eslint-disable-line no-unused-vars
		// Add any player modifiers and roll the dice
		const attackRoll = roll({ primaryDice: this.attackDice, modifier: player.attackModifier, bonusDice: player.bonusAttackDice });
		const damageRoll = roll({ primaryDice: this.damageDice, modifier: player.damageModifier, bonusDice: player.bonusDamageDice });
		let strokeOfLuck = false;
		let curseOfLoki = false;
		let damageResult = damageRoll.result;

		if (attackRoll.naturalRoll.result === max(this.attackDice)) {
			strokeOfLuck = true;
			// change the natural roll into a max roll
			damageResult += (max(this.damageDice) * 2) - damageRoll.naturalRoll.result;
		} else if (attackRoll.naturalRoll.result === 1) {
			curseOfLoki = true;
		}

		this.emit('rolled', {
			attackResult: attackRoll.result,
			attackRoll,
			curseOfLoki,
			damageResult,
			damageRoll,
			player,
			strokeOfLuck,
			target
		});

		// Compare the attack roll to AC
		if (strokeOfLuck || (!curseOfLoki && target.ac <= attackRoll.result)) {
			// If we hit then do some damage
			target.hit(damageRoll, player);
		} else {
			this.emit('miss', {
				attackResult: attackRoll.result,
				attackRoll,
				curseOfLoki,
				damageResult,
				damageRoll,
				player,
				strokeOfLuck,
				target
			});
		}
	}
}

HitCard.cardType = 'Hit';
HitCard.probability = 80;
HitCard.description = 'A basic attack, the staple of all good monsters.';

module.exports = HitCard;
