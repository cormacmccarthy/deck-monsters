/* eslint-disable max-len */
const { expect, sinon } = require('../shared/test-setup');

const Hit = require('./hit');
const Basilisk = require('../monsters/basilisk');
const Minotaur = require('../monsters/minotaur');
const Coil = require('./coil');
const { ATTACK_PHASE } = require('../constants/phases');

const { GLADIATOR, MINOTAUR, BASILISK, JINN } = require('../constants/creature-types');

describe('./cards/coil.js', () => {
	it('can be instantiated with defaults', () => {
		const coil = new Coil();
		const hit = new Hit({ targetProp: coil.targetProp });

		const stats = `Immobilize and hit your opponent by coiling your serpentine body around them and squeezing. If opponent is immune, hit instead.

If already immobilized, hit instead.
${hit.stats}
 +2 advantage vs Gladiator, Minotaur
 -2 disadvantage vs Basilisk, Jinn

Opponent breaks free by rolling 1d20 vs immobilizer's dex +/- advantage/disadvantage - (turns immobilized * 3)
Hits immobilizer back on stroke of luck.
Turns immobilized resets on curse of loki.

-1 hp each turn immobilized.`;

		expect(coil).to.be.an.instanceof(Coil);
		expect(coil.freedomThresholdModifier).to.equal(2);
		expect(coil.freedomSavingThrowTargetAttr).to.equal('dex');
		expect(coil.targetProp).to.equal('dex');
		expect(coil.doDamageOnImmobilize).to.be.true;
		expect(coil.ongoingDamage).to.equal(1);
		expect(coil.stats).to.equal(stats);
		expect(coil.strongAgainstCreatureTypes).to.deep.equal([GLADIATOR, MINOTAUR]);
		expect(coil.weakAgainstCreatureTypes).to.deep.equal([BASILISK, JINN]);
		expect(coil.uselessAgainstCreatureTypes).to.deep.equal([]);
		expect(coil.permittedClassesAndTypes).to.deep.equal([BASILISK]);
	});

	it('can be instantiated with options', () => {
		const coil = new Coil({
			freedomThresholdModifier: 2,
			doDamageOnImmobilize: false,
			ongoingDamage: 0
		});

		expect(coil).to.be.an.instanceof(Coil);
		expect(coil.freedomThresholdModifier).to.equal(2);
		expect(coil.doDamageOnImmobilize).to.be.false;
		expect(coil.ongoingDamage).to.equal(0);
	});

	it('does ongoingDamage until opponent breaks free', () => {
		const coil = new Coil();
		const checkSuccessStub = sinon.stub(Object.getPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf(coil))), 'checkSuccess');
		const hitCheckStub = sinon.stub(Object.getPrototypeOf(Object.getPrototypeOf(coil)), 'hitCheck');

		const player = new Basilisk({ name: 'player' });
		const target = new Minotaur({ name: 'target' });
		const startingTargetHP = target.hp;
		const startingPlayerHP = player.hp;

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

		const attackRoll = coil.getAttackRoll(player, target);
		hitCheckStub.returns({
			attackRoll,
			success: true,
			strokeOfLuck: false,
			curseOfLoki: false
		});

		let ongoingHP = startingTargetHP;

		return coil
			.play(player, target, ring, ring.contestants)
			.then(() => {
				expect(target.encounterEffects.length).to.equal(1);
				expect(target.hp).to.below(startingTargetHP);
				ongoingHP = target.hp;
				expect(player.hp).to.equal(startingPlayerHP);

				checkSuccessStub.returns({ success: false, strokeOfLuck: false, curseOfLoki: false });

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
						expect(target.hp).to.equal(ongoingHP - 1);
						ongoingHP = target.hp;
						expect(player.hp).to.equal(startingPlayerHP);
						expect(target.encounterEffects.length).to.equal(1);

						checkSuccessStub.returns({ success: true, strokeOfLuck: false, curseOfLoki: false });

						const newcard = target.encounterEffects.reduce((currentCard, effect) => {
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

						return newcard
							.play(target, player, ring, ring.contestants)
							.then(() => {
								checkSuccessStub.restore();
								hitCheckStub.restore();

								expect(target.hp).to.equal(ongoingHP);
								return expect(target.encounterEffects.length).to.equal(0);
							});
					});
			});
	});
});
