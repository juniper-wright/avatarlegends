/**
 * A simple and flexible system for world-building using an arbitrary collection
 * of character and item attributes.
 * Author: Atropos
 * Software License: GNU GPLv3
 */

// Import Modules
import { AvatarLegendsActor } from "./actor.js";
import { AvatarLegendsItemSheet } from "./item-sheet.js";
import { AvatarLegendsActorSheet } from "./actor-sheet.js";
import { SummaryActorSheet } from "./summary-actor-sheet.js";
import { preloadHandlebarsTemplates } from "./templates.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", async function() {
  console.log(`Initializing Avatar Legends.`);

  /**
   * Set an initiative formula for the system.
   */
  CONFIG.Combat.initiative = {
    formula: "2d6",
    decimals: 2
  };

  // Define custom Entity classes
  CONFIG.Actor.documentClass = AvatarLegendsActor;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("avatarlegends", AvatarLegendsActorSheet, {
    types: ["companion", "minorNPC", "majorNPC", "masterNPC", "legendNPC"],
    makeDefault: true
  });
  Actors.registerSheet("avatarlegends", SummaryActorSheet, {
    types: ["summary"],
    makeDefault: true
  });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("avatarlegends", AvatarLegendsItemSheet, {
    types: ["technique", "move", "status"],
    makeDefault: true
  });

  /**
   * Concatenate multiple strings and variables.
   * From https://stackoverflow.com/a/35862620
   */
  Handlebars.registerHelper('concat', function() {
    var arg = Array.prototype.slice.call(arguments,0);
    arg.pop();
    return arg.join('');
  });

  /**
   * Repeat a block N times, setting `timesIndex` to the index of each
   * iteration. From https://stackoverflow.com/a/11924998
   */
  Handlebars.registerHelper('times', function(n, block) {
    var accum = '';
    for(var i = 0; i < n; ++i) {
        this.timesIndex = i;
        accum += block.fn(this);
    }
    return accum;
  });

  /**
   * Register Handlebars numerical comparison helpers
   */
  Handlebars.registerHelper('lt', function(a, b) {
    return a < b;
  });
  Handlebars.registerHelper('lte', function(a, b) {
    return a <= b;
  });
  Handlebars.registerHelper('gt', function(a, b) {
    return a > b;
  });
  Handlebars.registerHelper('gte', function(a, b) {
    return a >= b;
  });

  // Simple comparison operator
  Handlebars.registerHelper('eq', function(a, b) {
    return a === b;
  });

  // Subtraction because Handlebars has ZERO features
  Handlebars.registerHelper('sub', function(a, b) {
    return a - b;
  });

  /**
   * Returns true if the argument is a boolean.
   */
  Handlebars.registerHelper('isBoolean', function(o) {
    return typeof o === "boolean"
  });

  /**
   * Returns true if the argument string is non-empty.
   */
  Handlebars.registerHelper('isNonEmptyString', function(str) {
    return str !== "";
  });

  /**
   * Splits a string using the provided separator string.
   */
  Handlebars.registerHelper('split', function(str, sep) {
    if (!str) {
      // empty, null, undefined, etc.
      return [];
    }
    let parts = str.split(sep);
    if (parts.length === 1 && parts[0] === "") {
      return [];
    }
    return parts;
  });

  // Preload template partials.
  await preloadHandlebarsTemplates();

  console.log("Avatar Legends initialized.");
});

/* -------------------------------------------- */

// Override the default icons for items.
Hooks.on("createItem", item => {
  let MYSTERY_MAN_ICON = "icons/svg/mystery-man.svg";

  // TODO: Consolidate this with the similar list in actor-sheet.js.
  let DEFAULT_CONDITION_ICON = "icons/svg/chest.svg";
  let DEFAULT_TECHNIQUE_ICON = "icons/svg/combat.svg";
  let DEFAULT_STATUS_ICON = "icons/svg/statue.svg";
  let DEFAULT_MOVE_ICON = "icons/svg/book.svg";

  let newImg = DEFAULT_CONDITION_ICON;
  if (item.type === "technique") {
    newImg = DEFAULT_TECHNIQUE_ICON;
  }
  else if (item.type === "status") {
    newImg = DEFAULT_STATUS_ICON;
  }
  else if (item.type === "move") {
    newImg = DEFAULT_MOVE_ICON;
  }

  item.update({
    img: (!item.data.img || item.data.img === MYSTERY_MAN_ICON)
        ? newImg
        : item.data.img
  });
});

Hooks.once('setup', async function() {
  // Pre-cache these or else the first time we load the sheet it will overwrite
  // the image we patch in. Thanks to
  // https://github.com/schultzcole/FVTT-Default-Image-Overrider for this trick!
  await Promise.all([
    getTemplate("systems/avatarlegends/templates/actor-sheet.html"),
    getTemplate("systems/avatarlegends/templates/item-sheet.html"),
  ]);
});
