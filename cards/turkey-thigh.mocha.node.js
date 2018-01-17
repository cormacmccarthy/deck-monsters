const { expect, sinon } = require('../shared/test-setup');

const TurkeyThighCard = require('./turkey-thigh');
const pause = require('../helpers/pause');

const HitCard = require('./hit');
const HealCard = require('./heal');

const { BARBARIAN } = require('../helpers/classes');

describe('./cards/turkey-thigh.js', () => {
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
		const turkeyThigh = new TurkeyThighCard();
		const hit = new HitCard({ damageDice: turkeyThigh.damageDice });
		const heal = new HealCard({ healthDice: turkeyThigh.damageDice });

		expect(turkeyThigh).to.be.an.instanceof(TurkeyThighCard);
		expect(turkeyThigh.stats).to.equal(`${hit.stats}\n- or, below 1/4 health -\n${heal.stats}`);
		expect(turkeyThigh.permittedClassesAndTypes).to.deep.equal([BARBARIAN]);
		expect(turkeyThigh.icon).to.equal('🍗');
		expect(turkeyThigh.damageDice).to.equal('2d4');
	});

	it('can be instantiated with options', () => {
		const turkeyThigh = new TurkeyThighCard({ icon: '🤷‍♂️', damageDice: '1d4' });
		const hit = new HitCard({ damageDice: turkeyThigh.damageDice });
		const heal = new HealCard({ healthDice: turkeyThigh.damageDice });

		expect(turkeyThigh).to.be.an.instanceof(TurkeyThighCard);
		expect(turkeyThigh.stats).to.equal(`${hit.stats}\n- or, below 1/4 health -\n${heal.stats}`);
		expect(turkeyThigh.permittedClassesAndTypes).to.deep.equal([BARBARIAN]);
		expect(turkeyThigh.icon).to.equal('🤷‍♂️');
		expect(turkeyThigh.damageDice).to.equal('1d4');
	});
});
