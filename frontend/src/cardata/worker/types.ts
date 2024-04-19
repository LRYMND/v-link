export type Command =
  | { type: 'hello' }

export interface CANWorker
  extends Omit<Worker, 'postMessage' | 'onmessage'> {
  postMessage(message: Command, transfer?: Transferable[]): void
  onmessage: ((this: Worker, msg: CardataMessage) => any) | null
}

export interface ADCWorker
  extends Omit<Worker, 'postMessage' | 'onmessage'> {
  postMessage(message: Command, transfer?: Transferable[]): void
  onmessage: ((this: Worker, msg: CardataMessage) => any) | null
}