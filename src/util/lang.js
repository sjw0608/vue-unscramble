export function def(obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
        value: val,
        enumerable: !!enumerable,
        writable: true,
        configurable: true
    })
}

export function isObject(obj) {
    return obj !== null && typeof obj === 'object'
}

function makeMap(str) {
    let mapping = Object.create(null)
    const list = str.split(',')
    for (let i = 0; i < list.length; i++) {
        mapping[list[i]] = true
    }

    return key => { // 判断这个标签是不是原生标签
        return mapping[key]
    }
}
export const isReservedTag = makeMap(tag)