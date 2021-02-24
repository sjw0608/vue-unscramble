const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g

// 生成属性
function genProps(attrs) {
    let str = ``
    for (let i = 0; i < attrs.length; i++) {
        let attr = attrs[i]
        if (attr.name == 'style') {
            let obj = {} // 对样式进行特殊的处理
            attr.value.split(';').forEach(itm => {
                let [key, value] = itm.split(':')
                obj[key] = value
            });
            attr.value = obj
        }
        str += `${attr.name}:${JSON.stringify(attr.value)},`
    }
    // console.log(str); // id:"app",style:{"color":"red"}
    return `{${str.slice(0, -1)}}`
}
function gen(node) {
    if (node.type == 1) {
        // 生成元素节点的字符串
        return generate(node)
    } else {
        let text = node.text // 获取文本
        if(!defaultTagRE.test(text)){
            //  如果是普通文本 不带{{}}
            return `_v(${JSON.stringify(text)})`
        }
        let tokens = [] // 存放所有的文本
        let lastIndex = defaultTagRE.lastIndex = 0 // 如果正则是全局模式 需要每次使用前置为0
        let match,index
        // 循环检测 {{}} 包裹起来的文本 并连同 {{}} 一同放到tokens中
        while (match = defaultTagRE.exec(text)) {
           index = match.index  // 保存匹配到的索引
           if(index>lastIndex){
               tokens.push(JSON.stringify(text.slice(lastIndex,index)))
           }
           tokens.push(`_s(${match[1].trim()})`)
           lastIndex = index+match[0].length
        }
        // 这里是截取{{}}后面的文本
        if(lastIndex<text.length){
            tokens.push(JSON.stringify(text.slice(lastIndex)))
        }
        // console.log(`_v(${tokens.join('+')})`); // _v("姓名："+_s(name)+"，")
       return `_v(${tokens.join('+')})`
    }
}

function genChildren(el) {
    const children = el.children
    if (children) { // 将所有转化后的儿子用都好拼接起来
        return children.map(child => gen(child)).join(',')
    }
}
export function generate(el) {
    let children = genChildren(el) // 儿子的生成

    let code = `_c('${el.tag}',${
        el.attrs.length ? `${genProps(el.attrs)}` : undefined}${
            children ? `,${children}` : ''
        })`

    // console.log(code); // _c('div',{id:"app",style:{"color":"red"}},_v("Hello Vue"),_c('span',{style:{"color":"blue"}},_v("姓名："+_s(name)+"，")))

    return code
}