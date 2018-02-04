/* eslint-disable max-len */
const Promise = require('bluebird');

const playerHandbook = channel => Promise
	.resolve()
	.then(() => channel({
		announce: `
\`\`\`
	 ____    ___
	/\\  _\`\\ /\\_ \\
	\\ \\ \\L\\ \\//\\ \\      __     __  __     __   _ __
	 \\ \\ ,__/ \\ \\ \\   /'__\`\\  /\\ \\/\\ \\  /'__\`\\/\\\`'__\\
	  \\ \\ \\/   \\_\\ \\_/\\ \\L\\.\\_\\ \\ \\_\\ \\/\\  __/\\ \\ \\/
	   \\ \\_\\   /\\____\\ \\__/.\\_\\\\/\`____ \\ \\____\\\\ \\_\\
	    \\/_/   \\/____/\\/__/\\/_/ \`/___/> \\/____/ \\/_/
	                               /\\___/
	                               \\/__/
	 __  __                       __  __                      __
	/\\ \\/\\ \\                     /\\ \\/\\ \\                    /\\ \\
	\\ \\ \\_\\ \\     __      ___    \\_\\ \\ \\ \\____    ___     ___\\ \\ \\/'\\
	 \\ \\  _  \\  /'__\`\\  /' _ \`\\  /'_\` \\ \\ '__\`\\  / __\`\\  / __\`\\ \\ , <
	  \\ \\ \\ \\ \\/\\ \\L\\.\\_/\\ \\/\\ \\/\\ \\L\\ \\ \\ \\L\\ \\/\\ \\L\\ \\/\\ \\L\\ \\ \\ \\\\\`\\
	   \\ \\_\\ \\_\\ \\__/.\\_\\ \\_\\ \\_\\ \\___,_\\ \\_,__/\\ \\____/\\ \\____/\\ \\_\\ \\_\\
	    \\/_/\\/_/\\/__/\\/_/\\/_/\\/_/\\/__,_ /\\/___/  \\/___/  \\/___/  \\/_/\\/_/



    Welcome to Deck Monsters, the monster capturing, deck-building, turn based RPG.

    In this game, you (the player) will capture monsters to fight for you. Use your card pool to build each monster's deck before you send it into battle.

    During battle, your monster will play each card one at a time in the order in which you placed it in the monster's deck. When the monster gets to the end of its deck, it starts back at the beginning of the deck again.

    Choose your cards wisely, good luck, and have fun!

    # Commands:

    ## Monsters

    \`spawn monster\` - Spawns a new monster

    \`equip monster\` - Select a monster and equip it with cards

    \`equip [monster name]\` - Equip provided monster with cards

    \`look at monsters\` - Looks at your monsters

	\`look at monsters in detail\` - Looks at your monsters with their description

    \`look at [monster name]\` - Look at specified monster (yours or another player's)

    ## The Ring

    The glorious crucible of your monster's destiny.

    \`send monster to the ring\` - Select a monster and send it to the ring

    \`send [monster name] to the ring\` - Send provided monster to the ring

    \`summon [monster name] from the ring\` - Calls provided monster back from the ring

    \`look at the ring\` - Take a peak at the ring to see which monsters are there and who sent them

    ## Cards

    \`look at cards\` - Look at your cards

    \`look at [card name]\` - Look at specified card

    ## Items

    You can hold up to 3 items + 3 per monster under your care. In addition, your monsters can each hold 3 items. Items can be used on yourself or your monsters between battles, but a monster can only use an item during battle that you gave them ahead of time.

    \`look at items\` - Look at your items

    \`look at [item name]\` - Look at specified item

    \`use item\` - Use one of your items on yourself

    \`use [item name]\` - Use the provided item on yourself

    Any of these can be used with [item name] and/or [monster name] as a shortcut to specify the item and/or monster.

    \`give item to monster\` - Give an item to the provided monster

    \`take item from monster\` - Take an item from one of your monsters

    \`use item on monster\` - Use one of your items on yourself

    ## The Shop

    Every 8 hours the current merchant will pack up and leave and a new merchant will come to town for you to do business with.

    Each merchant has their own pricing, so be a shrewd businessman, and make sure you are getting a good deal. The shop will never give you as much as your card is worth, but that doesn't mean you have to get ripped off either.

    \`visit the shop\` - Lets you visit the shop to make a purchase

    \`sell to the shop\` - Lets you sell items to the shop


    # Basic Build Strategies

    Here are some examples of basic build strategies by class and level. When you are hidden, playing a card that affects other players will reveal you to them, so that's a great time to play your Delayed Hit, stat boost, or healing cards. Another opportune time to play non-damaging cards is while your opponent is immobilized since they can't attack you between your card plays if they don't break free.

    ## Minotaur Level 1

    `equip [monster] with "Horn Gore", "Delayed Hit", "Delayed Hit", "Heal", "Hit", "Hit", "Hit", "Hit", "Heal"`

    ## Gladiator Level 1

   `equip [monster] with "Soften", "Forked Stick", "Battle Focus", "Camouflage Vest", "Heal", "Delayed Hit", "Delayed Hit", "Forked Stick", "Survival Knife", "Wooden Spear"`

    ## Jinn Level 2

    `equip [monster] with "Sandstorm", "Enchanted Faceswap", "Lucky Strike", "Forked Stick", "Soften", "Delayed Hit", "Forked Stick", "Delayed Hit", "Heal"`

    ## Basilisk Level 3

    `equip [monster] with "Constrict", "Thick Skin", "Delayed Hit", "Coil", "Whiskey Shot", "Delayed Hit", "Berserk", "Hit Harder", "Hit"`

    ## Weeping Angel Level 4

    `equip [monster] with "Blink", "Delayed Hit", "Delayed Hit", "Mesmerize", "Scotch", "Blast", "Blast", "Pick Pocket", "Random Play"`

    ## Minotaur Level 5

    `equip [monster] with "Camouflage Vest", "Delayed Hit", "Delayed Hit", "Soften", "Forked Metal Rod", "Horn Gore", "Turkey Thigh", "Hit Harder", "Berserk"`

    ## Gladiator Level 6

    `equip [monster] with "Camouflage Vest", "Basic Shield", "Delayed Hit", "Forked Metal Rod", "Camouflage Vest", "Scotch", "Delayed Hit", "Lucky Strike", "Battle Focus"`
\`\`\`
`
	}));

module.exports = playerHandbook;
