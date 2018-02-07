const { expect, sinon } = require('../../shared/test-setup');
const proxyquire = require('proxyquire');

const randomCharacter = require('../../characters/helpers/random');
const TestCard = require('../../cards/test');

const defaultShop = {
	adjective: 'rusty',
	backRoom: [],
	backRoomOffset: 9,
	cards: [],
	items: [],
	name: 'Gorgons and Gremlins',
	priceOffset: 0.6689276100094799,
	pronouns: { he: 'she', him: 'her', his: 'her' }
};

const defaultClosingTime = 'TIME';

describe('./items/store/buy.js', () => {
	let buyItems;
	let clock;

	const channelStub = sinon.stub();
	const getShopStub = sinon.stub();
	const getClosingTimeStub = sinon.stub();

	beforeEach(() => {
		clock = sinon.useFakeTimers();
		channelStub.resolves();
		getShopStub.returns(defaultShop);
		getClosingTimeStub.returns(defaultClosingTime);

		buyItems = proxyquire('./buy', {
			'./shop': getShopStub,
			'./closing-time': getClosingTimeStub
		});
	});

	afterEach(() => {
		clock.restore();
		channelStub.reset();
		getShopStub.reset();
		getClosingTimeStub.reset();
	});

	it('can offer cards for sale', () => {
		const character = randomCharacter({ name: 'Character', coins: 500 });
		const card = new TestCard();
		const shop = {
			...defaultShop,
			cards: [card]
		};
		getShopStub.returns(shop);

		channelStub.withArgs({
			choices: [1, 2, 3],
			question: `You push open a rusty door and find yourself in Gorgons and Gremlins with 500 coins in your pocket.

${defaultClosingTime}

We have 0 items and 1 card. Which would you like to see?

1) Items
2) Cards
3) Back Room`
		})
			.resolves('2');

		channelStub.withArgs({
			question: `Choose one or more of the following cards:

0) Test [1] - 13 coins`
		})
			.resolves('0');

		channelStub.withArgs({
			question: `These fine items are available from Gorgons and Gremlins for a mere 13 coins.

Would you like to buy them? (yes/no)`
		})
			.resolves('yes');

		const numberOfCards = character.cards.length;

		return buyItems({ character, channel: channelStub })
			.then(() => {
				expect(channelStub).to.have.been.calledWith({
					announce: 'Sold! Thank you for your purchase, Character. It was a pleasure doing business with you.'
				});

				expect(channelStub).to.have.been.calledWith({
					announce: 'Character has 487 coins.'
				});

				expect(shop.cards.length).to.equal(0);
				return expect(character.cards.length).to.equal(numberOfCards + 1);
			});
	});
});
