const reduce = require('lodash.reduce');

const { globalSemaphore } = require('./helpers/semaphore');
const BaseClass = require('./baseClass');
const Ring = require('./ring');
const { draw } = require('./cards');
const { all } = require('./monsters');
const { Player } = require('./players');

const { getFlavor } = require('./helpers/flavor');
const { XP_PER_VICTORY, XP_PER_DEFEAT } = require('./helpers/levels');

class Game extends BaseClass {
	constructor (publicChannel, options) {
		super(options, globalSemaphore);

		this.ring = new Ring();
		this.publicChannel = publicChannel;
		this.initializeEvents();

		this.emit('initialized');
	}

	get players () {
		if (this.options.players === undefined) this.players = {};

		return this.options.players || {};
	}

	set players (players) {
		this.setOptions({
			players
		});
	}

	initializeEvents () {
		// Initialize Messaging
		// TO-DO: Add messaging for rolls, fleeing, bonus cards, etc
		this.on('card.miss', this.announceMiss);
		this.on('creature.hit', this.announceHit);
		this.on('creature.heal', this.announceHeal);
		this.on('ring.fight', this.announceFight);
		this.on('ring.fightConcludes', this.announceFightConcludes);

		// Manage Fights
		this.on('creature.win', this.handleWinner);
		this.on('creature.loss', this.handleLoser);
		this.on('ring.fightConcludes', this.clearRing);
	}

	announceHit (className, monster, { assailant, damage }) {
		const channel = this.publicChannel;

		let icon = '🤜';
		if (damage >= 10) {
			icon = '🔥';
		} else if (damage >= 5) {
			icon = '🔪';
		} else if (damage === 1) {
			icon = '🏓';
		}

		/* eslint-disable max-len */
		channel({
			announce: `${assailant.icon}  ${icon} ${monster.icon}    ${assailant.givenName} ${getFlavor('hits')} ${monster.givenName} for ${damage} damage`
		});
		/* eslint-enable max-len */
	}

	announceHeal (className, monster, { amount }) {
		const channel = this.publicChannel;

		/* eslint-disable max-len */
		channel({
			announce: `${monster.icon} 💊       ${monster.givenName} heals ${amount} hp`
		});
		/* eslint-enable max-len */
	}

	announceMiss (className, card, { attackResult, curseOfLoki, player, target }) {
		const channel = this.publicChannel;

		let action = 'is blocked by';
		let flavor = '';
		let icon = '🛡';

		if (curseOfLoki) {
			action = 'misses';
			flavor = 'horribly';
			icon = '💨';
		} else if (attackResult > 5) {
			action = 'is barely blocked by';
			icon = '⚔️';
		}

		/* eslint-disable max-len */
		channel({
			announce: `${player.icon} ${icon}  ${target.icon}    ${player.givenName} ${action} ${target.givenName} ${flavor}`
		});
		/* eslint-enable max-len */
	}

	announceFight (className, ring, { contestants, rounds }) {
		const channel = this.publicChannel;
		const monsterA = contestants[0].monster;
		const monsterB = contestants[1].monster;

		channel({
			announce: `${monsterA.icon}  vs  ${monsterB.icon}`
		});
	}

	announceFightConcludes (className, game, { contestants, deadContestants, deaths, isDraw, rounds }) {
		const channel = this.publicChannel;
		const monsterA = contestants[0].monster;
		const monsterB = contestants[1].monster;

		channel({
			announce: `${monsterA.icon}  vs  ${monsterB.icon}    fight concludes`
		});
	}

	handleWinner (className, monster, { contestant }) {
		// Award XP draw a card, maybe kick off more events (that could be messaged)

		// Add XP to both the monster and the player in the case of victory
		contestant.monster.xp += XP_PER_VICTORY;
		contestant.player.xp += XP_PER_VICTORY;

		// Also draw a new card for the player
		const card = this.drawCard();
		contestant.player.addCard(card);
	}

	handleLoser (className, monster, { contestant }) {
		// Award XP, maybe kick off more events (that could be messaged)

		// The player still earns a small bit of XP in the case of defeat
		contestant.player.xp += XP_PER_DEFEAT;
	}

	clearRing () {
		this.ring.clearRing();
	}

	getPlayer ({ id, name }) {
		const ring = this.ring;
		let player = this.players[id];

		if (!player) {
			player = new Player({
				name
			});

			this.players[id] = player;

			this.emit('playerCreated', { player });
		}

		return {
			player,
			spawnMonster (channel, options) {
				return player.spawnMonster(channel, options || {});
			},
			equipMonster (channel, options) {
				return player.equipMonster(channel, options || {});
			},
			sendMonsterToTheRing (channel, options) {
				return player.sendMonsterToTheRing(ring, channel, options || {});
			}
		};
	}

	static getMonsterTypes () {
		return all.reduce((obj, Monster) => {
			obj[Monster.monsterType] = Monster;
			return obj;
		}, {});
	}

	getAllMonsters () {
		return reduce(this.players, (obj, player) => {
			player.monsters.forEach((monster) => {
				obj[monster.givenName] = monster;
			});

			return obj;
		}, {});
	}

	drawCard (options) {
		const card = draw(options);

		this.emit('cardDrawn', { card });

		return card;
	}
}

Game.eventPrefix = 'game';

module.exports = Game;
