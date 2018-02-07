/* eslint-disable max-len */
const { expect, sinon } = require('../shared/test-setup');

const Jinn = require('../monsters/jinn');
const BadBatchCard = require('./bad-batch');
const ScotchCard = require('./scotch');
const HealCard = require('./heal');

describe('./cards/bad-batch.js', () => {
	let channelStub;

	before(() => {
		channelStub = sinon.stub();
	});

	beforeEach(() => {
		channelStub.resolves();
	});

	afterEach(() => {
		channelStub.reset();
	});

	it('can be instantiated with defaults', () => {
		const badBatch = new BadBatchCard();

		expect(badBatch).to.be.an.instanceof(BadBatchCard);
		expect(badBatch.flavors.hits).to.be.an('array');
		expect(badBatch.stats).to.equal('The next Whiskey Shot or Scotch played will poison rather than heal.');
	});

	it('can be played', () => {
		const badBatch = new BadBatchCard();

		const player = new Jinn({ name: 'player' });
		const target1 = new Jinn({ name: 'target1' });
		const target2 = new Jinn({ name: 'target2' });
		const ring = {
			encounterEffects: [],
			contestants: [
				{ monster: player },
				{ monster: target1 },
				{ monster: target2 }
			]
		};

		return badBatch
			.play(player, target1, ring, ring.contestants)
			.then((result) => {
				expect(result).to.equal(true);

				return expect(ring.encounterEffects.length).to.equal(1);
			});
	});

	it('has an effect', () => {
		const badBatch = new BadBatchCard();

		const player = new Jinn({ name: 'player' });
		const target1 = new Jinn({ name: 'target1' });
		const target2 = new Jinn({ name: 'target2' });
		const ring = {
			encounterEffects: [],
			contestants: [
				{ monster: player },
				{ monster: target1 },
				{ monster: target2 }
			]
		};

		const playerStartingHp = 5;
		const target1StartingHp = 5;
		const target2StartingHp = 5;

		player.hp = playerStartingHp;
		target1.hp = target1StartingHp;
		target2.hp = target2StartingHp;

		const scotch = new ScotchCard();

		const checkSuccessStub = sinon.stub(Object.getPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf(scotch))), 'checkSuccess');
		checkSuccessStub.returns({
			curseOfLoki: false,
			healRoll: {
				primaryDice: '2d6',
				bonusDice: undefined,
				result: 10,
				naturalRoll: { result: 10 },
				bonusResult: 0,
				modifier: 0,
				strokeOfLuck: false,
				curseOfLoki: false
			},
			result: 10,
			strokeOfLuck: false,
			success: true
		});

		expect(ring.encounterEffects.length).to.equal(0);

		return scotch
			.play(target1, player)
			.then(() => {
				// Scotch plays normally
				expect(target1.hp).to.be.above(target1StartingHp);
			})
			.then(() => badBatch.play(player, target1, ring, ring.contestants))
			.then(() => expect(ring.encounterEffects.length).to.equal(1))
			// Effect only activates when a Scotch or Whiskey Shot card is played
			.then(() => ring.encounterEffects[0]({ card: scotch }))
			.then(modifiedCard => modifiedCard.play(target2, player, ring, ring.contestants))
			.then(() => {
				// The whiskey turns to poison
				expect(target2.hp).to.be.below(target2StartingHp);

				// Effect cleans up after itself
				expect(ring.encounterEffects.length).to.equal(0);

				checkSuccessStub.restore();
			});
	});

	it('has no effect on other cards', () => {
		const badBatch = new BadBatchCard();

		const player = new Jinn({ name: 'player' });
		const target1 = new Jinn({ name: 'target1' });
		const target2 = new Jinn({ name: 'target2' });
		const ring = {
			encounterEffects: [],
			contestants: [
				{ monster: player },
				{ monster: target1 },
				{ monster: target2 }
			]
		};

		const playerStartingHp = 5;
		const target1StartingHp = 5;
		const target2StartingHp = 5;

		player.hp = playerStartingHp;
		target1.hp = target1StartingHp;
		target2.hp = target2StartingHp;

		const heal = new HealCard();

		expect(ring.encounterEffects.length).to.equal(0);

		return heal
			.play(target1, player)
			.then(() => {
				// Heal plays normally
				expect(target1.hp).to.be.above(target1StartingHp);
			})
			.then(() => badBatch.play(player, target1, ring, ring.contestants))
			.then(() => expect(ring.encounterEffects.length).to.equal(1))
			// Effect does not activate on a non-targeted card (heal card)
			.then(() => ring.encounterEffects[0]({ card: heal }))
			.then(modifiedCard => modifiedCard.play(target2, player, ring, ring.contestants))
			.then(() => {
				// The heal does not turn to poison
				expect(target2.hp).to.be.above(target2StartingHp);

				// Effect still hangs about
				expect(ring.encounterEffects.length).to.equal(1);
			});
	});

	it('can be held by Jinn', () => {
		const player = new Jinn({ name: 'player', xp: 300 });

		expect(player.canHold(BadBatchCard)).to.equal(true);
	});
});
