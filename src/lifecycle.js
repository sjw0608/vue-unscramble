import Watcher from "./observe/watcher"
import { patch } from "./vdom/patch"

export function lifecycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
        const vm = this
        const prevVnode = vm._vnode 
        // 区分首次渲染还是更新
        if (!prevVnode) {
            // 首次渲染
            // 用新的创建的元素 替换掉老的 vm.$el
            vm.$el = patch(vm.$el, vnode)
        }else{
            // 拿上一次的vnode和本次的做比较
            vm.$el = patch(prevVnode, vnode)
        }
        vm._vnode = vnode // 保存上一次的vnode
    }
}

export function mountComponent(vm, el) {
    vm.$el = el
    // 调用render方法渲染 el属性
    callHook(vm, 'beforeMount')
    let updateComponent = () => {
        vm._update(vm._render()) // 渲染 更新
    }
    // 这个 Watcher 是用于渲染的 初始化就会创建watcher
    let watcher = new Watcher(vm, updateComponent, () => {
        callHook(vm, 'updated')
    }, true) // 渲染watcher 只是一个名字

    // 要把属性和watcher绑定到一起

    callHook(vm, 'mounted')
}

export function callHook(vm, hook) {
    const handlers = vm.$options[hook]
    if (handlers) {
        for (let i = 0; i < handlers.length; i++) {
            handlers[i].call(vm) // 更改生命周期中的this
        }
    }
}