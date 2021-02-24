// 拿到数组原型上的方法
let oldArrayPrototype = Array.prototype
// 继承数组原型上的方法
export let arrayMethods = Object.create(oldArrayPrototype)

let methodsArray = [
    'push',
    'unshift',
    'shift',
    'pop',
    'splice',
    'sort',
    'reverse'
]

methodsArray.forEach(method => {
    arrayMethods[method] = function (...args) {
        // 当调用我们劫持后的数据方法 页面应该更新
        // 我要知道数组对应那个dep
        const result = oldArrayPrototype[method].apply(this, args)
        const ob = this.__ob__
        let inserted
        switch (method) {
            case 'push':
            case 'unshift': // 这两个方法都是追加，追加的内容有可能是对象类型，应该再次被进行劫持
                inserted = args
                break;
            case 'splice':
                inserted = args.slice(2)
                break;
        }
        if(inserted) ob.observeArray(inserted)
        ob.dep.notify() // 通知数组更新

        return result
    }
})