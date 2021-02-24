import { mergeOptions } from "../util/index"
export function initGlobalApi(Vue) {
    Vue.options = {}
    Vue.mixin = function (mixin) {
        // 合并对象
        this.options = mergeOptions(this.options, mixin)
    }
}
