/**
 * Chronicles of Darkness for FVTT
 */

// Import Modules
import {ActorCoD} from './actor.js';
import {ActorSheetCoD} from './actor-sheet.js';
import {CoDItem} from './item.js';
import {CoDItemSheet} from './item-sheet.js';
import {preloadHandlebarsTemplates} from './templates.js';

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once('init', async function () {
	// Place our classes in their own namespace for later reference.
	game.cod = {
		ActorCoD,
		CoDItem,
		rollItemMacro,
	};

	/**
	 * Set an initiative formula for the system
	 * @type {String}
	 */
	CONFIG.Combat.initiative.formula = `1d10 + @advantages.initiative.value`;

	// Define custom Entity classes
	CONFIG.Actor.entityClass = ActorCoD;
	CONFIG.Item.entityClass = CoDItem;

	// Register sheet application classes
	Actors.unregisterSheet('core', ActorSheet);
	Actors.registerSheet('cod', ActorSheetCoD, {types: [], makeDefault: true});
	Items.unregisterSheet('core', ItemSheet);
	Items.registerSheet('core', CoDItemSheet, {types: [], makeDefault: true});

	// Preload Handlebars Templates
	preloadHandlebarsTemplates();
});

// Register handlebar helpers

// Repetaer
Handlebars.registerHelper('repeat', (n, block) => {
	var accum = '';
	for (var i = 0; i < n; i++) {
		block.data.index = i;
		accum += block.fn(this);
	}
	return accum;
});

// If less than
Handlebars.registerHelper('ifLessThan', (x, y, options) => {
	return x < y ? options.fn() : options.inverse();
});

// If greater than
Handlebars.registerHelper('ifGreaterThan', (x, y, options) => {
	return x > y ? options.fn() : options.inverse();
});

// If equal to
Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
	return arg1 == arg2 ? options.fn(this) : options.inverse(this);
});

Hooks.once('ready', async function () {
	// Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
	Hooks.on('hotbarDrop', (bar, data, slot) => createCoDMacro(data, slot));
});

