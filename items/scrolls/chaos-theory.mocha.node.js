/* eslint-disable max-len */
const { expect, sinon } = require('../../shared/test-setup');

const ChaosTheoryScroll = require('./chaos-theory');
const Jinn = require('../../monsters/jinn');
const randomCharacter = require('../../characters/helpers/random');
const targetingStrategies = require('../../helpers/targeting-strategies');

describe('./items/scrolls/chaos-theory.js', () => {
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
		const chaosTheory = new ChaosTheoryScroll();
		const jenn = new Jinn({ name: 'jenn', acVariance: 0, xp: 1300, gender: 'female' });

		expect(chaosTheory).to.be.an.instanceof(ChaosTheoryScroll);
		expect(chaosTheory.numberOfUses).to.equal(3);
		expect(chaosTheory.expired).to.be.false;
		expect(chaosTheory.stats).to.equal('Usable 3 times.');
		expect(chaosTheory.icon).to.equal('🦋');
		expect(chaosTheory.getTargetingDetails(jenn)).to.equal('Jenn will look around the ring and pick a random foe to target, unless directed otherwise by a specific card.');
	});

	it('can change your targeting strategy', () => {
		const chaosTheory = new ChaosTheoryScroll();
		const character = randomCharacter();
		const monster = character.monsters[0];

		expect(monster.targetingStrategy).to.equal(undefined);

		return chaosTheory.use({ channel: channelStub, character, monster }).then(() => {
			expect(monster.targetingStrategy).to.equal(targetingStrategies.TARGET_RANDOM_PLAYER);
			expect(chaosTheory.used).to.equal(1);
			expect(chaosTheory.expired).to.be.false;
			return expect(chaosTheory.stats).to.equal('Usable 2 more times (of 3 total).');
		});
	});
});
