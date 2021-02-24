const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/ // 匹配属性
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*` // 标签名
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`) // 标签开头的正则，捕获的内容是标签名
const startTagClose = /^\s*(\/?)>/ // 匹配标签结束的 >
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`) // 匹配标签的结尾
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g

export function parseHTML(html) {
    function createASTElement(tagName, attrs) {
        return {
            tag: tagName, //标签名
            type: 1, // 元素类型
            children: [], // 孩子列表
            attrs, // 属性集合
            parent: null // 父元素
        }
    }
    let root, currentParent, stack = []
    // 开头标签 标签是否符合预期
    function start(tagName, attrs) { // 创建一个元素 作为根元素
        let element = createASTElement(tagName, attrs)
        if (!root) {
            root = element
        }
        currentParent = element // 当前解析的标签 保存起来
        stack.push(element) // 将生成的ast元素放到栈中
    }
    // 结束标签
    function end(tagName) { // 在结尾标签处 创建父子关系
        let element = stack.pop() // 取出栈中的最后一个
        currentParent = stack[stack.length - 1]
        if (currentParent) { // 在闭合是可以知道这个标签的父亲是谁
            element.parent = currentParent
            currentParent.children.push(element)
        }
    }
    // 文本标签
    function chars(text) {
        text = text.trim()
        if (text) {
            currentParent.children.push({
                type: 3,
                text: text
            })
        }
    }

    // 只要html不为空字符串就一直解析
    while (html) {
        // 查看是否是 < 开头的
        let textEnd = html.indexOf('<')
        if (textEnd == 0) {
            // 肯定是标签
            const startTagMatch = parseStartTag() // 开始标签匹配的结果
            if (startTagMatch) {
                start(startTagMatch.tagName, startTagMatch.attrs)
                continue
            }
            const endTagMatch = html.match(endTag) // 捕获结束标签
            // 结束标签
            if (endTagMatch) {
                advance(endTagMatch[0].length)
                end(endTagMatch[1]) // 将结束标签传入
                continue
            }
        }
        let text
        // 文本标签
        if (textEnd > 0) {
            text = html.substring(0, textEnd)
        }
        if (text) {
            advance(text.length)
            chars(text)
        }
    }
    // 将html字符进行截取操作然后在更新html内容
    function advance(n) {
        html = html.substring(n)
    }
    // 解析开始标签
    function parseStartTag() {
        const start = html.match(startTagOpen)
        if (start) {
            const match = {
                tagName: start[1],
                attrs: []
            }
            advance(start[0].length) // 删除开始标签
            // 如果直接是闭合标签说明是没有属性
            let end, attr;
            // 不是结尾标签并且可以匹配到属性
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                match.attrs.push({ name: attr[1], value: attr[3] || attr[4] || attr[5] })
                advance(attr[0].length) // 去掉当前属性
            }
            if (end) { // 删除匹配到的结束标签
                advance(end[0].length)
                return match
            }
        }
    }
    return root
}
