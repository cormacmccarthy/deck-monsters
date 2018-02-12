const { expect } = require('../shared/test-setup');

const IocaneCard = require('./iocane');

const HitCard = require('./hit');
const HealCard = require('./heal');

const { BARD, CLERIC } = require('../constants/creature-classes');

describe('./cards/iocane.js', () => {
	it('can be instantiated with defaults', () => {
		const iocane = new IocaneCard();
		const hit = new HitCard({ damageDice: iocane.damageDice });
		const heal = new HealCard({ healthDice: iocane.damageDice });

		expect(iocane).to.be.an.instanceof(IocaneCard);
		expect(iocane.stats).to.equal(`${hit.stats}\n- or, below 1/4 health -\n${heal.stats}`);
		expect(iocane.permittedClassesAndTypes).to.deep.equal([BARD, CLERIC]);
		expect(iocane.icon).to.equal('⚗️');
		expect(iocane.damageDice).to.equal('2d4');
	});

	it('can be instantiated with options', () => {
		const iocane = new IocaneCard({ icon: '🤷‍♂️', damageDice: '1d4' });
		const hit = new HitCard({ damageDice: iocane.damageDice });
		const heal = new HealCard({ healthDice: iocane.damageDice });

		expect(iocane).to.be.an.instanceof(IocaneCard);
		expect(iocane.stats).to.equal(`${hit.stats}\n- or, below 1/4 health -\n${heal.stats}`);
		expect(iocane.permittedClassesAndTypes).to.deep.equal([BARD, CLERIC]);
		expect(iocane.icon).to.equal('🤷‍♂️');
		expect(iocane.damageDice).to.equal('1d4');
	});
});
