export type Command =
  | { type: 'hello' }

export interface CarDataWorker
  extends Omit<Worker, 'postMessage' | 'onmessage'> {
  postMessage(message: Command, transfer?: Transferable[]): void
  onmessage: ((this: Worker, msg: CardataMessage) => any) | null
}