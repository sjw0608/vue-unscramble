import { mergeOptions } from "../util/index"
import { initExtend } from "./extend"
export function initGlobalApi(Vue) {
    Vue.options = {}
    Vue.mixin = function (mixin) {
        // 合并对象
        this.options = mergeOptions(this.options, mixin)
    }
    
    Vue.options._base = Vue // _base 最终的vue的构造函数 保留在options对象中
    Vue.options.components = {} // 全局组件

    initExtend(Vue)

    Vue.component = function (id, definition) {
        // Vue.extend
        definition.name = definition.name || id // 默认会以name属性为准
        // 根据当前组件对象生成一个子类的构造函数
        // 用的时候得 new definition().$mount()
        definition = this.options._base.extend(definition) // 永远是父类
        // Vue.component组册组件等价于Vue.options.components[id] = definition
        Vue.options.components[id] = definition
    }
}
