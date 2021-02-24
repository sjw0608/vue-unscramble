import { compileToFunctions } from "./compiler/index";
import { mergeOptions } from "./util/index";
import { callHook, mountComponent } from "./lifecycle";
import { initState } from "./state";

export function initMixin(Vue) {

    Vue.prototype._init = function (options) {
        const vm = this
        vm.$options = mergeOptions(vm.constructor.options,options) // 需要将用户自定义的options 和全局的options合并
        callHook(vm,'beforeCreate')
        initState(vm) // 初始化状态
        callHook(vm,'created')
        // 挂载逻辑
        if (vm.$options.el) {
            this.$mount(vm.$options.el)
        }
    }

    Vue.prototype.$mount = function (el) {
        const vm = this
        const options = vm.$options
        el = document.querySelector(el)

        if (!options.render) {
            // 没有render 将template转换成render方法
            let template = options.template
            // 如果没有template 就是用外部的模版
            if (!template && el) {
                template = el.outerHTML
            }
            // 编译原理将模版编译成render方法
            const render =  compileToFunctions(template)
            options.render = render
        }
        // 挂载这个组件
        mountComponent(vm,el)

    }
}