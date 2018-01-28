/* eslint-disable max-len */

const HitCard = require('./hit');

const { GLADIATOR, MINOTAUR, WEEPING_ANGEL } = require('../helpers/creature-types');
const { ATTACK_PHASE } = require('../helpers/phases');
const { roll } = require('../helpers/chance');
const { signedNumber } = require('../helpers/signed-number');
const { IMPOSSIBLE } = require('../helpers/probabilities');
const { FREE } = require('../helpers/costs');

class ImmobilizeCard extends HitCard {
	// Set defaults for these values that can be overridden by the options passed in
	constructor ({
		actions,
		dexModifier,
		doDamageOnImmobilize,
		icon = '😵',
		freedomSavingThrowTargetAttr,
		freedomThresholdModifier,
		ongoingDamage,
		strModifier,
		strongAgainstCreatureTypes,
		targetAttr,
		uselessAgainstCreatureTypes,
		weakAgainstCreatureTypes,
		...rest
	} = {}) {
		super({ icon, ...rest });

		this.setOptions({
			actions,
			dexModifier,
			doDamageOnImmobilize,
			freedomSavingThrowTargetAttr,
			freedomThresholdModifier,
			ongoingDamage,
			strModifier,
			strongAgainstCreatureTypes,
			targetAttr,
			uselessAgainstCreatureTypes,
			weakAgainstCreatureTypes
		});
	}

	get actions () {
		return this.options.actions;
	}

	get doDamageOnImmobilize () {
		return this.options.doDamageOnImmobilize;
	}

	get ongoingDamage () {
		return this.options.ongoingDamage;
	}

	get strongAgainstCreatureTypes () {
		return this.options.strongAgainstCreatureTypes || this.constructor.strongAgainstCreatureTypes;
	}

	set strongAgainstCreatureTypes (strongAgainstCreatureTypes) {
		this.setOptions({
			strongAgainstCreatureTypes
		});
	}

	get weakAgainstCreatureTypes () {
		return this.options.weakAgainstCreatureTypes || this.constructor.weakAgainstCreatureTypes;
	}

	set weakAgainstCreatureTypes (weakAgainstCreatureTypes) {
		this.setOptions({
			weakAgainstCreatureTypes
		});
	}

	get uselessAgainstCreatureTypes () {
		return this.options.uselessAgainstCreatureTypes || this.constructor.uselessAgainstCreatureTypes;
	}

	set uselessAgainstCreatureTypes (uselessAgainstCreatureTypes) {
		this.setOptions({
			uselessAgainstCreatureTypes
		});
	}

	get dexModifier () {
		return this.options.dexModifier;
	}

	set dexModifier (dexModifier) {
		this.setOptions({
			dexModifier
		});
	}

	get strModifier () {
		return this.options.strModifier;
	}

	getAttackModifier (target) {
		if (this.weakAgainstCreatureTypes.includes(target.name)) {
			return -this.dexModifier;
		} else if (this.strongAgainstCreatureTypes.includes(target.name)) {
			return this.dexModifier;
		}
		return 0;
	}

	get stats () {
		let strModifiers = '\n';
		if (this.strongAgainstCreatureTypes.length && this.getAttackModifier({ name: this.strongAgainstCreatureTypes[0] })) {
			const strongAgainst = this.strongAgainstCreatureTypes.join(', ');
			strModifiers += `\n${signedNumber(this.getAttackModifier({ name: this.strongAgainstCreatureTypes[0] }))} against ${strongAgainst}`;
		}

		if (this.weakAgainstCreatureTypes.length && this.getAttackModifier({ name: this.weakAgainstCreatureTypes[0] })) {
			const weakAgainst = this.weakAgainstCreatureTypes.join(', ');
			strModifiers += `\n${signedNumber(this.getAttackModifier({ name: this.weakAgainstCreatureTypes[0] }))} against ${weakAgainst}`;
		}

		if (this.uselessAgainstCreatureTypes.length) {
			const uselessAgainst = this.uselessAgainstCreatureTypes.join(', ');
			strModifiers += `\ninneffective against ${uselessAgainst}`;
		}

		return `${super.stats}${strModifiers}`;
	}

