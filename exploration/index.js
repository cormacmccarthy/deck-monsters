/* eslint-disable max-len */

const BaseClass = require('../shared/baseClass');
const moment = require('moment');
const isProbable = require('../helpers/is-probable');
const pause = require('../helpers/pause');
const shuffle = require('lodash.shuffle');

const HazardCard = require('./discoveries/hazard');
const NothingCard = require('./discoveries/nothing');
const DeathCard = require('./discoveries/death');

const TheWorld = require('../monsters/environment');

const { ONE_MINUTE } = require('../helpers/delay-times');

class Exploration extends BaseClass {
	constructor (channelManager, { ...options } = {}, log) {
		super(options);

		this.log = log;
		this.channelManager = channelManager;

		this.startExplorationTimer();
	}

	get environment () {
		return this.options.environment;
	}

	set environment (environment) {
		return this.setOptions({
			environment
		});
	}

	get explorers () {
		return this.options.explorers || [];
	}

	set explorers (explorers) {
		return this.setOptions({
			explorers
		});
	}

	get discoveries () {
		return this.options.discoveries;
	}


	set discoveries (discoveries) {
		this.setOptions({
			discoveries
		});
	}

	getExplorer (targetMonster) {
		return this.explorers.find(explorer => explorer.monster === targetMonster);
	}

	monsterIsExploring (targetMonster) {
		return !!this.getExplorer(targetMonster);
	}

	sendMonsterExploring ({
		monster, character, channel, channelName
	}) {
		if (!this.monsterIsExploring(monster)) {
			const explorer = {
				monster,
				character,
				channel,
				channelName,
				startTime: moment(),
				returnTime: moment().add(10, 'seconds'),
				discoveries: []
			};

			this.explorers = [...this.explorers, explorer];

			this.emit('add', {
				explorer
			});

			this.channelManager.queueMessage({
				announce: `${monster.givenName} has gone exploring.

The Road goes ever on and on
Down from the town where it began.
Now far ahead the Road has gone,
And ${monster.givenName} must follow, if ${monster.pronouns.he} can,
Pursuing it with eager feet,
Until it joins some larger way
Where many treasures and fell beasts meet.
And whither then ${monster.pronouns.he} cannot say.`,
				channel,
				channelName
			});
		} else {
			const exploringMonster = this.getExplorer(monster);
			this.channelManager.queueMessage({
				announce: `Your monster is already exploring and will return at ${exploringMonster.returnTime.format('dddd, MMMM Do YYYY, h:mm:ss a')}`,
				channel,
				channelName
			});
		}
	}

	startExplorationTimer () {
		const exploration = this;

		pause.setTimeout(() => {
			exploration.doExploration();
			exploration.startExplorationTimer();
		}, ONE_MINUTE);
	}

	makeDiscovery (explorer) {
		let discoveries = shuffle(this.discoveries);

		if (explorer) {
			discoveries = discoveries.filter(discovery => explorer.monster.canHold(discovery));
		}

		const Discovery = discoveries.find(isProbable);

		if (!Discovery) return this.makeDiscovery(explorer);

		const discovery = new Discovery();
		// TODO: Look into this. I guess I'm partly wondering why you have look followed by play - for both cards and items we usually show the card or item as part of play/use. The pattern in items, while more complicated than you need for this, is a good starting place. https://github.com/deck-monsters/deck-monsters/blob/master/items/base.js#L60
		discovery.look(explorer.channel);
		discovery.play(this.environment, explorer.monster);

		return discovery;
	}

	doExploration () {
		this.explorers.forEach((explorer) => {
			const discovery = this.makeDiscovery(explorer);

			explorer.discoveries.push(discovery);

			if (explorer.monster.dead || explorer.discoveries.length >= 15 || moment() > explorer.returnTime) {
				this.sendMonsterHome(explorer);
			}
		});
	}

	sendMonsterHome (explorer) {
		if (this.monsterIsExploring(explorer.monster)) {
			const explorerIndex = this.explorers.indexOf(explorer);

			this.explorers.splice(explorerIndex, 1);

			const deadMessage = `${explorer.monster.givenName}'s carcase is wheeled home in a cart by a kindly stranger`;
			const aliveMessage = `${explorer.monster.givenName} has returned to nestle safely into your warm embrace.`;

			this.channelManager.queueMessage({
				announce: explorer.monster.dead ? deadMessage : aliveMessage,
				channel: explorer.channel,
				channelName: explorer.channelName
			});
		}
	}
}

Exploration.eventPrefix = 'exploration';
Exploration.defaults = {
	discoveries: [
		DeathCard,
		HazardCard,
		NothingCard
		// 'card',
		// 'monster',
		// 'coins',
		// 'xp',
		// 'item',
		// 'dungeon',
		// 'minion',
		// 'boss'
		// 'merchant',
		// 'thief',
		// 'restAndRecovery'
	],
	environment: new TheWorld()
};

module.exports = Exploration;
