const { expect, sinon } = require('../shared/test-setup');

const { randomCharacter } = require('../characters');
const KalevalaCard = require('./kalevala');
const pause = require('../helpers/pause');

describe('./cards/kalevala.js', () => {
	let channelStub;
	let pauseStub;

	before(() => {
		channelStub = sinon.stub();
		pauseStub = sinon.stub(pause, 'setTimeout');
	});

	beforeEach(() => {
		channelStub.resolves();
		pauseStub.callsArg(0);
	});

	afterEach(() => {
		channelStub.reset();
		pauseStub.reset();
	});

	after(() => {
		pause.setTimeout.restore();
	});

	it('can be instantiated with defaults', () => {
		const kalevala = new KalevalaCard();

		expect(kalevala).to.be.an.instanceof(KalevalaCard);
		expect(kalevala.stats).to.equal('Hit: 1d20 vs AC / Damage: 1d4');
		expect(kalevala.cardType).to.equal('The Kalevala (1d4)');
		expect(kalevala.icon).to.equal('🎻');
	});

	it('levels up the damage dice if a nat 20 is rolled', () => {
		const kalevala = new KalevalaCard();
		const hitCheckStub = sinon.stub(Object.getPrototypeOf(Object.getPrototypeOf(kalevala)), 'hitCheck');

		const playerCharacter = randomCharacter();
		const player = playerCharacter.monsters[0];
		const targetCharacter = randomCharacter();
		const target = targetCharacter.monsters[0];
		const before = target.hp;

		const ring = {
			contestants: [
				{ monster: player },
				{ monster: target }
			],
			channelManager: {
				sendMessages: () => Promise.resolve()
			}
		};

		expect(kalevala.damageDice).to.equal('1d4');
		expect(kalevala.cardType).to.equal('The Kalevala (1d4)');

		hitCheckStub.returns({
			attackRoll: {
				primaryDice: '1d20',
				bonusDice: undefined,
				result: 20,
				naturalRoll: {
					result: 20
				},
				bonusResult: 0,
				modifier: -1
			},
			success: true,
			strokeOfLuck: true,
			curseOfLoki: false
		});

		return kalevala
			.play(player, target, ring, ring.contestants)
			.then(() => {
				hitCheckStub.restore();
				expect(target.hp).to.be.below(before);
				return expect(kalevala.damageDice).to.equal('1d6');
			});
	});

	it('does not level up the damage dice if a nat 20 is not rolled', () => {
		const kalevala = new KalevalaCard();
		const hitCheckStub = sinon.stub(Object.getPrototypeOf(Object.getPrototypeOf(kalevala)), 'hitCheck');

		const playerCharacter = randomCharacter();
		const player = playerCharacter.monsters[0];
		const targetCharacter = randomCharacter();
		const target = targetCharacter.monsters[0];
		const before = target.hp;

		const ring = {
			contestants: [
				{ monster: player },
				{ monster: target }
			],
			channelManager: {
				sendMessages: () => Promise.resolve()
			}
		};

		expect(kalevala.damageDice).to.equal('1d4');
		expect(kalevala.cardType).to.equal('The Kalevala (1d4)');

		hitCheckStub.returns({
			attackRoll: {
				primaryDice: '1d20',
				bonusDice: undefined,
				result: 18,
				naturalRoll: {
					result: 19
				},
				bonusResult: 0,
				modifier: -1
			},
			success: true,
			strokeOfLuck: false,
			curseOfLoki: false
		});

		return kalevala
			.play(player, target, ring, ring.contestants)
			.then(() => {
				hitCheckStub.restore();
				expect(target.hp).to.be.below(before);
				return expect(kalevala.damageDice).to.equal('1d4');
			});
	});

	it('does not level up the damage dice if if a nat 20 is rolled and dice are at max', () => {
		const kalevala = new KalevalaCard({ damageDice: '2d8' });
		const hitCheckStub = sinon.stub(Object.getPrototypeOf(Object.getPrototypeOf(kalevala)), 'hitCheck');

		const playerCharacter = randomCharacter();
		const player = playerCharacter.monsters[0];
		const targetCharacter = randomCharacter();
		const target = targetCharacter.monsters[0];
		const before = target.hp;

		const ring = {
			contestants: [
				{ monster: player },
				{ monster: target }
			],
			channelManager: {
				sendMessages: () => Promise.resolve()
			}
		};

		expect(kalevala.damageDice).to.equal('2d8');
		expect(kalevala.cardType).to.equal('The Kalevala (2d8)');

		hitCheckStub.returns({
			attackRoll: {
				primaryDice: '1d20',
				bonusDice: undefined,
				result: 20,
				naturalRoll: {
					result: 20
				},
				bonusResult: 0,
				modifier: -1
			},
			success: true,
			strokeOfLuck: true,
			curseOfLoki: false
		});

		return kalevala
			.play(player, target, ring, ring.contestants)
			.then(() => {
				hitCheckStub.restore();
				expect(target.hp).to.be.below(before);
				return expect(kalevala.damageDice).to.equal('2d8');
			});
	});
});
