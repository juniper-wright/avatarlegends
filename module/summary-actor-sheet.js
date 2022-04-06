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
      this.actor.render(true)
    }, 5000);

    // This is the object that determines the namespace
    // seen by the HTML templates.
    return context;
  }
}
