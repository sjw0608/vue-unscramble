let id = 0
class Dep {
    constructor() {
        this.subs = []
        this.id = id++
    }
    depend() {
        // this.subs.push(Dep.target)
        Dep.target.addDep(this) // 实现双向记忆 让watcher记住dep的同时，也让dep记住watcher
    }
    notify() {
        this.subs.forEach(watcher => {
            watcher.update()
        })
    }
    addSub(watcher) {
        this.subs.push(watcher)
    }
}

Dep.target = null // 静态属性
const targetStack = []
export function pushTarget(watcher) {
    targetStack.push(watcher) // 有渲染watcher 和其他的watcher
    Dep.target = watcher // 保留watcher
}

export function popTarget() {
    targetStack.pop()
    Dep.target = targetStack[targetStack.length - 1]
}

export default Dep

// 多对多的关系 一个属性有一个dep 是用来收集 watcher的
// dep 可以存多个watcher
// 一个watcher可以对应多个dep
