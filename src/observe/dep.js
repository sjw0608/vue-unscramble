let id = 0
class Dep{
    constructor(){
        this.subs = []
        this.id = id++
    }
    depend(){
        // this.subs.push(Dep.target)
        Dep.target.addDep(this) // 实现双向记忆 让watcher记住dep的同时，也让dep记住watcher
    }
    notify(){
        this.subs.forEach(watcher =>{
            watcher.update()
        })
    }
    addSub(watcher){
        this.subs.push(watcher)
    }
}

Dep.target = null // 静态属性
export function pushTarget(watcher){
    Dep.target = watcher // 保留watcher
}

export function popTarget(){
    Dep.target = null
}

export default Dep

// 多对多的关系 一个属性有一个dep 是用来收集 watcher的
// dep 可以存多个watcher
// 一个watcher可以对应多个dep
