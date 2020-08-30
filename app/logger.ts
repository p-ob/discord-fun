export class Logger {
  private constructor() {
    // left empty on purpose
  }

  static log(message: string, ...args: any[]) {
    const now = new Date();
    Logger.log(`${now.toISOString()}: ${message}`, args);
  }
}
