import { minutesToMilliseconds, awaitTimeout } from "./common.js";

export default class InfiniteClock {
  constructor() {
    this._cancellationRequested = false;
    this._completed = false;
    this._task = undefined;
    this._running = false;
    this._cancellationToken = undefined;
    this._resolveCancellation = undefined;
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
   * @param {Function} callback - The function to execute on every randomize-d tick of the clock
   * @param {object} options - Optional options for configuration; if delay is set, time randomization will be disabled
   *
   * @returns {Promise<void>} - A promise that resolves when the clock is cancelled or restarted
   */
  async run(
    callback,
    { minMs, maxMs, delayMs } = {
      minMs: minutesToMilliseconds(1),
      maxMs: minutesToMilliseconds(10),
      delayMs: undefined,
    }
  ) {
    await this.cancel();
    this._makeCancellationToken();
    this._completed = false;
    this._cancellationRequested = false;
    // eslint-disable-next-line no-async-promise-executor
    return (this._task = new Promise(async (resolve) => {
      this._running = true;
      do {
        delayMs =
          delayMs ?? Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
        console.log(
          `Prepare yourself... something gonna happen in ${delayMs}ms.`
        );
        await Promise.race(awaitTimeout(delayMs), this._cancellationToken);
        if (!this._cancellationRequested) {
          callback();
        }
      } while (!this._cancellationRequested);
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
    this._resolveCancellation?.();
    return this._task;
  }
}
