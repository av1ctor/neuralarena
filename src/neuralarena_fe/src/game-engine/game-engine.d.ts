/* tslint:disable */
/* eslint-disable */
/**
*/
export enum AssetType {
  Level = 0,
  Player = 1,
  Npc = 2,
  Object = 3,
}
/**
*/
export class GameEngine {
  free(): void;
/**
*/
  constructor();
/**
* @param {Uint8Array} entities
* @param {Uint8Array} events
* @param {any} renderer
*/
  render(entities: Uint8Array, events: Uint8Array, renderer: any): void;
/**
* @param {any} renderer
*/
  reset(renderer: any): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_gameengine_free: (a: number) => void;
  readonly gameengine_new: () => number;
  readonly gameengine_render: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly gameengine_reset: (a: number, b: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
