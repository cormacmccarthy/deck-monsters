// A Battlefield

const prompt = require('prompt');
const { Game } = require('./index.js');

prompt.start();

const announcer = (prefix, what) => new Promise((resolve, reject) => {
	if (what.announce) {
		console.log(`${prefix} > ${what.announce}`); // eslint-disable-line no-console

		resolve(what);
	} else if (what.question) {
		const question = {
			description: `${prefix} > ${what.question}`,
			required: true
		};

		if (what.choices) {
			question.pattern = new RegExp(what.choices.join('|'), 'i');
		}

		prompt.get({ properties: { question } }, (err, result) => {
			if (err || !result.question) {
				reject(err);
			} else {
				resolve(result.question);
			}
		});
	} else {
		reject('Invalid arguments supplied to the channel');
	}
});

const roomAnnouncer = what => announcer('Room', what);
const slackdem = new Game(roomAnnouncer);

const vladAnnouncer = what => announcer('vlad', what);
const vlad = slackdem.getPlayer({ id: 1234, name: 'vlad' });
const vladCards = [...vlad.player.deck.slice(0, 2), vlad.player.deck[4]];

const charAnnouncer = what => announcer('charlemagne', what);
const char = slackdem.getPlayer({ id: 861, name: 'charlemagne' });
const charCards = [...char.player.deck.slice(0, 2), char.player.deck[4]];

Promise
	.resolve()
	.then(() => vlad.spawnMonster(vladAnnouncer, { type: 'basilisk', name: 'jerry', color: 'gray', gender: 'female', cards: vladCards }))
	.then(() => vlad.spawnMonster(vladAnnouncer, { type: 'basilisk', name: 'qed', color: 'gray', gender: 'androgynous', cards: vladCards }))
	.then(() => char.spawnMonster(charAnnouncer, { type: 'minotaur', name: 'tom', color: 'brown', gender: 'male', cards: charCards }))
	.then(() => char.spawnMonster(charAnnouncer, { type: 'weeping angel', name: 'dbb', color: 'brown', gender: 'male', cards: charCards }))
//	.then(() => vlad.spawnMonster(vladAnnouncer))
//	.then(() => char.spawnMonster(charAnnouncer))
	.then(() => vlad.equipMonster(vladAnnouncer))
	.then(() => char.equipMonster(charAnnouncer))
	.then(() => vlad.sendMonsterToTheRing(vladAnnouncer))
	.then(() => char.sendMonsterToTheRing(charAnnouncer));