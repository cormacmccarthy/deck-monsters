const reduce = require('lodash.reduce');
const startCase = require('lodash.startcase');

const { globalSemaphore } = require('./helpers/semaphore');
const BaseClass = require('./baseClass');
const Ring = require('./ring');
const { all: allCards, draw } = require('./cards');
const { all: allMonsters } = require('./monsters');
const { Player } = require('./players');

const { getFlavor } = require('./helpers/flavor');
const { formatCard } = require('./helpers/card');
const { XP_PER_VICTORY, XP_PER_DEFEAT } = require('./helpers/levels');

const noop = () => {};
const signedNumber = number => (number === 0 ? '' : ` ${(number > 0 ? `+${number}` : number.toString())}`);
const monsterWithHp = monster => `${monster.icon}  ${startCase(monster.givenName)} (${monster.hp} hp)`;

class Game extends BaseClass {
	constructor (publicChannel, options) {
		super(options, globalSemaphore);

		this.ring = new Ring();
		this.publicChannel = publicChannel;
		this.initializeEvents();

		const game = this;
		this.on('stateChange', () => this.saveState(game));

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

	get saveState () {
		return this.stateSaveFunc || noop;
	}

	set saveState (stateSaveFunc) {
		if (stateSaveFunc) {
			this.stateSaveFunc = game => stateSaveFunc(JSON.stringify(game));
		} else {
			this.stateSaveFunc = stateSaveFunc;
		}
	}

	initializeEvents () {
		// Initialize Messaging
		this.on('card.played', this.announceCard);
		this.on('card.rolling', this.announceRolling);
		this.on('card.rolled', this.announceRolled);
		this.on('card.miss', this.announceMiss);
		this.on('creature.hit', this.announceHit);
		this.on('creature.heal', this.announceHeal);
		this.on('creature.condition', this.announceCondition);
		this.on('creature.die', this.announceDeath);
		this.on('creature.leave', this.announceLeave);
		this.on('card.stay', this.announceStay);
		this.on('ring.add', this.announceContestant);
		this.on('ring.fight', this.announceFight);
		this.on('ring.turnBegin', this.announceTurnBegin);
		this.on('ring.endOfDeck', this.announceEndOfDeck);
		this.on('ring.roundComplete', this.announceNextRound);
		this.on('ring.fightConcludes', this.announceFightConcludes);

		// Manage Fights
		this.on('creature.win', this.handleWinner);
		this.on('creature.loss', this.handleLoser);
		this.on('ring.fightConcludes', this.clearRing);
	}

	/* eslint-disable max-len */
	announceCard (className, card, { player }) { // TO-DO: It's confusing that the "player" here is actually a monster because they are the player of the card
		const channel = this.publicChannel;

		const cardPlayed = formatCard({
			title: `${card.icon}  ${card.cardType}`,
			description: card.description,
			stats: card.stats
		});

		channel({
			announce:
`
${player.icon}  ${startCase(player.givenName)} lays down the following card:
${cardPlayed}`
		});
	}

	announceTurnBegin (className, ring, { contestant }) {
		const channel = this.publicChannel;
		const monster = contestant.monster;

		const monsterCard = formatCard({
			title: `${monster.icon}  ${monster.givenName}`,
			description: contestant.lastMonsterPlayed !== monster && monster.individualDescription,
			stats: monster.stats
		});

		contestant.lastMonsterPlayed = monster;
// TODO? contestant.player.icon == user's avatar
		channel({
			announce:
`
*It's ${startCase(contestant.player.givenName)}'s turn.*

${contestant.player.icon}  ${startCase(contestant.player.givenName)} plays the following monster:
${monsterCard}`
		});
	}

	announceEndOfDeck (className, ring, { contestant }) {
		const channel = this.publicChannel;
		const monster = contestant.monster;

		channel({
			announce:
`
${monster.icon}  ${startCase(monster.givenName)} is out of cards.
`
		});
	}

	announceNextRound (className, ring, { round }) {
		const channel = this.publicChannel;

		channel({
			announce:
`

🏁       round ${round} complete

###########################################
`
		});
	}

	announceDeath (className, monster, { assailant }) {
		const channel = this.publicChannel;

		channel({
			announce: `${monsterWithHp(monster)} is killed by ${monsterWithHp(assailant)}`
		});
	}

	announceLeave (className, monster, { assailant }) {
		const channel = this.publicChannel;

		channel({
			announce: `${monsterWithHp(monster)} flees from ${monsterWithHp(assailant)}`
		});
	}

	announceStay (className, monster, { player, target }) {
		const channel = this.publicChannel;

		channel({
			announce: `${monsterWithHp(player)} tries to flee from ${monsterWithHp(target)}, but fails!`
		});
	}

	announceRolling (className, monster, {
		reason,
		roll,
		player
	}) {
		const channel = this.publicChannel;

		let title = roll.primaryDice;
		if (roll.bonusDice) {
			title += signedNumber(roll.bonusDice);
		}
		if (roll.modifier) {
			title += signedNumber(roll.modifier);
		}

		channel({
			announce: `
🎲  ${player.icon}  ${startCase(player.givenName)} rolls ${title} ${reason}
`
		});
	}

	announceRolled (className, monster, {
		reason,
		card,
		roll,
		strokeOfLuck,
		curseOfLoki,
		player,
		outcome
	}) {
		const channel = this.publicChannel;

		let detail = '';
		if (card.result) {
			if (strokeOfLuck) {
				detail = `
    STROKE OF LUCK!!!!`;
			} else if (curseOfLoki) {
				detail = `
    Botched it.`;
			}
		}

		channel({
			announce: `${detail}
🎲  ${player.icon}  ${startCase(player.givenName)} rolled ${roll.result} (natural ${roll.naturalRoll.result}${signedNumber(roll.result - roll.naturalRoll.result)}) ${reason}
    ${outcome}
`
		});
	}

	announceCondition (className, monster, {
			amount,
			attr
		}) {
		const channel = this.publicChannel;

		let dir = 'increased';
		if (amount < 0) {
			dir = 'decreased';
		}

		channel({
			announce: `${monster.icon} ${startCase(monster.givenName)} ${dir} ${monster.pronouns[2]} ${attr} by ${amount}`
		});
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

		channel({
			announce: `${assailant.icon} ${icon} ${monster.icon}    ${startCase(assailant.givenName)} ${getFlavor('hits')} ${startCase(monster.givenName)} for ${damage} damage`
		});
	}

	announceHeal (className, monster, { amount }) {
		const channel = this.publicChannel;

		if (this.ring.monsterIsInRing(monster)) {
			channel({
				announce: `${monster.icon} 💊      ${startCase(monster.givenName)} heals ${amount} hp`
			});
		}
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

		channel({
			announce: `${player.icon} ${icon} ${target.icon}    ${startCase(player.givenName)} ${action} ${startCase(target.givenName)} ${flavor}`
		});
	}

	announceContestant (className, ring, { contestant }) {
		const channel = this.publicChannel;
		const monster = contestant.monster;
		const player = contestant.player;

		channel({
			announce: `${monsterWithHp(monster)} has entered the ring at the behest of ${startCase(player.givenName)}.
${monster.stats}

Upon closer inspection you see ${monster.individualDescription}`
		});
	}

	announceFight (className, ring, { contestants }) {
		const channel = this.publicChannel;

		channel({
			announce: contestants.map(contestant => monsterWithHp(contestant.monster)).join(' vs ')
		});
	}

	announceFightConcludes (className, game, { deaths, isDraw, rounds }) {
		const channel = this.publicChannel;

		channel({
			announce: `
The fight concluded ${isDraw ? 'in a draw' : `with ${deaths} dead`} afer ${rounds} ${rounds === 1 ? 'round' : 'rounds'}!
`
		});
	}
	/* eslint-enable max-len */

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

	getPlayer ({ id, name }, log = () => {}) {
		const game = this;
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
				return player.spawnMonster(channel, options || {})
					.catch(err => log(err));
			},
			equipMonster (channel, options) {
				return player.equipMonster(channel, options || {})
					.catch(err => log(err));
			},
			sendMonsterToTheRing (channel, options) {
				return player.sendMonsterToTheRing(ring, channel, options || {})
					.catch(err => log(err));
			},
			lookAtMonster (channel, monsterName) {
				return game.lookAtMonster(channel, monsterName)
					.catch(err => log(err));
			},
			lookAtCard (channel, cardName) {
				return game.lookAtCard(channel, cardName)
					.catch(err => log(err));
			}
		};
	}

	static getCardTypes () {
		return allCards.reduce((obj, Card) => {
			obj[Card.cardType.toLowerCase()] = Card;
			return obj;
		}, {});
	}

	static getMonsterTypes () {
		return allMonsters.reduce((obj, Monster) => {
			obj[Monster.monsterType.toLowerCase()] = Monster;
			return obj;
		}, {});
	}

	getAllMonsters () {
		return reduce(this.players, (obj, player) => {
			player.monsters.forEach((monster) => {
				obj[monster.givenName.toLowerCase()] = monster;
			});

			return obj;
		}, {});
	}

	lookAtMonster (channel, monsterName) {
		if (monsterName) {
			const monsters = this.getAllMonsters();
			const monster = monsters[monsterName.toLowerCase()];

			if (monster) return monster.look(channel);
		}

		return Promise.reject(channel({
			announce: `I can find no monster by the name of ${monsterName}.`
		}));
	}

	lookAtCard (channel, cardName) {
		if (cardName) {
			const cards = this.constructor.getCardTypes();
			const Card = cards[cardName.toLowerCase()];

			if (Card) {
				const card = new Card();
				return card.look(channel);
			}
		}

		return Promise.reject(channel({
			announce: `Sorry, we don't carry ${cardName} cards here.`
		}));
	}

	drawCard (options) {
		const card = draw(options);

		this.emit('cardDrawn', { card });

		return card;
	}
}

Game.eventPrefix = 'game';

module.exports = Game;
