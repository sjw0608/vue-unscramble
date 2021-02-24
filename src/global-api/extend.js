import { mergeOptions } from "../util/index"

export function initExtend(Vue) {
    // 核心是创建一个子类继承我们的父类
    let cid = 0
    Vue.extend = function (extendOptions) {
        // 如果对象相同 应该复用构造函数
        const Supper = this
        const Sub = function VueComponent(options) {
            this._init(options)
        }
        Sub.cid = ++cid
        // 子类要继承父类原型上的方法
        Sub.prototype = Object.create(Supper.prototype)
        Sub.prototype.constructor = Sub
        Sub.options = mergeOptions(Supper.options, extendOptions)
        Sub.components = Supper.components

        return Sub
    }
}

// 组件的渲染流程
// 1.调用Vue.component
// 2.内部用的是Vue.extend 就是生成一个子类来继承父类
// 3.等会创建子类实例是会调用父类的 _init 方法 再去 $mount()即可
// 4.组件的初始化就是new这个组件的构造函数 并且调用$mount()方法
// 5.创建虚拟节点 根据标签筛出对应组件 生成组件的虚拟节点 componentsOptions 里面包含 Ctor children
// 6.组件创建真实DOM时 （先渲染的时父组建）遇到是组件的虚拟节点是去调用 init方法，让组件初始化并挂载 组件的$mount 无参数会把渲染后的dom放到 vm.$el上- 》 vnode.componentInstance中，这样渲染时就获取这个对象的$el属性来渲染
