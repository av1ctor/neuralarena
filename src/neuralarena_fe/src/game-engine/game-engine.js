let wasm;

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

let WASM_VECTOR_LEN = 0;

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8Memory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

let cachedFloat32Memory0 = null;

function getFloat32Memory0() {
    if (cachedFloat32Memory0 === null || cachedFloat32Memory0.byteLength === 0) {
        cachedFloat32Memory0 = new Float32Array(wasm.memory.buffer);
    }
    return cachedFloat32Memory0;
}

function getArrayF32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat32Memory0().subarray(ptr / 4, ptr / 4 + len);
}

let cachedUint32Memory0 = null;

function getUint32Memory0() {
    if (cachedUint32Memory0 === null || cachedUint32Memory0.byteLength === 0) {
        cachedUint32Memory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32Memory0;
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getUint32Memory0();
    const slice = mem.subarray(ptr / 4, ptr / 4 + len);
    const result = [];
    for (let i = 0; i < slice.length; i++) {
        result.push(takeObject(slice[i]));
    }
    return result;
}
/**
*/
export const AssetType = Object.freeze({ Map:0,"0":"Map",Player:1,"1":"Player",Npc:2,"2":"Npc",Object:3,"3":"Object", });
/**
*/
export class GameEngine {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_gameengine_free(ptr);
    }
    /**
    */
    constructor() {
        const ret = wasm.gameengine_new();
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
    /**
    * @param {Uint8Array} entities
    * @param {Uint8Array} events
    * @param {any} renderer
    */
    render(entities, events, renderer) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(entities, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(events, wasm.__wbindgen_malloc);
            const len1 = WASM_VECTOR_LEN;
            wasm.gameengine_render(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, addHeapObject(renderer));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {any} renderer
    */
    reset(renderer) {
        wasm.gameengine_reset(this.__wbg_ptr, addHeapObject(renderer));
    }
}
/**
*/
export class InstanceNpcEntity {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(InstanceNpcEntity.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_instancenpcentity_free(ptr);
    }
    /**
    * @returns {number}
    */
    get health() {
        const ret = wasm.__wbg_get_instancenpcentity_health(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set health(arg0) {
        wasm.__wbg_set_instancenpcentity_health(this.__wbg_ptr, arg0);
    }
}
/**
*/
export class InstanceObjectEntity {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_instanceobjectentity_free(ptr);
    }
}
/**
*/
export class InstancePlayerEntity {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(InstancePlayerEntity.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_instanceplayerentity_free(ptr);
    }
    /**
    * @returns {number}
    */
    get health() {
        const ret = wasm.__wbg_get_instancenpcentity_health(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set health(arg0) {
        wasm.__wbg_set_instancenpcentity_health(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get score() {
        const ret = wasm.__wbg_get_instanceplayerentity_score(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set score(arg0) {
        wasm.__wbg_set_instanceplayerentity_score(this.__wbg_ptr, arg0);
    }
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_instanceplayerentity_new = function(arg0) {
        const ret = InstancePlayerEntity.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_instancenpcentity_new = function(arg0) {
        const ret = InstanceNpcEntity.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_addmodel_f6997202159a608a = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).add_model(arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_showmodel_984dba51d7296828 = function(arg0, arg1) {
        getObject(arg0).show_model(arg1 >>> 0);
    };
    imports.wbg.__wbg_hidemodel_2e2be18d5a994e7b = function(arg0, arg1) {
        getObject(arg0).hide_model(arg1 >>> 0);
    };
    imports.wbg.__wbg_setmodelposition_3470d17caab31503 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).set_model_position(arg1 >>> 0, getArrayF32FromWasm0(arg2, arg3));
    };
    imports.wbg.__wbg_setmodelrotation_7930e4ba2a204444 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).set_model_rotation(arg1 >>> 0, getArrayF32FromWasm0(arg2, arg3));
    };
    imports.wbg.__wbg_changemodelstate_4abe6296bb9a45b2 = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        let deferred0_0;
        let deferred0_1;
        let deferred1_0;
        let deferred1_1;
        try {
            deferred0_0 = arg2;
            deferred0_1 = arg3;
            deferred1_0 = arg4;
            deferred1_1 = arg5;
            getObject(arg0).change_model_state(arg1 >>> 0, getStringFromWasm0(arg2, arg3), getStringFromWasm0(arg4, arg5));
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    };
    imports.wbg.__wbg_setplayers_13d5e2c831b5a6a3 = function(arg0, arg1, arg2) {
        var v0 = getArrayJsValueFromWasm0(arg1, arg2).slice();
        wasm.__wbindgen_free(arg1, arg2 * 4, 4);
        getObject(arg0).set_players(v0);
    };
    imports.wbg.__wbg_setnpcs_9533a792c366c101 = function(arg0, arg1, arg2) {
        var v0 = getArrayJsValueFromWasm0(arg1, arg2).slice();
        wasm.__wbindgen_free(arg1, arg2 * 4, 4);
        getObject(arg0).set_npcs(v0);
    };
    imports.wbg.__wbg_render_12c25d7ca4a88162 = function(arg0) {
        getObject(arg0).render();
    };
    imports.wbg.__wbg_reset_3b4530a524b5ae29 = function(arg0) {
        getObject(arg0).reset();
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };

    return imports;
}

function __wbg_init_memory(imports, maybe_memory) {

}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedFloat32Memory0 = null;
    cachedInt32Memory0 = null;
    cachedUint32Memory0 = null;
    cachedUint8Memory0 = null;


    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;

    const imports = __wbg_get_imports();

    __wbg_init_memory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(input) {
    if (wasm !== undefined) return wasm;

    if (typeof input === 'undefined') {
        input = new URL('game-engine_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }

    __wbg_init_memory(imports);

    const { instance, module } = await __wbg_load(await input, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync }
export default __wbg_init;
