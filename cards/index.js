const shuffle = require('lodash.shuffle');

const isProbable = require('../helpers/is-probable');
const BoostCard = require('./boost');
const CurseCard = require('./curse');
const FleeCard = require('./flee');
const HitCard = require('./hit');
const HealCard = require('./heal');
const PoundCard = require('./pound');
// const ReviveCard = require('./revive');

const all = [
	BoostCard,
	CurseCard,
	FleeCard,
	HitCard,
	HealCard,
	PoundCard
];

const draw = (options) => {
	const shuffledDeck = shuffle(all);

	const Card = shuffledDeck.find(isProbable) || draw(options);

	return new Card(options);
};

const getInitialDeck = options => [
	new HitCard(options),
	new HitCard(options),
	new HealCard(options),
	new FleeCard(options),
	draw(options)
];

const hydrateCard = (cardObj) => {
	const Card = all.find(({ name }) => name === cardObj.name);
	return new Card(cardObj.options);
};

const hydrateDeck = deckJSON => JSON
	.parse(deckJSON)
	.map(hydrateCard);

module.exports = {
	all,
	draw,
	getInitialDeck,
	hydrateCard,
	hydrateDeck
};
