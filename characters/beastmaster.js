const moment = require('moment');
const some = require('lodash.some');

const BaseCharacter = require('./base');

const { BEASTMASTER } = require('../helpers/creature-types');
const { capitalize } = require('../helpers/capitalize');
const { getMonsterChoices } = require('../helpers/choices');
const { monsterCard } = require('../helpers/card');
const { spawn, equip } = require('../monsters');
const TENSE = require('../helpers/tense');
const transferItems = require('../items/helpers/transfer');

const DEFAULT_MONSTER_SLOTS = 7;

class Beastmaster extends BaseCharacter {
	constructor (options) {
		super({
			monsterSlots: DEFAULT_MONSTER_SLOTS,
			...options
		});
	}

	get monsters () {
		return this.options.monsters || [];
	}

	set monsters (monsters) {
		this.setOptions({
			monsters
		});
	}

	get monsterSlots () {
		if (!this.options.monsterSlots || this.options.monsterSlots < DEFAULT_MONSTER_SLOTS) {
			this.monsterSlots = DEFAULT_MONSTER_SLOTS;
		}

		return this.options.monsterSlots;
	}

	set monsterSlots (monsterSlots) {
		this.setOptions({
			monsterSlots
		});
	}

	canHoldCard (card) {
		if (this.monsters.length > 0) {
			return this.monsters.reduce((canHold, monster) => canHold || monster.canHoldCard(card), false);
		}

		return super.canHoldCard(card);
	}

	canHoldItem (item) {
		return super.canHoldItem(item) || this.monsters.reduce((canHold, monster) => canHold || monster.canHoldItem(item), false);
	}

	removeCard (cardToRemove) {
		const card = super.removeCard(cardToRemove);

		this.monsters.forEach(monster => monster.resetCards({ matchCard: card }));

		return card;
	}

	addMonster (monster) {
		this.monsters = [...this.monsters, monster];

		this.emit('monsterAdded', { monster });
	}

	dropMonster (monsterToBeDropped) {
		this.monsters = this.monsters.filter(monster => monster !== monsterToBeDropped);

		this.emit('monsterDropped', { monsterToBeDropped });
	}

	ownsMonster (monsterName) {
		return some(this.monsters, monster => (monster.givenName.toLowerCase() === monsterName.toLowerCase()));
	}

	spawnMonster (channel, options) {
		const remainingSlots = Math.max(this.monsterSlots - this.monsters.length, 0);

		if (remainingSlots > 0) {
			return Promise
				.resolve()
				.then(() => channel({
					announce: `You have ${remainingSlots} of ${this.monsterSlots} monsters left to train.`
				}))
				.then(() => spawn(channel, options))
				.then((monster) => {
					this.addMonster(monster);

					return Promise
						.resolve()
						.then(() => channel({
							announce: `You're now the proud owner of a ${monster.creatureType}. Before you is ${monsterCard(monster)}`
						}))
						.then(() => monster);
				});
		}

		return Promise.reject(channel({
			announce: "You're all out space for new monsters!"
		}));
	}

	chooseMonster ({
		channel, monsters = this.monsters, monsterName, action = 'pick', reason = 'you don\'t appear to have a monster by that name.'
	}) { // eslint-disable-line max-len
		return Promise
			.resolve(monsters.length)
			.then((numberOfMonsters) => {
				if (numberOfMonsters <= 0) {
					return Promise.reject(channel({
						announce: `You don't have any monsters to ${action}.`
					}));
				} else if (monsterName) {
					const monster = monsters.find(potentialMonster =>
						potentialMonster.givenName.toLowerCase() === monsterName.toLowerCase());

					if (monster) {
						return monster;
					}

					return Promise.reject(channel({
						announce: `${monsterName} is not able to be ${TENSE[action].PAST} right now, because ${reason}`
					}));
				} else if (numberOfMonsters === 1) {
					return monsters[0];
				}

				return Promise
					.resolve()
					.then(() => channel({
						question:
`You have ${numberOfMonsters} monsters:

${getMonsterChoices(monsters)}
Which monster would you like to ${action}?`,
						choices: Object.keys(monsters)
					}))
					.then(answer => monsters[answer]);
			});
	}

	equipMonster ({ monsterName, cardSelection, channel }) {
		const { monsters } = this;

		return Promise
			.resolve(monsters.length)
			.then((numberOfMonsters) => {
				if (numberOfMonsters <= 0) {
					return Promise.reject(channel({
						announce: "You don't have any monsters to equip! You'll need to spawn one first."
					}));
				}

				return this.chooseMonster({
					channel, monsters, monsterName, action: 'equip'
				});
			})
			.then(monster => equip({ deck: this.deck, monster, cardSelection, channel })
				.then(() => channel({
					announce: `${monster.givenName} is good to go!`
				})
					.then(() => monster)));
	}

