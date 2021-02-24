import { generate } from "./generate"
import { parseHTML } from "./parse"

export function compileToFunctions(template) {
    let ast = parseHTML(template)
    // 优化静态节点

    // 通过这棵树重新生成代码
    let code =  generate(ast)
    // 将字符串变成函数 限制取之范围通过with来进行取之，稍后调用render函数就可以通过改变this 让这个函数内部取到结果了
    let render =  new Function(`with(this){return ${code}}`)
    return render
}