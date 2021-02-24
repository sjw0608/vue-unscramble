import Dep from "./observe/dep.js"
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
function initComputed(vm) {
    let computed = vm.$options.computed
    // 1. 需要有watcher
    // 2. 需要通过definePrototype
    // 3. dirty
    const watchers = vm._computedWatchers = {} // 用来稍后存放计算属性的
    for (let key in computed) {
        const userDef = computed[key] // 取出对应的值
        const getter = typeof userDef == 'function' ? userDef : userDef.get
        // 给每个属性添加一个 watcher
        watchers[key] = new Watcher(vm, getter, () => { }, { lazy: true })
        defineComputed(vm, key, userDef)
    }
}
function defineComputed(target, key, userDef) {
    const sharePropertyDefinition = {
        enumerable: true,
        configurable: true,
        get: () => { },
        set: () => { }
    }
    if (typeof userDef == 'function') {
        sharePropertyDefinition.get = createComputedGetter(key) // dirty 来控制是否调用userDef
    } else {
        sharePropertyDefinition.get = createComputedGetter(key) // 需要加缓存
        sharePropertyDefinition.set = userDef.set
    }
    Object.defineProperty(target, key, sharePropertyDefinition)
}

function createComputedGetter(key) {
    // 此方法是我们包装的方法 每次取值会调用此方法
    return function () {
        // 拿到这个属性对应的watcher
        let watcher = this._computedWatchers[key]
        if(watcher){
            if(watcher.dirty){ // 默认肯定是脏的
                watcher.evaluate() // 对当前watcher求值
            }
            if(Dep.target){ // 说明还有渲染watcher 也应该一并的收集起来
                watcher.depend()
            }
            return watcher.value // 默认返回watcher上存放的值
        }
    }
}

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