const { expect, sinon } = require('../shared/test-setup');

const Hit = require('./hit');
const WeepingAngel = require('../monsters/weeping-angel');
const Basilisk = require('../monsters/basilisk');
const Minotaur = require('../monsters/minotaur');
const Gladiator = require('../monsters/gladiator');
const ForkedStick = require('./forked-stick');

const { BARD, FIGHTER, BARBARIAN } = require('../constants/creature-classes');
const { GLADIATOR, JINN, MINOTAUR, BASILISK } = require('../constants/creature-types');
const { ATTACK_PHASE } = require('../constants/phases');

describe('./cards/forked-stick.js', () => {
	it('can be instantiated with defaults', () => {
		const forkedStick = new ForkedStick();
		const hit = new Hit({ targetProp: forkedStick.targetProp, damageDice: forkedStick.damageDice });

		const stats = `Attempt to immobilize your opponent by pinning them between the branches of a forked stick.

Chance to immobilize: 1d20 vs str.
If already immobilized, hit instead.
${hit.stats}
 +2 advantage vs Basilisk, Gladiator
 -2 disadvantage vs Jinn, Minotaur
inneffective against Weeping Angel

Opponent breaks free by rolling 1d20 vs immobilizer's str +/- advantage/disadvantage - (turns immobilized * 3)
Hits immobilizer back on stroke of luck.
Turns immobilized resets on curse of loki.
`;

		expect(forkedStick).to.be.an.instanceof(ForkedStick);
		expect(forkedStick.freedomThresholdModifier).to.equal(2);
		expect(forkedStick.freedomSavingThrowTargetAttr).to.equal('str');
		expect(forkedStick.targetProp).to.equal('dex');
		expect(forkedStick.doDamageOnImmobilize).to.be.true;
		expect(forkedStick.damageDice).to.equal('1d4');
		expect(forkedStick.stats).to.equal(stats);
		expect(forkedStick.strongAgainstCreatureTypes).to.deep.equal([BASILISK, GLADIATOR]);
		expect(forkedStick.weakAgainstCreatureTypes).to.deep.equal([JINN, MINOTAUR]);
		expect(forkedStick.permittedClassesAndTypes).to.deep.equal([BARD, BARBARIAN, FIGHTER]);
	});

	it('can be instantiated with options', () => {
		const forkedStick = new ForkedStick({
			freedomThresholdModifier: 1, doDamageOnImmobilize: false
		});

		expect(forkedStick).to.be.an.instanceof(ForkedStick);
		expect(forkedStick.freedomThresholdModifier).to.equal(1);
		expect(forkedStick.doDamageOnImmobilize).to.be.false;
	});

	it('calculates freedom threshold correctly', () => {
		const forkedStick = new ForkedStick();
		const player = new Minotaur({ name: 'player' });

		expect(forkedStick.getFreedomThreshold(player, player)).to.equal(5);
	});

	it('can be played against gladiators for a bonus to attack', () => {
		const forkedStick = new ForkedStick();

		const player = new Minotaur({ name: 'player' });
		const target = new Gladiator({ name: 'target' });
		const atkRoll = forkedStick.getAttackRoll(player, target);
		const dmgRoll = forkedStick.getDamageRoll(player, target);

		expect(atkRoll.modifier).to.equal(player.dexModifier + 2);
		expect(dmgRoll.modifier).to.equal(player.strModifier);
	});

	it('can be played against basilisk for a bonus to attack', () => {
		const forkedStick = new ForkedStick();

		const player = new Minotaur({ name: 'player' });
		const target = new Basilisk({ name: 'target' });
		const atkRoll = forkedStick.getAttackRoll(player, target);
		const dmgRoll = forkedStick.getDamageRoll(player, target);

		expect(atkRoll.modifier).to.equal(player.dexModifier + 2);
		expect(dmgRoll.modifier).to.equal(player.strModifier);
	});

	it('can be played against minotaurs for a weakened attack', () => {
		const forkedStick = new ForkedStick();

		const player = new Gladiator({ name: 'player' });
		const target = new Minotaur({ name: 'target' });
		const atkRoll = forkedStick.getAttackRoll(player, target);
		const dmgRoll = forkedStick.getDamageRoll(player, target);

		expect(atkRoll.modifier).to.equal(player.dexModifier - 2);
		expect(dmgRoll.modifier).to.equal(player.strModifier);
	});

	it('can be played against weeping angel with no bonus/penalty', () => {
		const forkedStick = new ForkedStick();

		const target = new WeepingAngel({ name: 'player' });
		const player = new Gladiator({ name: 'target' });
		const dmgRoll = forkedStick.getDamageRoll(player, target);
		const atkRoll = forkedStick.getAttackRoll(player, target);

		expect(dmgRoll.modifier).to.equal(player.strModifier);
		expect(atkRoll.modifier).to.equal(player.dexModifier);
	});

	it('immobilizes basilisk on hit', () => {
		const forkedStick = new ForkedStick();
		const checkSuccessStub = sinon.stub(Object.getPrototypeOf(Object.getPrototypeOf(forkedStick)), 'checkSuccess');

		const player = new Minotaur({ name: 'player' });
		const target = new Basilisk({ name: 'target' });
		const before = target.hp;

		const ring = {
			contestants: [
				{ character: {}, monster: player },
				{ character: {}, monster: target }
			],
			channelManager: {
				sendMessages: () => Promise.resolve()
			}
		};

		checkSuccessStub.returns({ success: true, strokeOfLuck: false, curseOfLoki: false });

		return forkedStick
			.play(player, target, ring, ring.contestants)
			.then(() => {
				expect(target.hp).to.be.below(before);
				expect(target.encounterEffects[0].effectType).to.equal('ImmobilizeEffect');

				checkSuccessStub.returns({ success: false, strokeOfLuck: false, curseOfLoki: false });

				const hit = new Hit();
				return hit
					.play(target, player, ring, ring.contestants)
					.then(() => {
						checkSuccessStub.restore();

						return expect(target.encounterEffects[0].effectType).to.equal('ImmobilizeEffect');
					});
			});
	});

	it('do damage instead of immobilizing weeping angel on hit', () => {
		const forkedStick = new ForkedStick();
		const checkSuccessStub = sinon.stub(Object.getPrototypeOf(Object.getPrototypeOf(forkedStick)), 'checkSuccess');

		const player = new Minotaur({ name: 'player' });
		const target = new WeepingAngel({ name: 'target' });
		const before = target.hp;

		const ring = {
			contestants: [
				{ character: {}, monster: player },
				{ character: {}, monster: target }
			],
			channelManager: {
				sendMessages: () => Promise.resolve()
			}
		};

		checkSuccessStub.returns({ success: true, strokeOfLuck: false, curseOfLoki: false });

		return forkedStick
			.play(player, target, ring, ring.contestants)
			.then(() => {
				checkSuccessStub.restore();

				expect(target.hp).to.be.below(before);
				return expect(target.encounterEffects.length).to.equal(0);
			});
	});

	it('lowers freedomThreshold each turn a target is pinned', () => {
		const forkedStick = new ForkedStick();
		const checkSuccessStub = sinon.stub(Object.getPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf(forkedStick))), 'checkSuccess');// eslint-disable-line max-len

		const player = new Minotaur({ name: 'player', acVariance: 0 });
		const target = new Basilisk({ name: 'target', acVariance: 0 });

		const ring = {
			contestants: [
				{ character: {}, monster: player },
				{ character: {}, monster: target }
			],
			channelManager: {
				sendMessages: () => Promise.resolve()
			}
		};

		checkSuccessStub.returns({ success: true, strokeOfLuck: false, curseOfLoki: false });

		return forkedStick
			.play(player, target, ring, ring.contestants)
			.then(() => {
				expect(target.encounterEffects[0].effectType).to.equal('ImmobilizeEffect');

				checkSuccessStub.returns({ success: false, strokeOfLuck: false, curseOfLoki: false });

				expect(forkedStick.getFreedomThreshold(player, target)).to.equal(9);

				const card = target.encounterEffects.reduce((currentCard, effect) => {
					const modifiedCard = effect({
						activeContestants: [target, player],
						card: currentCard,
						phase: ATTACK_PHASE,
						player,
						ring,
						target
					});

					return modifiedCard || currentCard;
				}, new Hit());

				return card
					.play(target, player, ring, ring.contestants)
					.then(() => {
						expect(forkedStick.getFreedomThreshold(player, target)).to.equal(6);

						checkSuccessStub.restore();

						return expect(target.encounterEffects.length).to.equal(1);
					});
			});
	});

	it('allows immobilized opponents to break free', () => {
		const forkedStick = new ForkedStick();
		const checkSuccessStub = sinon.stub(Object.getPrototypeOf(Object.getPrototypeOf(forkedStick)), 'checkSuccess');

		const forkedStickProto = Object.getPrototypeOf(forkedStick);
		const immobilizeProto = Object.getPrototypeOf(forkedStickProto);
		const hitProto = Object.getPrototypeOf(immobilizeProto);
		const getAttackRollImmobilizeSpy = sinon.spy(immobilizeProto, 'getAttackRoll');
		const getImmobilizeRollImmobilizeSpy = sinon.spy(immobilizeProto, 'getImmobilizeRoll');
		const getFreedomRollImmobilizeSpy = sinon.spy(immobilizeProto, 'getFreedomRoll');
		const getAttackRollHitSpy = sinon.spy(hitProto, 'getAttackRoll');

		const player = new Minotaur({ name: 'player' });
		const target = new Basilisk({ name: 'target' });

		const ring = {
			contestants: [
				{ character: {}, monster: player },
				{ character: {}, monster: target }
			],
			channelManager: {
				sendMessages: () => Promise.resolve()
			}
		};

		checkSuccessStub.returns({ success: true, strokeOfLuck: false, curseOfLoki: false });

		return forkedStick
			.play(player, target, ring, ring.contestants)
			.then(() => {
				expect(target.encounterEffects[0].effectType).to.equal('ImmobilizeEffect');
				expect(getAttackRollImmobilizeSpy.callCount).to.equal(1);
				expect(getFreedomRollImmobilizeSpy.callCount).to.equal(0);
				expect(getImmobilizeRollImmobilizeSpy.callCount).to.equal(1);
				expect(getAttackRollHitSpy.callCount).to.equal(0);

				const card = target.encounterEffects.reduce((currentCard, effect) => {
					const modifiedCard = effect({
						activeContestants: [target, player],
						card: currentCard,
						phase: ATTACK_PHASE,
						player,
						ring,
						target
					});

					return modifiedCard || currentCard;
				}, new Hit());

				return card
					.play(target, player, ring, ring.contestants)
					.then(() => {
						expect(getAttackRollImmobilizeSpy.callCount).to.equal(1);
						expect(getFreedomRollImmobilizeSpy.callCount).to.equal(1);
						expect(getImmobilizeRollImmobilizeSpy.callCount).to.equal(1);
						expect(getAttackRollHitSpy.callCount).to.equal(1);

						checkSuccessStub.restore();
						getAttackRollImmobilizeSpy.restore();
						getFreedomRollImmobilizeSpy.restore();
						getAttackRollHitSpy.restore();

						return expect(target.encounterEffects.length).to.equal(0);
					});
			});
	});

	it('frees target if player dies between turns', () => {
		const forkedStick = new ForkedStick();
		const checkSuccessStub = sinon.stub(Object.getPrototypeOf(Object.getPrototypeOf(forkedStick)), 'checkSuccess');

		const player = new Minotaur({ name: 'player' });
		const target = new Basilisk({ name: 'target' });

		const ring = {
			contestants: [
				{ character: {}, monster: player },
				{ character: {}, monster: target }
			],
			channelManager: {
				sendMessages: () => Promise.resolve()
			}
		};

		checkSuccessStub.returns({ success: true, strokeOfLuck: false, curseOfLoki: false });

		return forkedStick
			.play(player, target, ring, ring.contestants)
			.then(() => {
				expect(target.encounterEffects[0].effectType).to.equal('ImmobilizeEffect');

				checkSuccessStub.returns({ success: false, strokeOfLuck: false, curseOfLoki: false });
				player.dead = true;

				const card = target.encounterEffects.reduce((currentCard, effect) => {
					const modifiedCard = effect({
						activeContestants: [target, player],
						card: currentCard,
						phase: ATTACK_PHASE,
						player,
						ring,
						target
					});

					return modifiedCard || currentCard;
				}, new Hit());

				return card
					.play(target, player, ring, ring.contestants)
					.then(() => {
						checkSuccessStub.restore();

						return expect(target.encounterEffects.length).to.equal(0);
					});
			});
	});
});
