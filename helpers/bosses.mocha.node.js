const { expect, sinon } = require('../shared/test-setup');

const bosses = require('./bosses');
const pause = require('../helpers/pause');
const HitCard = require('../cards/hit');
const FleeCard = require('../cards/flee');

describe('./helpers/bosses.js', () => {
	let pauseStub;

	before(() => {
		pauseStub = sinon.stub(pause, 'setTimeout');
	});

	beforeEach(() => {
		pauseStub.callsArg(0);
	});

	afterEach(() => {
		pauseStub.reset();
	});

	after(() => {
		pause.setTimeout.restore();
	});

	describe('randomContestant', () => {
		it('can generate a contestant', () => {
			const contestant = bosses.randomContestant();

			expect(contestant).to.have.all.keys('monster', 'character', 'channel', 'channelName');
		});

		it('generates monsters which cannot flee', () => {
			const { monster } = bosses.randomContestant();

			expect(monster.canHoldCard(HitCard)).to.equal(true);
			expect(monster.canHoldCard(FleeCard)).to.equal(false);
		});
	});
});
