/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class SimpleActorSheet extends ActorSheet {

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
    context.systemData = context.data.data;
    context.isCompanion = this.actor.data.type === "companion";

    this._preparePrinciples(context);
    this._prepareItems(context);
    if (this.actor.data.type === 'companion') {
      this._prepareCompanionRatings(context);
    }

    // This is the object that determines the namespace
    // seen by the HTML templates.
    return context;
  }

  /**
   * Adds '+' in front of positive ratings.
   *
   * @param {Object} sheetData The sheet containing the actor to prepare.
   */
  _prepareCompanionRatings(sheetData) {
    let ratings = sheetData.data.data.ratings;
    for (let key in ratings) {
      if (ratings.hasOwnProperty(key)) {
        let rating = ratings[key];
        if (rating.hasOwnProperty("value") && rating.value > 0) {
          rating.value = "+" + rating.value;
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
    actorData.techniques = techniques;
    actorData.statuses = statuses;
  }

  /* -------------------------------------------- */

  /**
   * Handles rolling a rating like "Cool" when clicking on its name.
   * @private
   */
  async _onRatingRoll(ev) {
    ev.preventDefault();
    ev.stopPropagation();

    const button = $(ev.currentTarget);
    const move = button.data("title");
    const rating = button.data("rating");
    const principle = button.data("principle");
    let diceExpression;
    if (rating) {
      diceExpression = `2d6 + ${this.actor.data.data.ratings[rating].value}`
    } else if (principle) {
      diceExpression = `2d6 + ${principle === "Yin" ? 3 - this.actor.data.data.balance.value : this.actor.data.data.balance.value - 3}`;
    }
    diceExpression = diceExpression.replace('+ -', '- ');

    // Modify the dice expression based on conditions
    console.log('MOVE:', move);
    console.log('CONDITIONS:', this.actor.data.data.conditions);

    const r = await new Roll(diceExpression).evaluate({ async: true });

    let tier;
    if (r.total >= 10) {
      tier = game.i18n.localize("SIMPLE.StrongHit");
    } else if (r.total >= 7) {
      tier = game.i18n.localize("SIMPLE.WeakHit");
    } else {
      tier = game.i18n.localize("SIMPLE.Miss");
    }

    let title = button.data("title");
    if (!title) {
      title = game.i18n.localize(rating ? `SIMPLE.${rating}` : this.actor.data.data[`principle${principle}`]);
    }

    const diceTotal = (r?.total - r?.terms?.[2]?.number);
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
      console.log('DESCRIPTION:', item.data.data.description);
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
      // Roll when clicking the name of a rating, or on a principle's roll button.
      html.find(".rollable").on("click", this._onRatingRoll.bind(this));
    }

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Handle clicks on "track" elements and update the underlying values.
    html.find(".track-element").click(ev => {
      const valueName = $(ev.currentTarget).parents(".track").data("valueName");
      const delta = ev.currentTarget.classList.contains("subtract") ? -1 : 1;
      this.actor.modifyValue(valueName, delta);
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
        Conditions: { type: "condition", img: DEFAULT_CONDITION_ICON },
      }[headerType];

      const itemData = {
        name: game.i18n.format("SIMPLE.NewItem"),
        type: entry.type,
        img: entry.img,
        data: {}
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
