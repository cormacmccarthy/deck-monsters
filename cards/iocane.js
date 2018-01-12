const SurvivalKnifeCard = require('./survival-knife');

const { CLERIC } = require('../helpers/classes');

class IocaneCard extends SurvivalKnifeCard {
	constructor ({
		icon = '⚗️',
		...rest
	} = {}) {
		super({ icon, ...rest });
	}
}

IocaneCard.cardType = 'Iocane';
IocaneCard.description = 'They were both poisoned. I spent the last few years building up an immunity to iocane powder...';
IocaneCard.permittedClassesAndTypes = [CLERIC];

module.exports = IocaneCard;
