/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class SimpleItemSheet extends ItemSheet {

  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["avatarlegends", "sheet", "item"],
      template: "systems/avatarlegends/templates/item-sheet.html",
      width: 520,
      height: 480,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".tab-content",
          initial: "description"
        }
      ]
    });
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  getData() {
    const context = super.getData();
    context.systemData = context.data.data;

    context.isMove = context.item.data.type === "move";
    context.isTechnique = context.item.data.type === "technique";
    context.statistics = ["creativity", "focus", "harmony", "passion"];
    context.approaches = ["d&m", "a&a", "e&o"];
    context.trainings = ["waterbending", "airbending", "earthbending", "firebending", "weapons", "technology"];
    context.masterys = ["basic", "learned", "practiced", "mastered"];

    // This is the object that determines the namespace
    // seen by the HTML templates.
    return context;
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
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // TODO: Bind onclick handlers
    // html.find(".attributes").on("click", ".attribute-control", this._onClickAttributeControl.bind(this));
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  _updateObject(event, formData) {
    // TODO: Replace this with _getSubmitData().

    // Lets us intercept edits before sending to the server.
    // formData contains name/value pairs from <input> elements etc. in the form.

    // Remove extra leading/trailing/internal spaces from tags.
    if (formData.hasOwnProperty("data.tags")) {
      let tags = formData["data.tags"].replace(/\s+/g,' ').trim();
      formData["data.tags"] = tags;
    }

    // Update the Item
    return this.object.update(formData);
  }
}
