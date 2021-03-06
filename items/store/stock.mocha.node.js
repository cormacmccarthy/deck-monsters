const { expect } = require('../../shared/test-setup');

const { getBackRoom, getCards } = require('./stock');

describe('./items/store/stock.js', () => {
	describe('getBackRoom', () => {
		it('can get special items for the back room', () => {
			const backRoom = getBackRoom();

			expect(backRoom.length).to.be.above(0);
			expect(backRoom.length).to.be.below(7);

			backRoom.forEach((item) => {
				expect(item.constructor.notForSale).to.equal(true);
				expect(item.constructor.neverForSale).to.not.equal(true);
			});
		});
	});

	describe('getCards', () => {
		it('can get a set of cards', () => {
			const cards = getCards();

			expect(cards.length).to.be.above(4);
			expect(cards.length).to.be.below(21);

			cards.forEach((item) => {
				expect(item.constructor.notForSale).to.not.equal(true);
				expect(item.constructor.neverForSale).to.not.equal(true);
			});
		});
	});
});
