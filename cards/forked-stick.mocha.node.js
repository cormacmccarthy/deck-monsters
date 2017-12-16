const { expect, sinon } = require('../shared/test-setup');

const Hit = require('./hit');
const WeepingAngel = require('../monsters/weeping-angel');
const Basilisk = require('../monsters/basilisk');
const Minotaur = require('../monsters/minotaur');
const Gladiator = require('../monsters/gladiator');
const ForkedStick = require('./forked-stick');
const pause = require('../helpers/pause');

const { FIGHTER, BARBARIAN } = require('../helpers/classes');
const { GLADIATOR, MINOTAUR, BASILISK } = require('../helpers/creature-types');

describe('./cards/forked-stick.js', () => {
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
		const forkedStick = new ForkedStick();
		const hit = new Hit();

		const stats = `${hit.stats}
Chance to immobilize opponent by capturing their neck between prongs.

Small chance to do damage.`;

		expect(forkedStick).to.be.an.instanceof(ForkedStick);
		expect(forkedStick.freedomThresholdModifier).to.equal(1);
		expect(forkedStick.attackModifier).to.equal(2);
		expect(forkedStick.damageModifier).to.equal(0);
		expect(forkedStick.hitOnFail).to.equal(false);
		expect(forkedStick.alwaysDoDamage).to.equal(false);
		expect(forkedStick.stats).to.equal(stats);
		expect(forkedStick.strongAgainstCreatureTypes).to.deep.equal([GLADIATOR, BASILISK]);
		expect(forkedStick.weakAgainstCreatureTypes).to.deep.equal([MINOTAUR]);
		expect(forkedStick.permittedClassesAndTypes).to.deep.equal([FIGHTER, BARBARIAN]);
	});

	it('can be instantiated with options', () => {
		const forkedStick = new ForkedStick({
			freedomThresholdModifier: 1.5, damageModifier: 4, attackModifier: 4, hitOnFail: true, alwaysDoDamage: true
		});

		expect(forkedStick).to.be.an.instanceof(ForkedStick);
		expect(forkedStick.freedomThresholdModifier).to.equal(1.5);
		expect(forkedStick.attackModifier).to.equal(4);
		expect(forkedStick.damageModifier).to.equal(4);
		expect(forkedStick.hitOnFail).to.equal(true);
		expect(forkedStick.alwaysDoDamage).to.equal(true);
	});

	it('can be played against gladiators for a bonus to attack', () => {
		const forkedStick = new ForkedStick();

		const player = new Minotaur({ name: 'player' });
		const target = new Gladiator({ name: 'target' });
		const atkRoll = forkedStick.getAttackRoll(player, target);
		const dmgRoll = forkedStick.getDamageRoll(player, target);

		expect(atkRoll.modifier).to.equal(player.attackModifier + 2);
		expect(dmgRoll.modifier).to.equal(player.damageModifier);
	});

	it('can be played against basilisk for a bonus to attack', () => {
		const forkedStick = new ForkedStick();

		const player = new Minotaur({ name: 'player' });
		const target = new Basilisk({ name: 'target' });
		const atkRoll = forkedStick.getAttackRoll(player, target);
		const dmgRoll = forkedStick.getDamageRoll(player, target);

		expect(atkRoll.modifier).to.equal(player.attackModifier + 2);
		expect(dmgRoll.modifier).to.equal(player.damageModifier);
	});

	it('can be played against minotaurs for a weakened attack', () => {
		const forkedStick = new ForkedStick();

		const player = new Gladiator({ name: 'player' });
		const target = new Minotaur({ name: 'target' });
		const atkRoll = forkedStick.getAttackRoll(player, target);
		const dmgRoll = forkedStick.getDamageRoll(player, target);

		expect(atkRoll.modifier).to.equal(player.attackModifier - 2);
		expect(dmgRoll.modifier).to.equal(player.damageModifier);
	});

	it('can be played against weeping angel with no bonus/penalty', () => {
		const forkedStick = new ForkedStick();

		const target = new WeepingAngel({ name: 'player' });
		const player = new Gladiator({ name: 'target' });
		const dmgRoll = forkedStick.getDamageRoll(player, target);
		const atkRoll = forkedStick.getAttackRoll(player, target);

		expect(dmgRoll.modifier).to.equal(player.attackModifier);
		expect(atkRoll.modifier).to.equal(player.damageModifier);
	});
});
