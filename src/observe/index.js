import {arrayMethods} from './array.js';
import Dep from './dep.js';
class Observe{
    constructor(value){
        this.dep = new Dep() // 给数组/对象 增加一个dep
        // 判断一个对象是否被观测过 看他有没有 __ob__ 这个属性
        Object.defineProperty(value,'__ob__',{
            enumerable:false,
            configurable:false,
            value:this
        })
        //  判断value是否是一个对象
        if(Array.isArray(value)){
            // 重写数组方法
            value.__proto__ = arrayMethods
            //  观察数组中的对象类型，对象变化也要做相应的事情
            this.observeArray(value) // 数组中普通类型是不做观测的
        }else{
            this.walk(value)
        }
    }
    walk(data){
        let keys = Object.keys(data) // 获取对象的key
        keys.forEach(key=>{
            defineReactive(data,key,data[key])
        })
    }
    observeArray(value){
        value.forEach(item=>{
            observe(item) // 观察数组中的对象
        })
    }
}
/**
 * 
 * @param {Object} data 监听的对象
 * @param {Steing} key 监听的对象的属性
 * @param {*} value 监听的值
 */
function defineReactive(data,key,value){
    // 如果value是一个对象类型在进行观测
    let childDep = observe(value) // 获取到数组对应的Dep
    let dep = new Dep() // 每一个属性都有一个dep
    // 当页面取值时，说明这个值用来渲染了，将这个watcher和这个属性对应起来
    Object.defineProperty(data,key,{
        get(){  // 依赖收集
            if(Dep.target){ // 让这个属性记住这个watcher
                dep.depend()
                if(childDep){ // 可能是数组 可能是对象
                    // 默认给数组增加了一个dep属性，当数组对这个对象取值的时候
                    // 数组存起来了这个渲染watcher
                    childDep.dep.depend() 
                }
            }
            return value
        },
        set(newValue){ // 依赖更新
            if(newValue == value) return
            // 如果新值是一个对象类型接着观测
            observe(newValue)
            value = newValue
            dep.notify()
        }
    })
}

export function observe(data){
    if(typeof data !== 'object' || data == null){
        return
    }
    // 对象被观测过
    if(data.__ob__) {
        return data
    }
    return new Observe(data)
    // 只观测存在的属性
    // 数组中更改索引和长度 无法被监控
}
