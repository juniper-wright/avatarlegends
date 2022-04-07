/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class SummaryActorSheet extends ActorSheet {

  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["avatarlegends", "sheet", "actor"],
      template: "systems/avatarlegends/templates/summary-actor-sheet.html",
      width: 700,
      height: 300,
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
    context.companions = game.actors.filter((actor) => {
      return actor?.data?.type === "companion";
    }).map((companion) => companion?.data);

    setTimeout(() => {
      this.actor.render(true);
    }, 5000);

    // This is the object that determines the namespace
    // seen by the HTML templates.
    return context;
  }

  /** @inheritdoc */
  activateListeners(html) {
    super.activateListeners(html);

    html.find(".principle-button").on("click", this._onPrincipleRoll.bind(this));
  }


  /**
   * Handles rolling with a player's principle when clicking on its name.
   * @private
   */
  async _onPrincipleRoll(ev) {
    ev.preventDefault();
    ev.stopPropagation();

    const button = $(ev.currentTarget);
    const title = button.data("name");
    const modifier = button.data("value");

    const r = await new Roll(`2d6 + ${modifier}`.replace('+ -', '- ')).evaluate({ async: true });

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
      speaker: ChatMessage.getSpeaker(),
      flavor: `<h2>${title}</h2>${result}`
    });
  }
}
