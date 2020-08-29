import { minutesToMilliseconds, awaitTimeout } from "./common.js";

export default class InfiniteClock {
  constructor() {
    this._cancel = false;
    this._cancellationRequested = false;
    this._completed = false;
    this._task = undefined;
    this._running = false;
  }

  get running() {
    return this._running;
  }

  /**
   * Represents the Promise of the running clock (when resolved, the clock has terminated)
   * @type {Promise<void>}
   */
  get runComplete() {
    return this._task;
  }

  get completed() {
    return this._completed;
  }

  get cancelled() {
    return this._cancel;
  }

  get cancellationRequested() {
    return this._cancellationRequested;
  }

  cancel() {
    this._cancellationRequested = true;
    this._cancel = true;
    return this._task;
  }

  /**
   *
   * @param {Function} callback
   * @returns {Promise<void>}
   */
  start(callback) {
    this._completed = false;
    // eslint-disable-next-line no-async-promise-executor
    return (this._task = new Promise(async (resolve) => {
      this._running = true;
      while (!this._cancel) {
        const maxDelay = minutesToMilliseconds(10);
        const minDelay = minutesToMilliseconds(1);
        const delay =
          Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
        console.log(
          `Prepare yourself... something gonna happen in ${delay}ms.`
        );
        await awaitTimeout(delay);
        callback();
      }
      this._cancellationRequested = false;
      this._running = false;
      this._completed = true;
      resolve();
    }));
  }
}
