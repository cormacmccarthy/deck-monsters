const { expect, sinon } = require('../shared/test-setup');

const {
	// all,
	// draw,
	// fillDeck,
	getCardCounts,
	// getInitialDeck,
	// getUniqueCards,
	// hydrateCard,
	hydrateDeck
	// isMatchingCard,
	// sortCards
} = require('./index');
const pause = require('../helpers/pause');
const Beastmaster = require('../characters/beastmaster');

const testDeck = `[
	{
		"name":"HealCard",
		"options":{
			"icon":"💊"
		}
	},
	{
		"name":"FleeCard",
		"options":{
			"icon":"🏃"
		}
	},
	{
		"name":"RandomCard",
		"options":{
			"icon":"🎲"
		}
	},
	{
		"name":"HealCard",
		"options":{
			"icon":"💊"
		}
	},
	{
		"name":"HealCard",
		"options":{
			"icon":"💊"
		}
	},
	{
		"name":"HealCard",
		"options":{
			"icon":"💊"
		}
	},
	{
		"name":"RandomCard",
		"options":{
			"icon":"🎲"
		}
	},
	{
		"name":"FleeCard",
		"options":{
			"icon":"🏃"
		}
	},
	{
		"name":"HealCard",
		"options":{
			"icon":"💊"
		}
	},
	{
		"name":"BlastCard",
		"options":{
			"icon":"💥"
		}
	},
	{
		"name":"HealCard",
		"options":{
			"icon":"💊"
		}
	},
	{
		"name":"RandomCard",
		"options":{
			"icon":"🎲"
		}
	},
	{
		"name":"RandomCard",
		"options":{
			"icon":"🎲"
		}
	},
	{
		"name":"RandomCard",
		"options":{
			"icon":"🎲"
		}
	},
	{
		"name":"RandomCard",
		"options":{
			"icon":"🎲"
		}
	},
	{
		"name":"RandomCard",
		"options":{
			"icon":"🎲"
		}
	},
	{
		"name":"HealCard",
		"options":{
			"icon":"💊"
		}
	},
	{
		"name":"HealCard",
		"options":{
			"icon":"💊"
		}
	},
	{
		"name":"RandomCard",
		"options":{
			"icon":"🎲"
		}
	},
	{
		"name":"CurseCard",
		"options":{
			"icon":"😖"
		}
	},
	{
		"name":"WoodenSpearCard",
		"options":{
			"icon":"🌳"
		}
	},
	{
		"name":"WoodenSpearCard",
		"options":{
			"icon":"🌳"
		}
	},
	{
		"name":"HealCard",
		"options":{
			"icon":"💊"
		}
	},
	{
		"name":"BoostCard",
		"options":{
			"icon":"🆙"
		}
	},
	{
		"name":"WhiskeyShotCard",
		"options":{
			"icon":"🥃"
		}
	},
	{
		"name":"HitCard",
		"options":{
			"icon":"👊"
		}
	},
	{
		"name":"HitHarder",
		"options":{
			"icon":"🔨"
		}
	},
	{
		"name":"CurseCard",
		"options":{
			"icon":"😖"
		}
	},
	{
		"name":"RandomCard",
		"options":{
			"icon":"🎲"
		}
	}
]`;

describe('./cards/index.js', () => {
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

	describe('cards', () => {
		it('can restore from save state, ensuring card minimums are met', () => {
			const player = new Beastmaster();

			const deck = hydrateDeck(testDeck, player);

			const cardCounts = getCardCounts(deck);

			expect(cardCounts.Hit).to.equal(4);
			expect(cardCounts.Heal).to.equal(9);
			expect(cardCounts.Flee).to.equal(2);
			expect(cardCounts.Blink).to.equal(1);
			expect(cardCounts.Coil).to.equal(1);
			expect(cardCounts['Horn Gore']).to.equal(1);
			expect(cardCounts['Battle Focus']).to.equal(1);
			expect(cardCounts.Blast).to.equal(1);
			expect(cardCounts['Random Play']).to.equal(9);
			expect(cardCounts.Soften).to.equal(2);
			expect(cardCounts['Hit Harder']).to.equal(1);
			expect(cardCounts['Whiskey Shot']).to.equal(1);
		});
	});
});
