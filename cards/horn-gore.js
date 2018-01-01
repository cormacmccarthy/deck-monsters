/* eslint-disable max-len */

/*
	Eventually this card will be replaced by whatever LuckyStrike turns into.
*/

const ImmobilizeCard = require('./immobilize');
const { MINOTAUR } = require('../helpers/classes');

const STARTING_FREEDOM_THRESHOLD_MODIFIER = -6;
const STARTING_ATTACK_MODIFIER = -6;

class HornGore extends ImmobilizeCard {
	// Set defaults for these values that can be overridden by the options passed in
	constructor ({
		damageDice,
		icon = '🐂',
		...rest
	} = {}) {
		super({ damageDice, icon, ...rest });
	}

	get stats () {
		return `attack twice (once with each horn). Very small chance to pin.
${super.stats}`;
	}

	getAttackModifier () {
		return this.attackModifier;
	}

	resetImmobilizeStrength () {
		this.freedomThresholdModifier = STARTING_FREEDOM_THRESHOLD_MODIFIER;
		this.attackModifier = STARTING_ATTACK_MODIFIER;
	}

	increaseImmobilizeStrength (ammount) {
		this.freedomThresholdModifier += ammount;
		this.attackModifier += ammount;
	}

	getCommentary (roll, player, target) { // eslint-disable-line class-methods-use-this
		let commentary;

		if (roll.strokeOfLuck) {
			commentary = `${player.givenName} rolled a natural 20. Automatic max damage.`;
		}

		if (roll.curseOfLoki) {
			const flavors = [
				`gouge ${player.pronouns[1]} eye`,
				`punch ${player.pronouns[1]} soft temple`,
				`kick ${player.pronouns[1]} jugular`,
				`shove a fist into each of ${player.pronouns[1]} nostrils and spread ${target.prounouns[1]} arms as wide as ${target.pronouns[0]} can`,
				`bite off ${player.pronouns[1]} ear`,
				`grab ${player.pronouns[1]} tongue and pull for all ${target.pronouns[0]}'s worth`
			];
			commentary = `${player.givenName} rolled a 1.
${target.givenName} manages to take the opportunity of such close proximity to ${player.givenName}'s face to ${flavors[Math.random() * flavors.length]}.`;
		}

		return commentary;
	}

	emitRoll (roll, success, player, target, hornNumber) {
		this.emit('rolling', {
			reason: `vs ${target.givenName}'s AC (${target.ac}) for horn ${hornNumber} to determine if gore was successful`,
			card: this,
			roll,
			player,
			target
		});

		const commentary = this.getCommentary(roll, player, target);

		this.emit('rolled', {
			reason: `vs AC (${target.ac}) for horn ${hornNumber}`,
			card: this,
			roll,
			player,
			target,
			outcome: success ? commentary || 'Hit!' : commentary || 'Miss...'
		});
	}

	hitCheck (player, target, hornNumber) {
		const attackRoll = this.getAttackRoll(player, target);
		const { success, strokeOfLuck, curseOfLoki } = this.checkSuccess(attackRoll, target.ac);

		this.emitRoll(attackRoll, success, player, target, hornNumber);

		return {
			attackRoll,
			success,
			strokeOfLuck,
			curseOfLoki
		};
	}

	gore (player, target, hornNumber) {
		const { attackRoll, success, strokeOfLuck, curseOfLoki } = this.hitCheck(player, target, hornNumber);

		if (success) {
			this.increaseImmobilizeStrength(2);
			player.attackModifier += 1;

			const damageRoll = this.rollForDamage(player, target, strokeOfLuck);

			// If we hit then do some damage
			target.hit(damageRoll.result, player, this);
		} else if (curseOfLoki) {
			// Our attack is now bouncing back against us
			this.hit(target, player);
		}

		return { attackRoll, success, strokeOfLuck, curseOfLoki };
	}

	effect (player, target, ring, activeContestants) { // eslint-disable-line no-unused-vars
		return new Promise((resolve) => {
			const originalAttackModifier = player.attackModifier;
			this.resetImmobilizeStrength();
			const horn1 = this.gore(player, target, 1);
			const horn2 = this.gore(player, target, 2);
			const chanceToImmobilize = horn1.success || horn2.success;

			player.attackModifier = originalAttackModifier;

			if (!player.dead && chanceToImmobilize) {
				if (target.dead) {
					resolve(false);
				}
				resolve(super.effect(player, target, ring, activeContestants));
			} else {
				this.emit('miss', {
					attackResult: Math.max(horn1.attackRoll.result, horn2.attackRoll.result),
					curseOfLoki: horn1.curseOfLoki || horn2.curseOfLoki,
					player,
					target
				});

				resolve(!target.dead);
			}
		});
	}
}

HornGore.cardType = 'Horn Gore';
HornGore.probability = 20;
HornGore.description = 'You think those horns are just there to look pretty? Think again...';
HornGore.cost = 6;
HornGore.level = 0;
HornGore.permittedClassesAndTypes = [MINOTAUR];
HornGore.defaults = {
	...ImmobilizeCard.defaults,
	damageDice: '1d4',
	hitOnFail: false,
	doDamageOnImmobilize: false,
	freedomThresholdModifier: STARTING_FREEDOM_THRESHOLD_MODIFIER,
	attackModifier: STARTING_ATTACK_MODIFIER
};

HornGore.flavors = {
	hits: [
		['gores', 80],
		['mercilessly juggles on their mighty horns', 70],
		['pokes relentlessly', 70],
		['impales', 50],
		['chases down gleefully, stomps on, and then wantonly drives their horns through', 5],
		['teaches the true meaning of "horny" to', 5]
	]
};

module.exports = HornGore;
