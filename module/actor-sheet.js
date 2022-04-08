/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class AvatarLegendsActorSheet extends ActorSheet {

  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["avatarlegends", "sheet", "actor"],
      template: "systems/avatarlegends/templates/actor-sheet.html",
      width: 600,
      height: 600,
      tabs: [
        {
          navSelector: ".tab-nav-left",
          contentSelector: ".tab-content-left",
          initial: "moves",
        },
        {
          navSelector: ".tab-nav-right",
          contentSelector: ".tab-content-right",
          initial: "conditions",
        },
      ],
      dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }]
    });
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  getData() {
    const context = super.getData();
    context.actor = context.data.data;
    context.isCompanion = this.actor.data.type === "companion";
    context.trainings = ["waterbending", "airbending", "earthbending", "firebending", "weapons", "technology"];

    this._preparePrinciples(context);
    this._prepareItems(context);
    if (this.actor.data.type === 'companion') {
      this._prepareCompanionStatistics(context);
    }

    // This is the object that determines the namespace
    // seen by the HTML templates.
    return context;
  }

  /**
   * Adds '+' in front of positive statistics.
   *
   * @param {Object} sheetData The sheet containing the actor to prepare.
   */
  _prepareCompanionStatistics(sheetData) {
    let statistics = sheetData.data.data.statistics;
    for (let key in statistics) {
      if (statistics.hasOwnProperty(key)) {
        let statistic = statistics[key];
        if (statistic.hasOwnProperty("value") && statistic.value > 0) {
          statistic.value = "+" + statistic.value;
        }
      }
    }
  }

  /**
   * Configure the character's principles
   * 
   * @param {Object} sheetData The sheet containing the actor to prepare.
   */
  _preparePrinciples(sheetData) {
    const balance = sheetData.data.data.balance.value;
    sheetData.data.data.principleYinFormatted = `(${balance <= 3 ? '+' : ''}${3-balance})`;
    sheetData.data.data.principleYangFormatted = `(${balance >= 3 ? '+' : ''}${balance-3})`;
    sheetData.data.data.principleFormatted = `+${balance}`;
  }

  /**
   * Organize and classify Items for Companion sheets.
   *
   * @param {Object} sheetData The sheet containing the actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(sheetData) {
    const actorData = sheetData.actor;

    const techniques = [];
    const statuses = [];
    const moves = [];

    // Iterate through items, allocating to containers
    for (let i of sheetData.items) {
      i.img = i.img || DEFAULT_TOKEN;
      if (i.type === 'technique') {
        techniques.push(i);
      }
      else if (i.type === 'status') {
        statuses.push(i);
      }
      else if (i.type === 'move') {
        moves.push(i);
      }
    }

    actorData.moves = moves;
    actorData.techniques = {
      'd&m': techniques.filter((technique) => technique.data.approach === "d&m"),
      'a&a': techniques.filter((technique) => technique.data.approach === "a&a"),
      'e&o': techniques.filter((technique) => technique.data.approach === "e&o")
    };
    actorData.statuses = statuses;
  }

  /* -------------------------------------------- */

  /**
   * Handles rolling a statistic like "Creativity" when clicking on its name.
   * @private
   */
  async _onStatisticRoll(ev) {
    ev.preventDefault();
    ev.stopPropagation();

    const button = $(ev.currentTarget);
    const statistic = button.data("statistic");
    const principle = button.data("principle");
    let title = button.data("title") || game.i18n.localize(statistic ? `SIMPLE.${statistic}` : this.actor.data.data[`principle${principle}`]);
    let diceExpression;
    if (statistic) {
      diceExpression = `2d6 + ${this.actor.data.data.statistics[statistic].value}`
    } else if (principle) {
      diceExpression = `2d6 + ${principle === "Yin" ? 3 - this.actor.data.data.balance.value : this.actor.data.data.balance.value - 3}`;
    }
    diceExpression = diceExpression.replace('+ -', '- ');

    // Modify the dice expression based on conditions
    const conditionPenalties = {
      afraid: ["Intimidate", "Call Someone Out"],
      angry: ["Guide and Comfort", "Assess a Situation"],
      guilty: ["Push Your Luck", "Deny a Callout"],
      insecure: ["Trick", "Resist Shifting Your Balance"],
      troubled: ["Plead", "Rely on Your Skills and Training"]
    };
    for (var condition in conditionPenalties) {
      if (this.actor.data.data.conditions[condition] && conditionPenalties[condition].includes(title)) {
        diceExpression += ` - 2`;
      }
    }

    const r = await new Roll(diceExpression).evaluate({ async: true });

    let tier;
    if (r.total >= 10) {
      tier = game.i18n.localize("SIMPLE.StrongHit");
    } else if (r.total >= 7) {
      tier = game.i18n.localize("SIMPLE.WeakHit");
    } else {
      tier = game.i18n.localize("SIMPLE.Miss");
    }

    const diceTotal = (r?.terms?.[0]?.results?.[0]?.result + r?.terms?.[0]?.results?.[1]?.result);
    let result;
    if (diceTotal === 12) {
      result = '<img src="/systems/avatarlegends/images/ui/avatarstate.webp" />';
    } else if (diceTotal === 2) {
      result = '<img src="/systems/avatarlegends/images/ui/thatsroughbuddy.webp" />';
    } else {
      result = `<span class="avatarlegends result ${r.total >= 10 ? "stronghit" : r.total >= 7 ? "weakhit" : "miss"}">${tier}</span>`;
    }

    await r.toMessage({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `<h2>${title}</h2>${result}`
    });
  }

  /* -------------------------------------------- */

  /**
   * Shows/hides item (move/etc.) summaries when clicking on item names.
   * @private
   */
  _onItemNameClick(event) {
    event.preventDefault();
    let li = $(event.currentTarget).parents(".item");
    let item = this.actor.items.get(li.data("item-id"));
    if (!item) {
      return;
    }

    // Toggle summary
    if (li.hasClass("item-expanded")) {
      let summary = li.children(".item-summary");
      summary.slideUp(200, () => summary.remove());
    } else {
      let div = $(`<div class="item-summary">${item.data.data.description}</div>`);
      li.append(div.hide());
      div.slideDown(200);
    }
    li.toggleClass("item-expanded");
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  activateListeners(html) {
    super.activateListeners(html);

    if (this.actor.isOwner) {
      // Roll when clicking the name of a statistic, or on a principle's roll button.
      html.find(".rollable").on("click", this._onStatisticRoll.bind(this));
    }

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Handle clicks on "track" elements and update the underlying values.
    html.find(".track-element").click(ev => {
      const valueName = $(ev.currentTarget).parents(".track").data("valueName");
      const delta = ev.currentTarget.classList.contains("subtract") ? -1 : 1;
      this.actor.modifyValue(valueName, delta);
    });

    // Handle specifically right-clicks on the balance track and update the actor's center
    html.find(".balance-track-element").on("contextmenu", ev => {
      const center = $(ev.currentTarget).data("value");
      this.actor.update({ data: { balance: { center }}});
    });

    // Handle PCs and NPCs checking their condition checkboxes
    html.find(".condition-checkbox").click(ev => {
      const conditionIndex = $(ev.currentTarget).parent().data('condition-index');;
      let conditions;
      if (this.actor.data.type === "companion") {
        conditions = this.actor.data.data.conditions;
        conditions[conditionIndex] = !!ev.currentTarget.checked;
      } else {
        conditions = [...this.actor.data.data.conditions];
        conditions[conditionIndex].checked = !!ev.currentTarget.checked;
      }
      this.actor.update({ data: { conditions }});
    });

    // Show/hide item (move/condition/etc) summaries when clicking on item names.
    html.find('.item-list .item .item-name').click(ev => this._onItemNameClick(ev));

    // Add Inventory Item
    html.find('.item-create').click(ev => {
      ev.preventDefault();
      const button = $(ev.currentTarget);
      const approach = button.data('approach');
      const data = approach ? { approach } : {};

      // TODO: Consolidate this with the similar list in simple.js.
      const DEFAULT_MOVE_ICON = "icons/svg/book.svg"
      const DEFAULT_CONDITION_ICON = "icons/svg/chest.svg";
      const DEFAULT_TECHNIQUE_ICON = "icons/svg/combat.svg";
      const DEFAULT_STATUS_ICON = "icons/svg/statue.svg";

      // The incoming type will be a localization key like "Moves", but
      // we need an item type like "move".
      const headerType = $(ev.currentTarget).data("type");
      const entry = {
        Moves: { type: "move", img: DEFAULT_MOVE_ICON },
        Techniques: { type: "technique", img: DEFAULT_TECHNIQUE_ICON },
        Statuses: { type: "status", img: DEFAULT_STATUS_ICON },
      }[headerType];

      const itemData = {
        name: game.i18n.format("SIMPLE.NewItem"),
        type: entry.type,
        img: entry.img,
        data
      };
      return this.actor.createEmbeddedDocuments("Item", [itemData]);
    });

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(async (ev) => {
      const li = $(ev.currentTarget).parents(".item");
      await this.actor.deleteEmbeddedDocuments("Item", [li.data("itemId")]);
      li.slideUp(200, () => this.render(false));
    });
  }

  /* -------------------------------------------- */

  /**
   * @inheritdoc
   * Called when the sheet window is moved or resized.
   */
  setPosition(options={}) {
    const position = super.setPosition(options);

    // Let any tab bodies know that the viewport has changed.
    const tabBodies = this.element.find(".tab-content .tab");
    if (tabBodies.length > 0) {
      // See how much of the window height belongs to the tabs. Assumes that all
      // tab bodies have the same y position.
      //
      // Use the `offsetTop` of the tab body's parent element (typically a div
      // that contains all bodies for the tab group) in case tab body zero is
      // currently hidden. Note that this offset is relative to `this.element`
      // since we looked up the tab using `this.element.find`.
      const tabHeight = position.height - tabBodies[0].parentElement.offsetTop;
      tabBodies.css("height", tabHeight);
    }

    return position;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  _updateObject(event, formData) {
    // TODO: Replace this with _getSubmitData().

    // Lets us intercept edits before sending to the server.
    // formData contains name/value pairs from <input> elements etc. in the form.

    // Handle NPCs updating their condition names
    if (this.actor.data.type !== "companion") {
      let conditions = [...this.actor.data.data.conditions];
      for (var key in formData) {
        if (key.indexOf('condition-name-') === 0) {
          // 'condition-name' is 15 characters long, so .substring(15) gets the number after it
          conditions[key.substring(15)].name = formData[key];
          delete formData[key];
        }
      }
      formData['data.conditions'] = conditions;
    }

    // Update the Actor
    return this.object.update(formData);
  }
}
