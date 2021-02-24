import babel from 'rollup-plugin-babel';
import serve from 'rollup-plugin-serve';

export default {
    input: './src/index.js', // 入口文件
    output: { // 出口
        format: 'umd',
        name: 'Vue', // 全局变量的名字
        file: 'dist/umd/vue.js',
        sourcemap: true
    },
    plugin: [
        babel({
            exclude: 'node_modules/**'
        }),
        serve({
            port: 3000,
            contentBase: '',
            openPage: '/index.html'
        })
    ]
}