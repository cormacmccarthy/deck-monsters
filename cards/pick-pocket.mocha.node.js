const { expect, sinon } = require('../shared/test-setup');
const { randomCharacter } = require('../characters');

const PickPocketCard = require('./pick-pocket');
const lodash = require('lodash');
const pause = require('../helpers/pause');

describe('./cards/pick-pocket.js', () => {
	let channelStub;
	let pauseStub;
	let shuffleSpy;

	before(() => {
		channelStub = sinon.stub();
		pauseStub = sinon.stub(pause, 'setTimeout');
		shuffleSpy = sinon.spy(lodash, 'shuffle');
	});

	beforeEach(() => {
		channelStub.resolves();
		pauseStub.callsArg(0);
	});

	afterEach(() => {
		channelStub.reset();
		pauseStub.reset();
		shuffleSpy.reset();
	});

	after(() => {
		lodash.shuffle.restore();
		pause.setTimeout.restore();
	});

	it('can be instantiated with defaults', () => {
		const pickPocket = new PickPocketCard();

		expect(pickPocket).to.be.an.instanceof(PickPocketCard);
	});

	it('finds the player with the higest xp', () => {
		const pickPocket = new PickPocketCard();

		const playerCharacter = randomCharacter();
		const player = playerCharacter.monsters[0];
		const target1Character = randomCharacter();
		const target1 = target1Character.monsters[0];
		const target2Character = randomCharacter();
		const target2 = target2Character.monsters[0];
		const target3Character = randomCharacter();
		const target3 = target3Character.monsters[0];

		const ring = {
			contestants: [
				{ monster: player },
				{ monster: target1 },
				{ monster: target2 },
				{ monster: target3 }
			],
			channelManager: {
				sendMessages: () => Promise.resolve()
			}
		};

		player.xp = 100;
		target1.xp = 200;
		target2.xp = 500;
		target3.xp = 300;

		return pickPocket
			.play(player, target1, ring, ring.contestants)
			.then(() => {
				expect(shuffleSpy).to.have.been.calledWith(target2.cards);
			});
	});

	it('cannot pick from own player\'s pocket', () => {
		const pickPocket = new PickPocketCard();

		const playerCharacter = randomCharacter();
		const player = playerCharacter.monsters[0];
		const target1Character = randomCharacter();
		const target1 = target1Character.monsters[0];
		const target2Character = randomCharacter();
		const target2 = target2Character.monsters[0];
		const target3Character = randomCharacter();
		const target3 = target3Character.monsters[0];

		const ring = {
			contestants: [
				{ monster: player },
				{ monster: target1 },
				{ monster: target2 },
				{ monster: target3 }
			],
			channelManager: {
				sendMessages: () => Promise.resolve()
			}
		};

		// player has most xp, but will not get picked
		player.xp = 500;
		target1.xp = 100;
		target2.xp = 200;
		target3.xp = 300;

		return pickPocket
			.play(player, target1, ring, ring.contestants)
			.then(() => {
				expect(shuffleSpy).to.have.been.calledWith(target3.cards);
			});
	});
});
