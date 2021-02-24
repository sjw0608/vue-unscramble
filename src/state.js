import { observe } from "./observe/index.js"
import Watcher from "./observe/watcher.js"
import { nextTick } from "./util/index.js"

export function initState(vm) {
    const opts = vm.$options
    if (opts.props) {
        initProps(vm)
    }
    if (opts.methods) {
        initMethods(vm)
    }
    if (opts.data) {
        initData(vm)
    }
    if (opts.computed) {
        initComputed(vm)
    }
    if (opts.watch) {
        initWatch(vm)
    }
}
function initProps(vm) { }
function initMethods(vm) { }
function proxy(vm, data, key) {
    Object.defineProperty(vm, key, {
        get() {
            return vm[data][key]
        },
        set(newValue) {
            vm[data][key] = newValue
        }
    })
}
// 初始化Data数据
function initData(vm) {
    let data = vm.$options.data
    // vm._data 保存用户的所有的data
    vm._data = data = typeof data == 'function' ? data.call(vm) : data
    for (let key in data) {
        proxy(vm, '_data', key)
    }
    observe(data) // 让这个对象重新定义set 和 get
}
function initComputed(vm) { }
function initWatch(vm) {
    let watch = vm.$options.watch
    for (let key in watch) {
        const handler = watch[key] // handler 可能是数组、字符串、对象、函数

        if (Array.isArray(handler)) {
            handler.forEach(handle => {
                createWatcher(vm, key, handle)
            })
        } else {
            createWatcher(vm, key, handler) // 字符串、对象、函数
        }
    }
}

function createWatcher(vm, exprOrFn, handler, options) { // 可以用来标识是用户watcher
    if (typeof handler == 'object' && handler != null) {
        options = handler
        handler = handler.handler // 是一个函数
    }
    if (typeof handler == 'string') {
        handler = vm[handler] // 将实例的方法作为handler
    }
    // key handler 用户传入的选项
    return vm.$watch(exprOrFn, handler, options)
}

export function stateMixin(Vue) {
    Vue.prototype.$nextTick = function (cb) {
        nextTick(cb)
    }
    Vue.prototype.$watch = function (exprOrFn, cb, options = {}) {
        let vm = this
        // 数据应该依赖这个watcher 数据变化后应该让watcher重新执行
        let watcher = new Watcher(vm, exprOrFn, cb, { ...options, user: true })
        if (options.immediate) {
            cb() // 如果是immediate应该立即执行
        }
    }
}