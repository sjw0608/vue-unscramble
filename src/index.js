import { initMixin } from "./init"
import { lifecycleMixin } from "./lifecycle"
import { renderMixin } from "./vdom/index"
import { initGlobalApi } from './global-api/index';
import { stateMixin } from "./state";
// 用Vue的构造函数 创建组件
function Vue(options) {
    this._init(options) // 组件初始化的入口
}

// 原型方法
initMixin(Vue) // init 方法
lifecycleMixin(Vue) // 混合生命周期 渲染 _update
renderMixin(Vue) // _render
stateMixin(Vue)

// 静态方法
initGlobalApi(Vue)

export default Vue