	giveItemsToMonster ({ monsterName, itemSelection, channel }) {
		const { monsters } = this;

		return Promise
			.resolve(monsters.length)
			.then((numberOfMonsters) => {
				if (numberOfMonsters <= 0) {
					return Promise.reject(channel({
						announce: "You don't have any monsters to give items to! You'll need to spawn one first."
					}));
				}

				return this.chooseMonster({
					channel, monsters, monsterName, action: 'give items to'
				});
			})
			.then(monster => transferItems({ from: this, to: monster, itemSelection, channel })
				.then(() => monster));
	}

	takeItemsFromMonster ({ monsterName, itemSelection, channel }) {
		const { monsters } = this;

		return Promise
			.resolve(monsters.length)
			.then((numberOfMonsters) => {
				if (numberOfMonsters <= 0) {
					return Promise.reject(channel({
						announce: "You don't have any monsters to take items from! You'll need to spawn one first."
					}));
				}

				return this.chooseMonster({
					channel, monsters, monsterName, action: 'take items from'
				});
			})
			.then(monster => transferItems({ from: monster, to: this, itemSelection, channel })
				.then(() => monster));
	}

	callMonsterOutOfTheRing ({
		monsterName, ring, channel, channelName
	}) {
		const monsters = ring.getMonsters(this);

		if (monsters.length <= 0) {
			return Promise.reject(channel({
				announce: "It doesn't look like any of your monsters are in the ring right now."
			}));
		}

		return Promise
			.resolve()
			.then(() => this.chooseMonster({
				channel, monsters, monsterName, action: 'call from the ring', reason: 'they do not appear to be in the ring.'
			})) // eslint-disable-line max-len
			.then(monsterInRing => ring.removeMonster({
				monster: monsterInRing, character: this, channel, channelName
			}));
	}

	sendMonsterToTheRing ({
		monsterName, ring, channel, channelName
	}) {
		const character = this;
		const alreadyInRing = ring.contestants.filter(contestant => contestant.character === character);
		const monsters = this.monsters.filter(monster => !monster.dead);

		return Promise
			.resolve(monsters.length)
			.then((numberOfMonsters) => {
				// For now, each beastmaster can only have one monster in the ring at a time
				if (alreadyInRing && alreadyInRing.length > 0) {
					return Promise.reject(channel({
						announce: 'You already have a monster in the ring!'
					}));
				} else if (numberOfMonsters <= 0) {
					return Promise.reject(channel({
						announce: "You don't have any living monsters to send into battle. Spawn one first, or wait for your dead monsters to revive." // eslint-disable-line max-len
					}));
				}

				return this.chooseMonster({
					channel, monsters, monsterName, action: 'send into battle', reason: 'you don\'t appear to have a monster by that name.'
				});
			})
			.then((monster) => {
				if (monster.cards.length < monster.cardSlots) {
					return Promise.reject(channel({
						announce: 'Only an evil master would send their monster into battle with enough cards.'
					}));
				}

				return ring.addMonster({
					monster, character, channel, channelName
				});
			});
	}

	dismissMonster ({ monsterName, channel }) {
		const monsters = this.monsters.filter(monster => monster.dead);

		return Promise
			.resolve(monsters.length)
			.then((numberOfMonsters) => {
				if (numberOfMonsters <= 0) {
					return Promise.reject(channel({
						announce: "You don't have any monsters eligible for dismissal." // eslint-disable-line max-len
					}));
				}

				return this.chooseMonster({
					channel, monsters, monsterName, action: 'dismiss', reason: 'you don\'t appear to have a defeated monster by that name.'
				});
			})
			.then((monster) => {
				this.dropMonster(monster);

				return monster;
			})
			.then(monster => channel({
				announce: `${monster.givenName} has been dismissed from your pack.`
			})
				.then(() => monster));
	}

	reviveMonster ({ monsterName, channel }) {
		const monsters = this.monsters.filter(monster => (monster.dead && !monster.inEncounter));

		return Promise
			.resolve(monsters.length)
			.then((numberOfMonsters) => {
				if (numberOfMonsters <= 0) {
					return Promise.reject(channel({
						announce: "You don't have any monsters to revive." // eslint-disable-line max-len
					}));
				}

				return this.chooseMonster({
					channel, monsters, monsterName, action: 'revive', reason: 'you don\'t appear to have a defeated monster by that name.'
				});
			})
			.then((monster) => {
				const timeToRevive = monster.respawn();
				const reviveStatement = monster.respawnTimeoutLength ? moment(timeToRevive).from(monster.respawnTimeoutBegan) : 'instantly';

				return channel({
					announce: `${monster.givenName} has begun to revive. ${capitalize(monster.pronouns.he)} is a ${monster.displayLevel} monster, and therefore will be revived ${reviveStatement}.`// eslint-disable-line max-len
				})
					.then(() => monster);
			});
	}
}

Beastmaster.creatureType = BEASTMASTER;

module.exports = Beastmaster;