// Math
Handlebars.registerHelper('math', function (lvalue, operator, rvalue, options) {
	lvalue = parseFloat(lvalue);
	rvalue = parseFloat(rvalue);

	return {
		'+': lvalue + rvalue,
		'-': lvalue - rvalue,
		'*': lvalue * rvalue,
		'/': lvalue / rvalue,
		'%': lvalue % rvalue,
	}[operator];
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createCoDMacro(data, slot) {
	if (data.type !== 'Item') return;
	if (!('data' in data))
		return ui.notifications.warn(
			'You can only create macro buttons for owned Items'
		);
	const item = data.data;

	// Create the macro command
	const command = `game.cod.rollItemMacro("${item.name}");`;
	let macro = game.macros.entities.find(
		(m) => m.name === item.name && m.command === command
	);
	if (!macro) {
		macro = await Macro.create({
			name: item.name,
			type: 'script',
			img: item.img,
			command: command,
			flags: {'cod.itemMacro': true},
		});
	}
	game.user.assignHotbarMacro(macro, slot);
	return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @return {Promise}
 */
function rollItemMacro(itemName) {
	const speaker = ChatMessage.getSpeaker();
	let actor;
	if (speaker.token) actor = game.actors.tokens[speaker.token];
	if (!actor) actor = game.actors.get(speaker.actor);
	const item = actor ? actor.items.find((i) => i.name === itemName) : null;
	if (!item)
		return ui.notifications.warn(
			`Your controlled Actor does not have an item named ${itemName}`
		);

	// Trigger the item roll
	return item.roll();
}

// Attribute Names
CONFIG.attributes = {
	int: 'Inteligência',
	wits: 'Percepção',
	res: 'Raciocínio',
	str: 'Força',
	dex: 'Destreza',
	sta: 'Vigor',
	pre: 'Carisma',
	man: 'Manipulação',
	com: 'Aparência',
};

// Skill Names
CONFIG.skills = {
	academics: 'Acadêmicos',
	computer: 'Computador',
	finance: 'Finanças',
	investigation: 'Investigação',
	law: 'Direito',
	language: 'Lingüística',
	medicine: 'Medicina',
	occult: 'Ocultismo',
	politics: 'Política',
	science: 'Ciências',
	riddle: 'Enigmas',
	ritual: 'Rituais',
	animalken: 'Empatia com Animais',
	crafts: 'Ofícios',
	drive: 'Condução',
	socialize: 'Etiqueta',
	firearms: 'Armas de Fogo',
	weaponry: 'Armas Brancas',
	performance: 'Performance',
	larceny: 'Segurança',
	stealth: 'Furtividade',
	survival: 'Sobrevivência',
	alertness: 'Prontidão',
	athletics: 'Esportes',
	brawl: 'Briga',
	dodge: 'Esquiva',
	empathy: 'Empatia',
	expression: 'Expressão',
	intimidation: 'Intimidação',
	persuasion: 'Liderança',
	streetwise: 'Manha',
	subterfuge: 'Lábia',
};

// Group Names
CONFIG.groups = {
	mental: 'Conhecimentos',
	physical: 'Perícias',
	social: 'Talentos',
};

// Group Mapping
CONFIG.groupMapping = {
	int: 'mental',
	wits: 'mental',
	res: 'mental',
	str: 'physical',
	dex: 'physical',
	sta: 'physical',
	pre: 'social',
	man: 'social',
	com: 'social',
	
	academics: 'mental',
	computer: 'mental',
	finance: 'mental',
	investigation: 'mental',
	law: 'mental',
	language: 'mental',
	medicine: 'mental',
	occult: 'mental',
	politics: 'mental',
	science: 'mental',
	ritual: 'mental',
	riddle: 'mental',
	animalken: 'physical',
	crafts: 'physical',
	drive: 'physical',
	socialize: 'physical',
	firearms: 'physical',
	weaponry: 'physical',
	performance: 'physical',
	larceny: 'physical',
	stealth: 'physical',
	survival: 'physical',
	alertness: 'social',
	athletics: 'social',
	brawl: 'social',
	dodge: 'social',
	empathy: 'social',
	expression: 'social',
	intimidation: 'social',
	persuasion: 'social',
	streetwise: 'social',
	subterfuge: 'social',
};

// Attack Categories
CONFIG.attacks = {
	brawl: 'Brawl',
	melee: 'Melee',
	ranged: 'Ranged',
	thrown: 'Thrown',
	brawlFinesse: 'Brawl (Fighting Finesse)',
	meleeFinesse: 'Melee (Fighting Finesse)',
};

// Attack Skills
CONFIG.attackSkills = {
	brawl: 'str,brawl',
	melee: 'str,weaponry',
	ranged: 'dex,firearms',
	thrown: 'dex,athletics',
	brawlFinesse: 'dex,brawl',
	meleeFinesse: 'dex,weaponry',
};

// Character Types
CONFIG.splats = {
	mortal: 'Mortal',
	vampire: 'Vampiro',
	werewolf: 'Lobisomem',
	mage: 'Mago',
	changeling: 'Changeling',
	hunter: 'Caçador',
	geist: 'Aparição',
	mummy: 'Múmia',
	demon: 'Demônio',
	beast: 'Beast',
};

// Merit Groups
CONFIG.universalMeritGroups = {
	mental: '-- Mental (general) --',
	areaOfExpertise: 'Area of Expertise',
	encyclopedicKnowledge: 'Encyclopedic Knowledge',
	interSpecialty: 'Interdisciplinary Specialty',
	investigativeAide: 'Investigative Aide',
	language: 'Language',
	library: 'Library',
	objectFetishism: 'Object Fetishism',
	scarred: 'Scarred',
	professionalTraining: 'Professional Training',
	physical: '-- Physical (general) --',
	parkour: 'Parkour',
	stuntDriver: 'Stunt Driver',
	social: '-- Social (general) --',
	allies: 'Allies',
	alternateIdentity: 'Alternate Identity',
	contacts: 'Contacts',
	hobbyistClique: 'Hobbyist Clique',
	mentor: 'Mentor',
	mysteryCult: 'Mystery Cult',
	retainer: 'Retainer',
	safePlace: 'Safe Place',
	staff: 'Staff',
	status: 'Status',
	supportNetwork: 'Support Network',
	fighting: '-- Fighting (general) --',
	supernatural: '-- Supernatural (general) --',
	animalSpeech: 'Animal Speech',
	phantomLimb: 'Phantom Limb',
	psychokinesis: 'Psychokinesis',
	unseenSense: 'Unseen Sense',
};
