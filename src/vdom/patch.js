export function patch(oldVnode, vnode) {
    // 默认初始化时，是直接用虚拟节点创建出真是节点 替换掉老节点
    if (oldVnode.nodeType == 1) { // 真是DOM
        // 将虚拟节点转化成真实节点
        let el = createElm(vnode)
        let parentElm = oldVnode.parentNode // 获取老的app的父亲 =》 body
        parentElm.insertBefore(el, oldVnode.nextSibling) // 当前的真实元素插入到app的后面
        parentElm.removeChild(oldVnode) // 删除老的节点
        return el
    } else {
        // 在更新的时候，拿老得虚拟节点和新的虚拟节点做对比，将不同的地方更新真是的DOM
        // 更新功能
        // 1.比较两个元素的标签，标签不一样直接替换掉即可
        if (oldVnode.tag !== vnode.tag) {
            // 老的dom元素
            return oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el)
        }
        // 2.有可能标签一样 
        // 文本节点的虚拟节点tag 都是 undefined
        if (!oldVnode.tag) { // 文本的对比
            if (oldVnode.text !== vnode.text) {
                return oldVnode.el.textContent = vnode.text
            }
        }
        // 3.标签一样并且需要开始比对标签的属性和儿子
        // 标签一样直接复用即可
        let el = vnode.el = oldVnode.el // 复用老节点
        // 更新属性，用新的虚拟节点的属性和老的比较，去更新节点
        // 新老属性做对比
        updateProperties(vnode, oldVnode.data)
        // 比较孩子
        // 获取老的和新的儿子
        let oldChildren = oldVnode.children || []
        let newChildren = vnode.children || []
        // 儿子比较分为以下几种情况
        if (oldChildren.length > 0 && newChildren.length > 0) {
            // 老的有儿子 新的也有儿子
            updateChildren(oldChildren, newChildren, el)
        } else if (oldChildren.length > 0) {
            // 老的有儿子 新的没儿子
            el.innerHTML = ''
        } else if (newChildren.length > 0) {
            // 老的没儿子 新的有儿子
            for (let i = 0; i < newChildren.length; i++) {
                let child = newChildren[i]
                // 浏览器有性能优化 不用自己在搞文档碎片
                el.appendChild(createElm(child))
            }
        }


    }
}
// 儿子间的比较
function updateChildren(oldChildren, newChildren, parent) {
    // Vue中的diff算法做了很多优化
    // DOM中操作有很多常见的逻辑 把节点插入到当前儿子的头部、尾部、儿子倒叙
    // Vue2中采用的是双指针的方式
    // 循环，同时循环新的和老的  那个先结束循环就停止 然后删除/添加
    let oldStartIndex = 0 // 老的索引
    let oldStartVnode = oldChildren[0] // 老的索引指向的节点
    let oldEndIndex = oldChildren.length - 1
    let oldEndVnode = oldChildren[oldEndIndex]
    // 新的索引
    let newStartIndex = 0
    let newStartVnode = newChildren[0]
    let newEndIndex = newChildren.length - 1
    let newEndVnode = newChildren[newEndIndex]

    function makeIndexByKey(children) {
        let map = {}
        children.forEach((item, index) => {
            if (item.key) {
                map[item.key] = index
            }
        })
        return map
    }
    let map = makeIndexByKey(oldChildren)
    // 比较谁先循环停止
    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
        if (!oldStartVnode) { // 指针指向了null 跳过这次的处理
            oldStartVnode = oldChildren[++oldStartIndex]
        }else if(!oldEndVnode){
            oldEndVnode = oldChildren[--oldEndIndex]
        }else if (isSameVnode(oldStartVnode, newStartVnode)) { // 如果是同一个元素 对比儿子
            patch(oldStartVnode, newStartVnode) // 更新属性和再去更新子节点
            oldStartVnode = oldChildren[++oldStartIndex]
            newStartVnode = newChildren[++newStartIndex]
        } else if (isSameVnode(oldEndVnode, newEndVnode)) {
            patch(oldEndVnode, newEndVnode)
            oldEndVnode = oldChildren[--oldEndIndex]
            newEndVnode = newChildren[--newEndIndex]
        } else if (isSameVnode(oldStartVnode, newEndVnode)) { // 老的头部和新的尾部对比
            patch(oldStartVnode, newEndVnode)
            // 将当前元素插入到尾部的下一个元素的前面
            parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling)
            oldStartVnode = oldChildren[++oldStartVnode]
            newEndVnode = newChildren[--newEndIndex]
        } else if (isSameVnode(oldEndVnode, newStartVnode)) { // 老的尾部和新的头部对比
            patch(oldEndVnode, newStartVnode)
            parent.insertBefore(oldEndVnode.el, oldStartVnode.el)
            oldEndVnode = oldChildren[--oldEndIndex]
            newStartVnode = newChildren[++newStartIndex]
        } else {
            // 儿子之间没有关系，暴力比对
            let moveIndex = map[newStartVnode.key] // 拿到开头虚拟节点的key 去老的中找
            if (moveIndex == undefined) { // 不需要移动 说明没有key复用的
                parent.insertBefore(createElm(newStartVnode), oldStartVnode.el)
            } else {
                let moveNode = oldChildren[moveIndex]
                oldChildren[moveIndex] = null
                parent.insertBefore(moveNode.el, oldStartVnode.el)
                patch(moveNode, newStartVnode) // 比较属性和儿子
            }
            newStartVnode = newChildren[++newStartIndex] // 用新的不停的去老的里面找 
        }
    }
    if (newStartIndex <= newEndIndex) {
        for (let i = newStartIndex; i <= newEndIndex; i++) {
            // 将新的多余的插入即可 可能是向前添加 还有可能是向后添加
            // parent.appendChild(createElm(newChildren[i]))
            // 向后插入ele = null
            // 向前插入 ele 就是当前向谁前面插入
            let ele = newChildren[newEndIndex + 1] == null ? null : newChildren[newEndIndex + 1].el
            parent.insertBefore(createElm(newChildren[i]), ele)
        }
    } else if (oldStartIndex <= oldEndIndex) {
        // 老的节点还有没处理的说明这些老节点是不需要的，如果这里面有null 说明这个节点已经处理过，跳过即可
        for (let i = oldStartIndex; i <= oldEndIndex; i++) {
            let child = oldChildren[i]
            if (child != null) {
                parent.removeChild(child.el)
            }
        }
    }
}
function isSameVnode(oldVnode, newVnode) {
    return (oldVnode.key == newVnode.key) && (oldVnode.tag == newVnode.tag)
}

