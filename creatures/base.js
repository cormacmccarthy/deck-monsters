const random = require('lodash.sample');
const startCase = require('lodash.startcase');

const BaseClass = require('../baseClass');
const { STARTING_XP, getLevel } = require('../helpers/levels');
const PRONOUNS = require('../helpers/pronouns');
const { signedNumber } = require('../helpers/signed-number');

const BASE_AC = 4;
const AC_VARIANCE = 3;
const BASE_HP = 20;
const HP_VARIANCE = 8;
const MAX_AC_BOOST = (BASE_AC * 2) + AC_VARIANCE;
const MAX_ATTACK_BOOST = 10;
const MAX_DAMAGE_BOOST = 6;
const MAX_HP_BOOST = (BASE_HP * 2) + HP_VARIANCE;
const TIME_TO_HEAL = 300000; // Five minutes per hp
const TIME_TO_RESURRECT = 1800000; // Half-hour per level

class BaseCreature extends BaseClass {
	constructor (options) {
		const defaultOptions = {
			gender: random(Object.keys(PRONOUNS))
		};

		super(Object.assign(defaultOptions, options));

		if (this.name === BaseCreature.name) {
			throw new Error('The BaseCreature should not be instantiated directly!');
		}

		this.healingInterval = setInterval(() => {
			if (this.hp < this.maxHp && !this.inEncounter) this.heal(1);
		}, TIME_TO_HEAL);

		this.DEFAULT_HP = Math.ceil(Math.random() * HP_VARIANCE) + BASE_HP;
		this.DEFAULT_AC = Math.ceil(Math.random() * AC_VARIANCE) + BASE_AC;
	}

	get icon () {
		return this.options.icon;
	}

	get givenName () {
		return startCase(this.options.name);
	}

	get identity () {
		return `${this.icon}  ${this.givenName}`;
	}

	get identityWithHp () {
		return `${this.identity} (${this.hp} hp)`;
	}

	get stats () {
		return `Level ${this.level}
XP: ${this.xp} | HP: ${this.hp}/${this.maxHp} | AC: ${this.ac}
${signedNumber(this.attackModifier)} to hit | ${signedNumber(this.damageModifier)} to damage`;
	}

	get rankings () {
		return `Battles fought: ${this.battles.total}
Battles won: ${this.battles.wins}`;
	}

	get individualDescription () {
		return this.options.description;
	}

	get gender () {
		return this.options.gender;
	}

	get pronouns () {
		return PRONOUNS[this.options.gender];
	}

	get battles () {
		if (this.options.battles === undefined) this.battles = { wins: 0, losses: 0, total: 0 };

		return this.options.battles || [];
	}

	set battles (battles) {
		this.setOptions({
			battles
		});
	}

	// TO-DO: We want to save this in the options, but we'll have to create a method for reviving after Slack restarts
	get dead () {
		// return this.options.dead || false;
		return this.isDead || false;
	}

	set dead (dead) {
		// this.setOptions({
		// 	dead
		// });
		this.isDead = dead;
	}

	get hp () {
		if (this.options.hp === undefined) this.hp = this.maxHp;

		return this.options.hp;
	}

	set hp (hp) {
		this.setOptions({
			hp
		});
	}

	get xp () {
		return this.options.xp || STARTING_XP;
	}

	set xp (xp) {
		this.setOptions({
			xp
		});
	}

	get conditions () {
		return this.options.conditions || {};
	}

	set conditions (conditions) {
		this.setOptions({
			conditions
		});
	}

	get level () {
		return getLevel(this.xp);
	}

	get ac () {
		let ac = this.options.ac || this.DEFAULT_AC;
		ac += Math.min(this.level, MAX_AC_BOOST); // +1 to AC per level up to the max
		ac += this.conditions.ac || 0;

		return ac;
	}

	get bonusAttackDice () {
		const boost = Math.min(this.level, MAX_ATTACK_BOOST);
		if (boost > 0) {
			return `${boost}d4`; // +1d4 per level up to the max
		}

		return undefined;
	}

	get attackModifier () {
		return this.options.attackModifier || 0;
	}

	// We don't have this right now
	// get bonusDamageDice () {
	// 	return undefined;
	// }

	get damageModifier () {
		let damageModifier = this.options.damageModifier || 0;

		const boost = Math.min(this.level, MAX_DAMAGE_BOOST);
		if (boost > 0) {
			damageModifier += boost; // +1 per level up to the max
		}

		return damageModifier;
	}

	get maxHp () {
		let maxHp = this.options.maxHp || this.DEFAULT_HP;
		maxHp += Math.min(this.level * 2, MAX_HP_BOOST); // Gain 2 hp per level up to the max

		return maxHp;
	}

	leaveCombat (assailant) {
		this.emit('leave', {
			assailant
		});

		return false;
	}

	hit (damage = 0, assailant) {
		const hp = this.hp - damage;
		const originalHP = this.hp;

		if (hp <= 0) {
			this.hp = 0;
		}

		this.hp = hp;

		this.emit('hit', {
			assailant,
			damage,
			hp,
			prevHp: originalHP
		});

		if (hp === 0) {
			return this.die(assailant);
		}

		return true;
	}

	heal (amount = 0) {
		const hp = this.hp + amount;
		const originalHP = this.hp;

		if (hp <= 0) {
			this.hp = 0;
		} else if (hp > this.maxHp) {
			this.hp = this.maxHp;
		} else {
			this.hp = hp;
		}

		this.emit('heal', {
			amount,
			hp,
			prevHp: originalHP
		});

		if (hp <= 0) {
			return this.die();
		}

		return true;
	}

	setCondition (attr, amount = 0) {
		const prevValue = this.conditions[attr] || 0;
		const conditions = Object.assign({}, this.conditions, {
			[attr]: prevValue + amount
		});

		this.conditions = conditions;

		this.emit('condition', {
			amount,
			attr,
			prevValue
		});
	}

	die (assailant) {
		this.emit('die', {
			assailant
		});

		this.hp = 0;
		this.dead = true;

		return false;
	}

	respawn () {
		if (!this.respawnTimeout) {
			// TO-DO: Possibly do some other checks for whether this monster should respawn
			const creature = this;

			this.respawnTimeout = setTimeout(() => {
				creature.dead = false;
				creature.respawnTimeout = undefined;

				creature.emit('respawn');
			}, this.level * TIME_TO_RESURRECT);
		}
	}

	addWin () {
		const battles = {
			wins: this.battles.wins + 1,
			losses: this.battles.losses,
			total: this.battles.total + 1
		};

		this.battles = battles;
	}

	addLoss () {
		const battles = {
			wins: this.battles.wins,
			losses: this.battles.losses + 1,
			total: this.battles.total + 1
		};

		this.battles = battles;
	}

	addDraw () {
		const battles = {
			wins: this.battles.wins,
			losses: this.battles.losses,
			total: this.battles.total + 1
		};

		this.battles = battles;
	}
}

BaseCreature.eventPrefix = 'creature';

module.exports = BaseCreature;
