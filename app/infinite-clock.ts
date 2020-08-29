import { minutesToMilliseconds, awaitTimeout } from "./common.js";

export default class InfiniteClock {
  _cancellationRequested: boolean;
  _completed: boolean;
  _task?: Promise<void>;
  _running: boolean;
  _cancellationToken?: Promise<void>;
  _resolveCancellation?: Function;

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

  _makeCancellationToken() {
    this._cancellationToken = new Promise((resolve) => {
      this._resolveCancellation = resolve;
    });
  }

  async run(
    callback: Function,
    { min, max, delay } = {
      min: minutesToMilliseconds(1) as number | undefined,
      max: minutesToMilliseconds(10) as number | undefined,
      delay: undefined as number | undefined,
    }
  ) {
    await this.cancel();
    this._makeCancellationToken();
    this._completed = false;
    this._cancellationRequested = false;
    // eslint-disable-next-line no-async-promise-executor
    return (this._task = new Promise(async (resolve) => {
      this._running = true;
      while (!this._cancellationRequested) {
        delay = delay ?? Math.floor(Math.random() * (max! - min! + 1)) + min!;
        console.log(`Prepare yourself... something gonna happen in ${delay}ms.`);
        await Promise.race([awaitTimeout(delay), this._cancellationToken]);
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
    this._resolveCancellation?.();
    return this._task;
  }
}