function createElm(vnode) {
    let { tag, data, key, children, text } = vnode
    if (typeof tag == 'string') {
        vnode.el = document.createElement(tag) // 创建元素放到vnode.el上

        // 只有元素才有属性
        updateProperties(vnode)

        children.forEach(child => { // 遍历儿子 将儿子渲染后的结果扔到父亲中
            vnode.el.appendChild(createElm(child))
        })
    } else { // 创建文本 放到 vnode.el上
        vnode.el = document.createTextNode(text)
    }
    return vnode.el
}

function updateProperties(vnode, oldProps = {}) {
    let newProps = vnode.data || {} // 新的属性
    // 新的有 那就直接用心的去做更新即可
    let el = vnode.el
    // 老的有 新的没有 删除老的属性
    for (let key in oldProps) {
        if (!newProps[key]) {
            el.removeAttribute(key) // 移除真实DOM属性
        }
    }
    // 样式处理
    let newStyle = newProps.style || {}
    let oldStyle = oldProps.style || {}
    //  老的样式中有 新的没有 删除老的样式
    for (let key in oldStyle) {
        if (!newStyle[key]) {
            el.style[key] = ''
        }
    }
    for (let key in newProps) {
        if (key == 'style') {
            for (let styleName in newProps.style) {
                el.style[styleName] = newProps.style[styleName]
            }
        } else if (key == 'class') {
            el.className = newProps.class
        } else {
            el.setAttribute(key, newProps[key])
        }
    }
}

// Vue的渲染流程 =》 先出初始化数据 =》 将模版进行编译 =》 render 函数 =》 生成虚拟节点 =》 生成真是Dom =》 扔到页面上