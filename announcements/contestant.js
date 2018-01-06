/* eslint-disable max-len */

const { monsterCard } = require('../helpers/card');
const { getFlavor } = require('../helpers/flavor');

const announceContestant = (publicChannel, channelManager, className, ring, { contestant }) => {
	const { character, monster } = contestant;

	publicChannel({
		announce:
`A${getFlavor('monsterAdjective')[0]} ${monster.creatureType} has entered the ring at the behest of ${character.icon}  ${character.givenName}.
${monsterCard(monster)}`
	});
};

module.exports = announceContestant;
