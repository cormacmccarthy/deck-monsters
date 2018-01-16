const { getChoices, getCreatureTypeChoices } = require('../../helpers/choices');
const PRONOUNS = require('../../helpers/pronouns');

const CREATURE_TYPES = require('../../helpers/creature-types');

const names = require('../../helpers/names');

const allMonsters = require('./all');

const genders = Object.keys(PRONOUNS);

// Spawn a new monster
module.exports = (channel, {
	type, name, color, gender, cards, game, xp
} = {}) => {
	const options = {};

	if (cards && cards.length > 0) {
		options.cards = cards;
	}

	if (xp && xp > 0) {
		options.xp = xp;
	}

	let monsterNames = [];
	if (game) {
		monsterNames = Object.keys(game.getAllMonstersLookup());
	}

	const askForCreatureType = () => Promise
		.resolve()
		.then(() => {
			if (type !== undefined) {
				return type;
			}

			return channel({
				question:
`Which type of monster would you like to spawn?

${getCreatureTypeChoices(allMonsters)}`,
				choices: Object.keys(allMonsters)
			});
		})
		.then((answer) => {
			const Monster = allMonsters[answer];

			return Monster;
		});

	const askForName = (Monster, alreadyTaken) => Promise
		.resolve()
		.then(() => {
			if (name !== undefined && !alreadyTaken) {
				return name;
			}

			let question = '';
			if (alreadyTaken) question += 'That name is already taken, please choose a different name. ';

			const name1 = names(Monster.creatureType.toLowerCase(), options.gender, monsterNames);
			const name2 = names(Monster.creatureType.toLowerCase(), options.gender, [ name1, ...monsterNames ]);

			question += `What would you like to name ${PRONOUNS[options.gender].him}? ${name1}? ${name2}? Something else?`;

			return channel({
				question
			});
		})
		.then((answer) => {
			if (monsterNames.includes(answer.toLowerCase())) {
				return askForName(Monster, true);
			}

			options.name = answer;
			return options;
		});

	const askForColor = () => Promise
		.resolve()
		.then(() => {
			if (color !== undefined) {
				return color;
			}

			let example;
			let descriptor;
			switch (Monster.creatureType.toLowerCase()) {
				case CREATURE_TYPES.BASILISK.toLowerCase():
					example = 'gold and black diamond patterned';
					descriptor = 'skin look like';
					break;
				case CREATURE_TYPES.MINOTAUR.toLowerCase():
					example = 'scarred, wrinkled, and beautifully auburn';
					descriptor = 'skin and hair look like';
					break;
				case CREATURE_TYPES.GLADIATOR.toLowerCase():
					example = 'tattered rags';
					descriptor = 'garments look like';
					break;
				case CREATURE_TYPES.WEEPING_ANGEL.toLowerCase():
					example = 'deceptively glorious';
					descriptor = 'raiment be';
					break;
				default:
					example = 'blue';
					descriptor = 'clothing look like'
			}

			return channel({
				question: `What should ${PRONOUNS[options.gender].his} ${descriptor}? (eg: ${example})`
			});
		})
		.then((answer) => {
			options.color = answer.toLowerCase();
			return options;
		});

	const askForGender = Monster => Promise
		.resolve()
		.then(() => {
			if (gender !== undefined) {
				return gender;
			}

			return channel({
				question:
`What gender should your ${Monster.creatureType.toLowerCase()} be?

${getChoices(genders)}`,
				choices: Object.keys(genders)
			});
		})
		.then((answer) => {
			options.gender = genders[answer].toLowerCase();
			return options;
		});

	let Monster;
	return Promise
		.resolve()
		.then(askForCreatureType)
		.then((Type) => {
			Monster = Type;

			return Monster;
		})
		.then(() => askForGender(Monster))
		.then(() => askForName(Monster))
		.then(askForColor)
		.then(() => new Monster(options));
};
