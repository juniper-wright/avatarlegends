/**
 * Extend the base Item entity to specify a default image.
 * @extends {Item}
 */
export class AvatarLegendsItem extends Item {

  /** @override */
  constructor(data) {
    super(data);
    // Only do this once so it doesn't overwrite all images when the server boots
    if (!data.data.updatedImg) {
      this.update({ img: this._getImgByType(data.type), data: { updatedImg: true }});
    }
  }

  _getImgByType(type) {
    switch(type) {
      case "technique":
        return "/systems/avatarlegends/images/icons/technique.svg";
      case "move":
        return "/systems/avatarlegends/images/icons/move.svg";
      case "status":
        return "/systems/avatarlegends/images/icons/status.svg";
      default:
        return "icons/svg/item-bag.svg";
    }
  }
}
