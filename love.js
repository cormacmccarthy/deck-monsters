// A Battlefield

const prompt = require('prompt');
const Game = require('./index.js');

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

const charAnnouncer = what => announcer('charlemagne', what);
const char = slackdem.getPlayer({ id: 861, name: 'charlemagne' });

Promise
	.resolve()
	.then(() => vlad.spawnMonster(vladAnnouncer))
	.then(() => char.spawnMonster(charAnnouncer));
