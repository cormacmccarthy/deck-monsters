/* eslint-disable max-len */
const { expect, sinon } = require('../../shared/test-setup');

const pause = require('../../helpers/pause');
const LaCarambadaScroll = require('./la-carambada-according-to-clever-hans');
const Jinn = require('../../monsters/jinn');

const { TARGET_MAX_HP_PLAYER_ACCORDING_TO_HANS } = require('../../helpers/targeting-strategies');

describe('./items/scrolls/la-carambada-according-to-clever-hans.js', () => {
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
		const laCarambada = new LaCarambadaScroll();
		const jenn = new Jinn({ name: 'jenn', acVariance: 0, xp: 1300, gender: 'female' });

		expect(laCarambada.probability).to.equal(75);
		expect(laCarambada.cost).to.equal(18);
		expect(laCarambada).to.be.an.instanceof(LaCarambadaScroll);
		expect(laCarambada.numberOfUses).to.equal(3);
		expect(laCarambada.expired).to.be.false;
		expect(laCarambada.stats).to.equal('Usable 3 times.');
		expect(laCarambada.icon).to.equal('👦');
		expect(laCarambada.targetingStrategy).to.equal(TARGET_MAX_HP_PLAYER_ACCORDING_TO_HANS);
		expect(laCarambada.itemType).to.equal('The Ballad of La Carambada According to Clever Hans');
		expect(laCarambada.getTargetingDetails(jenn)).to.equal('Jenn will target whichever living opponent would have the highest hp if they were at full health (that is, the highest maximum hp), unless directed otherwise by a specific card.');
		expect(laCarambada.description).to.equal(`Junto a ellos, aterrorizó la comarca, aguardando el día de la venganza. Hizo fama por su diestro manejo de la pistola, del machete y, sobre todo, por su extraordinaria habilidad para cabalgar. En tiempos en que las mujeres acompañaban a sus hombres a un lado del caballo, ver a una mujer galopando era un acontecimiento mayor.

Target whoever has the highest maximum hp in the ring even if they currently have less hp.`);
	});
});
