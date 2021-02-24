let callbacks = []
function flushCallback() {
    callbacks.forEach(cb => cb()) // 让nextTick中传入的方法依次执行
    callbacks = [] // 清空会掉队列
    pending = false // 标识已经执行完毕
}
let timerFunc

if (Promise) {
    timerFunc = () => {
        Promise.resolve().then(flushCallback) // 异步处理更新
    }
} else if (MutationObserver) { // 监听DOM的变化，监控完毕后是异步更新
    let observe = new MutationObserver(flushCallback)
    let textNode = document.createTextNode(1) // 先创建一个文本节点
    observe.observe(textNode, { characterData: true }) // 观测文本节点中的内容
    timerFunc = () => {
        textNode.textContent = 2 // 文本中的内容改变成2
    }
} else if (setImmediate) {
    timerFunc = () => {
        setImmediate(flushCallback)
    }
} else {
    timerFunc = () => {
        setTimeout(flushCallback)
    }
}

let pending = false
export function nextTick(cb) { // 因为内部会调用 用户也会调用但是异步只需要一次
    callbacks.push(cb)
    // Vue3 里的nextTick的原理就是 Promise.then 没有做兼容处理
    // Promise.resolve.then()
    if (!pending) {
        timerFunc() // 这个方法是异步方法 做了兼容处理
        pending = true
    }
}