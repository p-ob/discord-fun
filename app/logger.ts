export class Logger {
  private constructor() {
    // left empty on purpose
  }

  static log(message: string, ...args: any[]) {
    const now = new Date();
    console.log(`${now.toISOString()}: ${message}`, args);
  }

  static warn(message: string, ...args: any[]) {
    const now = new Date();
    console.warn(`${now.toISOString()}: ${message}`, args);
  }

  static error(message: string, ...args: any[]) {
    const now = new Date();
    console.error(`${now.toISOString()}: ${message}`, args);
  }
}
