readdirp： 读取文件夹文件 path [{path:xxx}]
const readdirp = require("readdirp");
process.env.PWD 当前命令运行路径
console.log('打印**\*process.env.PWD======>', path.resolve(\_\_dirname, './dist/**/_'))
找出所有的文件// 直接使用 node index.js 运行 不存在 使用 yarn 可以获取 ？？？ glob 查找匹配文件
console.log(glob.sync(path.resolve(\_\_dirname, 'dist/\*\*/_')).filter(v => fs.statSync(v).isFile()))
将路径替换 posix 是 linux / windows \
 console.log(path.normalize('/dist/index.html'))
console.log(path.posix.normalize('/dist/index.html'))

找出所有的文件
console.log(readdirp("./dist", { type: "files" }).path);

// 获取脚本运行带入的参数 如 node index.js --config alioss.config.js -flag true ====> { \_: [ 1, 2, 3 ], config: 'alioss.config.js', flag: 'true' }
// -- 可以是后面完整的字符串
// 使用 cross-env 进行环境判断 不能用 ENV 的开头

只支持 commonjs 不支持 esm,vite 默认使用 esm 所以上传脚本文件会有问题
解决方式 使用 process.env.npm_package_type 判断当前的环境 import --- esm --- default{}， require --- commonjs
