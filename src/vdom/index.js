import { isReservedTag } from "../util/index"

export function renderMixin(Vue) { // 用对象来描述DOM结构
    Vue.prototype._c = function () {
        // 创建元素
        return createElement(this, ...arguments)
    }
    Vue.prototype._s = function (val) {
        // stringify
        return val == null ? '' : (typeof val == 'object' ? JSON.stringify(val) : val)
    }
    Vue.prototype._v = function (text) {
        // 创建文本元素
        return createTextVnode(text)
    }

    Vue.prototype._render = function () {
        const vm = this
        const render = vm.$options.render
        let vnode = render.call(vm)
        return vnode
    }
}

function createElement(vm, tag, data = {}, ...children) {
    // 如果是组件 产生虚拟节点是 需要把组件的构造函数传入
    // 判断标签是否是原生标签
    if (isReservedTag(tag)) {
        return vnode(tag, data, data.key, children)
    } else {
        let Ctor = vm.$options.components[tag]
        // 创建组件的虚拟节点 children 就是组件的插槽
        return createComponent(vm, tag, data, data.key, children, Ctor)
    }

}

function createComponent(vm, tag, data, key, children, Ctor) {
    const baseCtor = vm.$options._base
    if (typeof Ctor == 'object') {
        Ctor = this.baseCtor.extend(Ctor)
    }
    // 给组件添加生命周期
    data.hook = { // 稍后初始化的时候 会调用此init方法
        init(vnode) {
            let child = vnode.componentInstance = new Ctor({})
            child.$mount() // 挂载逻辑 组件的$mount 方法中是不传递参数的
            // vnode.componentInstance.$el 指代的是当前组件的真是DOM
        }
    }

    return vnode(`vue-component-${Ctor.cid}-${tag}`, data, key, undefined, undefined, { Ctor, children })
}

function createTextVnode(text) {
    // console.log(text);
    return vnode(undefined, undefined, undefined, undefined, text)
}
// 产生虚拟dom
function vnode(tag, data, key, children, text, componentsOptions) {
    return {
        tag,
        data,
        key,
        children,
        text,
        componentsOptions // 组件的虚拟节点 他多了一个componentsOptions 属性 用来保存当前组件的构造函数和他的插槽
    }
}