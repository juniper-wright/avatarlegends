/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class SimpleActor extends Actor {

  /** @override */
  getRollData() {
    // TODO: "Prepare a data object which defines the data schema used by dice
    //     roll commands against this Actor"
    const data = super.getRollData();
    return data;
  }

  /**
   * Modify an actor value or boolean.
   *
   * @param {string} valueName The name of the value to change;
   *     e.g., "harm" or "unstable".
   * @param {int} delta Added to the current value. Booleans are treated
   *     as a 0..1 value.
   */
  modifyValue(valueName, delta) {
    const valueObject = this.data.data[valueName];
    var val;
    const data = {"data": {}};
    if (typeof valueObject === "boolean") {
      val = (valueObject ? 1 : 0) + delta;
      data.data[valueName] = val < 1 ? false : true;
    } else {
      data.data[valueName] = {"value": valueObject.value + delta};
    }
    this.update(data);
  }
}