	get freedomThresholdModifier () {
		return this.options.freedomThresholdModifier;
	}

	set freedomThresholdModifier (freedomThresholdModifier) {
		this.setOptions({
			freedomThresholdModifier
		});
	}

	get freedomSavingThrowTargetAttr () { // eslint-disable-line class-methods-use-this
		return this.options.freedomSavingThrowTargetAttr;
	}

	set freedomSavingThrowTargetAttr (freedomSavingThrowTargetAttr) {
		this.setOptions({
			freedomSavingThrowTargetAttr
		});
	}

	getFreedomThresholdBase (player) { // eslint-disable-line class-methods-use-this
		return player[this.freedomSavingThrowTargetAttr];
	}

	freedomThresholdNarrative (player, target) {
		const thresholdBonusText = this.freedomThresholdModifier ? signedNumber(this.freedomThresholdModifier) : '';
		const targetName = player === target ? `${player.pronouns.his} own` : `${player.givenName}'s`;
		return `1d20 vs ${targetName} ${this.freedomSavingThrowTargetAttr}(${this.getFreedomThresholdBase(player)}${thresholdBonusText}) -(immobilized turns x 3)`;
	}

	emitImmobilizeNarrative (player, target) {
		const targetName = player === target ? `${player.pronouns.him}self` : target.givenName;
		let immobilizeNarrative = `
${player.givenName} ${this.icon} ${this.actions.IMMOBILIZES} ${targetName}.
at the beginning of ${target.givenName}'s turn ${target.pronouns.he} will roll ${this.freedomThresholdNarrative(player, target)} to attempt to break free.`;
		if (this.ongoingDamage > 0) {
			immobilizeNarrative += `takes ${this.ongoingDamage} damage per turn ${target.pronouns.he} is ${this.actions.IMMOBILIZED}`;
		}
		this.emit('narration', {
			narration: immobilizeNarrative
		});
	}

	getFreedomThreshold (player, target) {
		let fatigue = 0;
		if (target.encounterModifiers && target.encounterModifiers.immobilizedTurns) {
			fatigue = (target.encounterModifiers.immobilizedTurns * 3);
		}

		return (this.getFreedomThresholdBase(player) + this.freedomThresholdModifier) - fatigue;
	}

	getAttackRoll (player, target) {
		return roll({ primaryDice: this.attackDice, modifier: player.dexModifier + this.getAttackModifier(target), bonusDice: player.bonusAttackDice, crit: true });
	}

	get targetAttr () {
		return this.options.targetAttr;
	}

	set targetAttr (targetAttr) {
		this.setOptions({
			targetAttr
		});
	}

	getTargetPropValue (target) { // eslint-disable-line class-methods-use-this
		return target[this.targetAttr];
	}

	// Most of the time this should be an auto-success since they get a chance to break free on their next turn
	immobilizeCheck (player, target, ring, activeContestants) { // eslint-disable-line no-unused-vars, class-methods-use-this
		return true;
	}

