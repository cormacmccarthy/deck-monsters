const BaseClass = require('../shared/baseClass');

const { itemCard } = require('../helpers/card');

class BaseItem extends BaseClass {
	constructor (options) {
		super(options);

		if (this.name === BaseItem.name) {
			throw new Error('The BaseItem should not be instantiated directly!');
		}
	}

	get itemType () {
		return this.constructor.itemType;
	}

	get description () {
		return this.constructor.description;
	}

	get icon () {
		return this.options.icon;
	}

	get cost () {
		return this.constructor.cost;
	}

	get level () {
		return this.constructor.level;
	}

	get permittedClassesAndTypes () {
		return this.constructor.permittedClassesAndTypes;
	}

	get probability () {
		return this.constructor.probability;
	}

	get flavors () {
		return this.constructor.flavors || this.options.flavors;
	}

	get used () {
		return this.options.used || 0;
	}

	set used (used) {
		this.setOptions({
			used
		});
	}

	get usableWithoutMonster () {
		return !!this.constructor.usableWithoutMonster;
	}

	use ({ channel, character, monster }) {
		return Promise.resolve()
			.then(() => {
				if (!this.usableWithoutMonster && !monster) {
					return Promise.reject(channel({
						announce: `${this.item} must be used on a monster.`
					}));
				}

				this.emit('used', {
					channel,
					character,
					monster
				});

				// Generally speaking once something has been used the player will drop it but we'll increment
				// a counter instead of boolean just in case the item can be used more than once
				this.used += 1;

				if (this.action) {
					return Promise.resolve().then(() => this.action({ channel, character, monster }));
				}

				return this.used;
			});
	}

	look (channel) {
		return Promise
			.resolve()
			.then(() => channel({
				announce: itemCard(this)
			}));
	}
}

BaseItem.eventPrefix = 'item';

module.exports = BaseItem;
