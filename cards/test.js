/* eslint-disable max-len */

const BaseCard = require('./base');

class TestCard extends BaseCard {
	// Set defaults for these values that can be overridden by the options passed in
	constructor ({
		targets,
		icon = ''
	} = {}) {
		super({ icon });

		if (targets) {
			this.setOptions({
				targets
			});
		}
	}

	set targets (targets) {
		this.setOptions({
			targets
		});
	}

	get targets () {
		return this.options.targets;
	}

	getTargets (player, proposedTarget) {
		return this.targets || [proposedTarget];
	}

	effect (player, target, ring) { // eslint-disable-line no-unused-vars
		return new Promise((resolve) => {
			player.played = (player.played || 0) + 1;
			target.targeted = (target.targeted || 0) + 1;
			this.played = (this.played || 0) + 1;

			resolve(true);
		});
	}
}

TestCard.cardType = 'Test';
TestCard.probability = 100;
TestCard.description = 'For testing purposes only.';

module.exports = TestCard;
