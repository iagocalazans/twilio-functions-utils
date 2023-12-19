
declare namespace Twilio {
    export class Response {
      constructor(data: Record<string, any>)
      appendHeader(header: string, data: string): void
      setBody(body: any): void
      setStatusCode(code: number): void
    }

    export function mockRequestResolvedValue(value: any) : any
    export function mockRequestRejectedValue(value: any) : any
  }

  declare class Runtime {
    static getFunctions(): Record<string, {path: string}>
    static getAssets(): Record<string, {path: string}>
    static getSync(): Sync
  }

 
interface Sync {
  create: (data: SyncInstance["data"]) => Promise<Sync>
  maps: (id: string) => Sync
  syncMapItems: Sync & ((id: string) => Sync)
  fetch: () => Promise<SyncInstance>
}
interface SyncInstance {
  data: Record<string, any>
  update:(data: any) => Promise<SyncInstance>
}