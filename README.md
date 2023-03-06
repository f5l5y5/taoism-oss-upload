# taoismcn/ali-oss

# 支持 commonjs 和 esm 环境运行

# ali-oss cli tools

## 一、安装

```
npm i @taoismcn/ali-oss -D
```

## 二、配置

创建 alioss.config.js

```
const path = require('path')

module.exports = {
  oss: {
    region: 'oss-cn-shenzhen',
    accessKeyId: '********',
    accessKeySecret: '********',
    bucket: 'incep',
  },
  task: [
    {
      source: path.resolve(__dirname, 'dist'),
      publicPath: '/ali-oss/',
    },
    {
      source: path.resolve(__dirname, 'public'),
      publicPath: '/ali-oss/public/',
    },
    ...
  ],
}

```

注意：

- publicPath 以 / 开始和结束

## 三、命令行

```
//默认会以 alioss.config.js 为配置文件
npx oss
npx oss [--config xxx.js]
```

### 1、通过命令行设置 oss 配置

```
// 推荐 生产环境 在Jenkins配置密钥
npx oss --config alioss.config.js --accessKeyId xxx --accessKeySecret xxx
```

### 2、命令行支持选项

以下均为可选，命令行选项会覆盖配置文件选项

```
--region xxx 或 --r xxx
--accessKeyId xxx 或 --i xxx
--accessKeySecret xxx 或 --s xxx
--bucket xxx 或 --b xxx
```
