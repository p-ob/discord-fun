import { minutesToMilliseconds, awaitTimeout } from "./common.js";

export default class InfiniteClock {
  constructor() {
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

  get cancellationRequested() {
    return this._cancellationRequested;
  }

  /**
   *
   * @param {Function} callback
   * @returns {Promise<void>}
   */
  run(callback) {
    this._completed = false;
    this._cancellationRequested = false;
    // eslint-disable-next-line no-async-promise-executor
    return (this._task = new Promise(async (resolve) => {
      this._running = true;
      while (!this._cancellationRequested) {
        const maxDelay = minutesToMilliseconds(10);
        const minDelay = minutesToMilliseconds(1);
        const delay =
          Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
        console.log(
          `Prepare yourself... something gonna happen in ${delay}ms.`
        );
        let ms = 0;
        const interval = 10;
        do {
          awaitTimeout(interval);
          ms += interval;
        } while (ms <= delay && !this._cancellationRequested);
        if (!this._cancellationRequested) {
          callback();
        }
      }
      this._cancellationRequested = false;
      this._running = false;
      this._completed = true;
      resolve();
    }));
  }

  /**
   * Requests the running clock to cancel
   * You can await the result of this action to know when the clock has safely terminated
   */
  cancel() {
    this._cancellationRequested = true;
    return this._task;
  }
}