	getImmobilizeEffect (player, target, ring) {
		const ImmobilizeEffect = ({ card, phase }) => {
			if (phase === ATTACK_PHASE) {
				if (!player.dead) {
					this.emit('effect', {
						effectResult: `${this.icon} ${this.actions.IMMOBILIZED} by`,
						player,
						target,
						ring
					});

					const freedomRoll = super.getAttackRoll(player, target);
					const { success, strokeOfLuck, curseOfLoki, tie } = this.checkSuccess(freedomRoll, this.getFreedomThreshold(player, target));
					let commentary;

					if (strokeOfLuck) {
						commentary = `${target.givenName} rolled a natural 20 and violently breaks free from ${player.givenName}.`;
					} else if (tie) {
						commentary = 'Miss... Tie goes to the defender.';
					}

					this.emit('rolled', {
						reason: `and needs ${this.getFreedomThreshold(player, target) + 1} or higher to break free.`,
						card: this,
						roll: freedomRoll,
						who: target,
						outcome: success ? commentary || `Success! ${target.givenName} is freed.` : commentary || `${target.givenName} remains ${this.actions.IMMOBILIZED} and will miss a turn.`,
						vs: this.getFreedomThreshold(player, target)
					});

					if (success) {
						target.encounterEffects = target.encounterEffects.filter(effect => effect.effectType !== 'ImmobilizeEffect');

						if (strokeOfLuck && target !== player) {
							player.hit(2, target, this);
						}
					} else {
						target.encounterModifiers.immobilizedTurns = (target.encounterModifiers.immobilizedTurns || 0) + 1;
						if (this.ongoingDamage > 0) {
							this.emit('narration', {
								narration: `${target.givenName} takes ongoing damage from being ${this.actions.IMMOBILIZED}`
							});
							target.hit(this.ongoingDamage, player, this);
						}

						card.play = () => Promise.resolve(true);
					}
				} else {
					target.encounterEffects = target.encounterEffects.filter(effect => effect.effectType !== 'ImmobilizeEffect');

					this.emit('narration', {
						narration: `${target.givenName} is no longer ${this.actions.IMMOBILIZED}. ${target.pronouns.he} pushes the limp dead body of ${player.givenName} off of ${target.pronouns.him}self and proudly stands prepared to fight`
					});
				}
			}

			return card;
		};

		return ImmobilizeEffect;
	}

	effect (player, target, ring, activeContestants) {
		const alreadyImmobilized = !!target.encounterEffects.find(effect => effect.effectType === 'ImmobilizeEffect');
		const canHaveEffect = !this.uselessAgainstCreatureTypes.includes(target.creatureType);

		if (alreadyImmobilized || !canHaveEffect) {
			let narration = '';
			if (alreadyImmobilized) {
				narration = `${target.givenName} is already immobilized, now _show no mercy_!`;// Use immobilize here, because it could be the result of ANY immobilization, not just "coil" or whatever is checking right now.
			} else {
				narration = `${target.givenName} laughs hautily as you try to ${this.actions.IMMOBILIZE} them, vent your fury at their mockery!`;
			}
			this.emit('narration', { narration });

			return super.effect(player, target, ring, activeContestants);
		}

		const attackSuccess = this.immobilizeCheck(player, target, ring, activeContestants);
		if (attackSuccess) {
			this.emitImmobilizeNarrative(player, target);

			const immobilizeEffect = this.getImmobilizeEffect(player, target, ring, activeContestants);
			immobilizeEffect.effectType = 'ImmobilizeEffect';
			target.encounterEffects = [...target.encounterEffects, immobilizeEffect];
			target.encounterModifiers.immobilizedTurns = 0;

			if (this.doDamageOnImmobilize) {
				return super.effect(player, target, ring, activeContestants);
			}

			return !target.dead;
		}

		// immobilize failed
		return !target.dead;
	}
}

ImmobilizeCard.cardType = 'Immobilize';
ImmobilizeCard.strongAgainstCreatureTypes = [GLADIATOR];// Very effective against these creatures
ImmobilizeCard.weakAgainstCreatureTypes = [MINOTAUR];// Less effective against (but will still hit) these creatures
ImmobilizeCard.uselessAgainstCreatureTypes = [WEEPING_ANGEL];// Immune to mobilization, will hit instead
ImmobilizeCard.probability = IMPOSSIBLE.probability; // This card is never intended to be played on it's own, but I need access to parts of it for card progressions, so it needs to be instantiatable.
ImmobilizeCard.description = 'Immobilize your adversary.';
ImmobilizeCard.level = 1;
ImmobilizeCard.cost = FREE.cost;

ImmobilizeCard.defaults = {
	...HitCard.defaults,
	dexModifier: 2,
	doDamageOnImmobilize: false,
	freedomSavingThrowTargetAttr: 'ac',
	freedomThresholdModifier: 2,
	ongoingDamage: 0,
	strModifier: 0,
	targetAttr: 'ac',
	actions: { IMMOBILIZE: 'immobilize', IMMOBILIZES: 'immobilizes', IMMOBILIZED: 'immobilized' }
};

ImmobilizeCard.flavors = {
	hits: [
		['stuns', 100]
	]
};

module.exports = ImmobilizeCard;
