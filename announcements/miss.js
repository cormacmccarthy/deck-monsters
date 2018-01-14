const announceMiss = (publicChannel, channelManager, className, card, {
	attackResult, curseOfLoki, player, target
}) => {
	let action = 'is blocked by';
	let flavor = '';
	let icon = '🛡';

	if (curseOfLoki) {
		action = 'misses';
		flavor = 'horribly';
		icon = '💨';
	} else if (target.dead) {
		action = 'stops mercilessly beating the dead body of';
		icon = (player.gender === 'female') ? '🙇‍♀️' : '🙇‍♂️';
	} else if (attackResult > 5) {
		action = 'is barely blocked by';
		icon = '⚔️';
	}

	publicChannel({
		announce:
`${player.icon} ${icon} ${target.icon}    ${player.givenName} ${action} ${target.givenName} ${flavor}
`
	});
};

module.exports = announceMiss;
