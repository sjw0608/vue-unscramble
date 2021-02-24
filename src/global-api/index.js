
export function initGlobalApi(Vue) {
    Vue.options = {}
    Vue.mixin = function (mixin) {
        // 合并对象
        this.options = mergeOptions(this.options, mixin)
    }
}

export const LIFECYCLE_HOOKS = [
    'beforrCreated',
    'created',
    'beforeMount',
    'mountd',
    'beforeUpdate',
    'updated',
    'beforeDestory',
    'destoryed'
]

// 策略模式
const strats = {}
strats.data = function (parentVal, childVal) {
    return childVal
}
// strats.computed = function () { }
// strats.watch = function () { }
// 生命周期的合并
function mergeHook(parentVal, childVal) {
    if (childVal) {
        if (parentVal) {
            return parentVal.concat(childVal) // 爸爸和儿子进行拼接
        } else {
            return [childVal] // 儿子需要转化称数组
        }
    } else {
        return parentVal // 不合并 采用父亲的
    }
}

LIFECYCLE_HOOKS.forEach(hook => {
    strats[hook] = mergeHook
})

export function mergeOptions(parent, child) {
    let options = {}
    // 遍历父亲，可能父亲有，儿子没有
    for (let key in parent) { // 父亲和儿子都在这处理
        mergeField(key)
    }
    // 儿子有，父亲没有
    for (let key in child) {
        // 将儿子多的赋予到父亲上
        if (!parent.hasOwnProperty(key)) {
            mergeField(key)
        }
    }
    // 合并字段
    function mergeField(key) {
        //  根据key不同的策略来进行合并
        if (strats[key]) {
            options[key] = strats[key](parent[key], child[key])
        } else {
            options[key] = child[key]
        }
    }
    return options
}