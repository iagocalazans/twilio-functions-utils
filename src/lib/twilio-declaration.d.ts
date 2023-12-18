
declare namespace Twilio {
    export class Response {
      constructor(data: Record<string, any>)
      appendHeader(header: string, data: string): void
      setBody(body: any): void
      setStatusCode(code: number): void
    }
  }

  declare class Runtime {
    static getFunctions(): Record<string, {path: string}>
    static getAssets(): Record<string, {path: string}>
  }