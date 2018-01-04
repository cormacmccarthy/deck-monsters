const { expect, sinon } = require('../shared/test-setup');

const Basilisk = require('../monsters/basilisk');
const Minotaur = require('../monsters/minotaur');
const Curse = require('./curse');
const Hit = require('./hit');
const pause = require('../helpers/pause');

describe('./cards/curse.js', () => {
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
		const curse = new Curse();
		const hit = new Hit({ damageDice: '1d4' });

		const stats = `${hit.stats}
Curse: ac -1`;

		expect(curse).to.be.an.instanceof(Curse);
		expect(curse.stats).to.equal(stats);
		expect(curse.hasChanceToHit).to.be.true;
		expect(curse.damageDice).to.equal('1d4');
		expect(curse.cursedProp).to.equal('ac');
		expect(curse.curseAmount).to.equal(-1);
	});

	it('can be instantiated with options', () => {
		const curse = new Curse({
			damageDice: '1d8', hasChanceToHit: false, cursedProp: 'hp', curseAmount: -2
		});

		expect(curse).to.be.an.instanceof(Curse);
		expect(curse.hasChanceToHit).to.be.false;
		expect(curse.damageDice).to.equal('1d8');
		expect(curse.cursedProp).to.equal('hp');
		expect(curse.curseAmount).to.equal(-2);
	});

	it('can change the curst amount when told to', () => {
		const curse = new Curse();
		const hit = new Hit({ damageDice: '1d4' });

		expect(curse.curseAmount).to.equal(-1);

		curse.curseAmount = -2;

		expect(curse.curseAmount).to.equal(-2);
	});

	it('curses and hits when appropriate', () => {
		const curse = new Curse();
		const checkSuccessStub = sinon.stub(Object.getPrototypeOf(Object.getPrototypeOf(curse)), 'checkSuccess');

		const player = new Minotaur({ name: 'player' });
		const target = new Basilisk({ name: 'target' });
		const beforeHP = target.hp;
		const beforeAC = target.ac;

		const ring = {
			contestants: [
				{ monster: player },
				{ monster: target }
			],
			channelManager: {
				sendMessages: () => Promise.resolve()
			}
		};

		checkSuccessStub.returns({ success: true, strokeOfLuck: false, curseOfLoki: false });

		return curse
			.play(player, target, ring, ring.contestants)
			.then(() => {
				checkSuccessStub.restore();

				expect(target.ac).to.be.below(beforeAC);
				return expect(target.hp).to.be.below(beforeHP);
			});
	});

	it('curses but does not hit when appropriate', () => {
		const curse = new Curse({ hasChanceToHit: false });
		const checkSuccessStub = sinon.stub(Object.getPrototypeOf(Object.getPrototypeOf(curse)), 'checkSuccess');

		const player = new Minotaur({ name: 'player' });
		const target = new Basilisk({ name: 'target' });
		const beforeHP = target.hp;
		const beforeAC = target.ac;

		const ring = {
			contestants: [
				{ monster: player },
				{ monster: target }
			],
			channelManager: {
				sendMessages: () => Promise.resolve()
			}
		};

		checkSuccessStub.returns({ success: true, strokeOfLuck: false, curseOfLoki: false });

		return curse
			.play(player, target, ring, ring.contestants)
			.then(() => {
				checkSuccessStub.restore();

				expect(target.ac).to.be.below(beforeAC);
				return expect(target.hp).to.equal(beforeHP);
			});
	});

	it('curses by less than max allowed', () => {
		const curse = new Curse({ hasChanceToHit: false, curseAmount: -1 });// max is 4
		const checkSuccessStub = sinon.stub(Object.getPrototypeOf(Object.getPrototypeOf(curse)), 'checkSuccess');

		const player = new Minotaur({ name: 'player' });
		const target = new Basilisk({ name: 'target', acVariance: 2, xp: 800 });// base AC(5) + variance(2 + 2 for basilisk) + Math.min(level(6), 12) = 15
		const originalTargetHP = target.hp;

		expect(target.ac).to.equal(15);

		const ring = {
			contestants: [
				{ monster: player },
				{ monster: target }
			],
			channelManager: {
				sendMessages: () => Promise.resolve()
			}
		};

		checkSuccessStub.returns({ success: true, strokeOfLuck: false, curseOfLoki: false });

		return curse
			.play(player, target, ring, ring.contestants)
			.then(() => {
				checkSuccessStub.restore();

				expect(target.hp).to.equal(originalTargetHP);
				return expect(target.ac).to.equal(14);// max ac modification is 4. original ac(15) - 4 is 11.
			});
	});

	it('curses by more than max and overflows into hp', () => {
		const curse = new Curse({ hasChanceToHit: false, curseAmount: -5 });// max is 4
		const checkSuccessStub = sinon.stub(Object.getPrototypeOf(Object.getPrototypeOf(curse)), 'checkSuccess');

		const player = new Minotaur({ name: 'player' });
		const target = new Basilisk({ name: 'target', acVariance: 2, xp: 800 });// base AC(5) + variance(2 + 2 for basilisk) + Math.min(level(6), 12) = 15
		const originalTargetHP = target.hp;

		expect(target.ac).to.equal(15);

		const ring = {
			contestants: [
				{ monster: player },
				{ monster: target }
			],
			channelManager: {
				sendMessages: () => Promise.resolve()
			}
		};

		checkSuccessStub.returns({ success: true, strokeOfLuck: false, curseOfLoki: false });

		return curse
			.play(player, target, ring, ring.contestants)
			.then(() => {
				checkSuccessStub.restore();

				expect(target.hp).to.equal(originalTargetHP - 1);
				return expect(target.ac).to.equal(11);// max ac modification is 4. original ac(15) - 4 is 11.
			});
	});

	it('multiple small curses that aggregate to more than max overflow into hp properly', () => {
		const curse = new Curse({ hasChanceToHit: false, curseAmount: -3 });// max is 4
		const checkSuccessStub = sinon.stub(Object.getPrototypeOf(Object.getPrototypeOf(curse)), 'checkSuccess');

		const player = new Minotaur({ name: 'player' });
		const target = new Basilisk({ name: 'target', acVariance: 2, xp: 800 });// base AC(5) + variance(2 + 2 for basilisk) + Math.min(level(6), 12) = 15
		const originalTargetHP = target.hp;

		expect(target.ac).to.equal(15);

		const ring = {
			contestants: [
				{ monster: player },
				{ monster: target }
			],
			channelManager: {
				sendMessages: () => Promise.resolve()
			}
		};

		checkSuccessStub.returns({ success: true, strokeOfLuck: false, curseOfLoki: false });

		return curse
			.play(player, target, ring, ring.contestants)
			.then(() => {
				checkSuccessStub.restore();

				expect(target.hp).to.equal(originalTargetHP);
				expect(target.ac).to.equal(12);// max ac modification is 4. original ac(15) - 3 is 12.

				return curse
					.play(player, target, ring, ring.contestants)
					.then(() => {
						checkSuccessStub.restore();

						expect(target.hp).to.equal(originalTargetHP - 2);
						expect(target.ac).to.equal(11);// max ac modification is 4. original ac(15) - 3 - 1 is 11.

						return curse
							.play(player, target, ring, ring.contestants)
							.then(() => {
								checkSuccessStub.restore();

								expect(target.hp).to.equal(originalTargetHP - 5);
								expect(target.ac).to.equal(11);// max ac modification is 4. original ac(15) - 3 - 1 is 11.

								return curse
									.play(player, target, ring, ring.contestants)
									.then(() => {
										checkSuccessStub.restore();

										expect(target.hp).to.equal(originalTargetHP - 8);
										return expect(target.ac).to.equal(11);// max ac modification is 4. original ac(15) - 3 - 1 is 11.
									});
							});
					});
			});
	});

	it('curses by huge amount do reasonable damage', () => {
		const curse = new Curse({ hasChanceToHit: false, curseAmount: -20 });
		const checkSuccessStub = sinon.stub(Object.getPrototypeOf(Object.getPrototypeOf(curse)), 'checkSuccess');

		const player = new Minotaur({ name: 'player' });
		const target = new Basilisk({ name: 'target', acVariance: 2, xp: 800 });// base AC(5) + variance(2 + 2 for basilisk) + Math.min(level(6), 12) = 15
		const originalTargetHP = target.hp;

		expect(target.ac).to.equal(15);

		const ring = {
			contestants: [
				{ monster: player },
				{ monster: target }
			],
			channelManager: {
				sendMessages: () => Promise.resolve()
			}
		};

		checkSuccessStub.returns({ success: true, strokeOfLuck: false, curseOfLoki: false });

		return curse
			.play(player, target, ring, ring.contestants)
			.then(() => {
				checkSuccessStub.restore();

				expect(target.hp).to.equal(originalTargetHP - 4);
				return expect(target.ac).to.equal(11);// max ac modification is 4. original ac(15) - 4 is 11.
			});
	});
});
