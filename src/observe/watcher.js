import { nextTick } from "../util"
import { popTarget, pushTarget } from "./dep"

let id = 0
class Watcher {
    constructor(vm, exprOrFn, cb, options = {}) {
        this.vm = vm // vm实例
        this.exprOrFn = exprOrFn // vm._update(vm._render())
        this.cb = cb
        this.options = options
        this.user = options.user // 这是一个用户watcher
        this.id = id++ // watcher 的唯一表示
        this.dep = [] // 记录有多少dep依赖
        this.depsId = new Set() // 借助set数据结构去重
        if (typeof exprOrFn == 'function') {
            this.getter = exprOrFn
        } else {
            this.getter = function () { // exprOrFn 可能传递过来的是一个字符串
                // 当去当前实例取值是才会触发依赖收集
                let path = exprOrFn.split('.')
                let obj = vm
                for (let i = 0; i < path.length; i++) {
                    obj = obj[path[i]]
                }
                return obj
            }
        }
        // 默认会调用一次get方法，进行取值，将结果保存起来
        this.value = this.get()
    }
    get() {
        pushTarget(this) // 当前watcher的实例
        let result = this.getter() // 调用exprOrFn方法 渲染页面 取值 执行了get方法
        popTarget() // 渲染完将watcher删除
        return result
    }
    run() {
        let newValue = this.get() // 渲染
        let oldValue = this.value
        this.value = newValue // 更新一下老值
        if(this.user){
            this.cb.call(this.vm,newValue,oldValue)
        }
    }
    update() {
        // 这里不要每次都调用get方法，因为get方法会重新渲染页面
        queueWatcher(this) // 暂存概念
        // this.get() // 重新渲染
    }
    addDep(dep) {
        let id = dep.id
        //  去重
        if (!this.depsId.has(id)) {
            this.dep.push(dep)
            this.depsId.add(id)
            dep.addSub(this)
        }
    }
}

let queue = [] // 将需要批量更新的watcher 存放到一个队列中，稍后让watcher执行
let has = {}
let pending = false

function flushSchedulerQueue() {
    queue.forEach(watcher => { 
        watcher.run(); 
        if(!watcher.user){
            watcher.cb()
        } 
    })
    queue = [] // 清空watcher队列 为了下次使用
    has = {} // 晴空标识队列
    pending = false
}

function queueWatcher(watcher) {
    const id = watcher.id
    if (has[id] == null) {
        queue.push(watcher) // 对watcher进行去重
        has[id] = true
        // 等待所有同步代码执行完毕后再执行
        if (!pending) { // 如果还没晴空队列，就不要再开启定时器了 防抖处理
            nextTick(flushSchedulerQueue)
            pending = true
        }
    }
}

export default Watcher

// 在数据劫持的时候，定义defineProperty的时候给每个属性增加了一个Dep

// 1. 先把渲染watcher 放到了Dep.target属性上
// 2. 开始渲染， 取值会调用get方法 需要让这个属性的Dep存储当前的watcher
// 3. 页面上所需要的属性都会将这个watcher存在自己的Dep中
// 4. 等会属性更新了就重新调用渲染逻辑 通知自己存储的watcher来更新