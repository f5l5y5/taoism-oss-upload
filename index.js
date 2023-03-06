#!/usr/bin/env node
"use strict";
var parseArgs = require("minimist");
const OSS = require("ali-oss");
const glob = require("glob");
const path = require("path");
const fs = require("fs");
function _interopDefaultLegacy(e) {
  return e && typeof e === "object" && "default" in e ? e : { default: e };
}
var parseArgs__default = /*#__PURE__*/ _interopDefaultLegacy(parseArgs);
const args = parseArgs__default["default"](process.argv.slice(2));

/**
 * @description 主函数
 */
async function main() {
  console.time("√ 耗时");
  console.log(`use config：${args.config || "alioss.config.js"}`);
  // 获取配置文件
  const absolutePath = `${process.cwd()}/${args.config || "alioss.config.js"}`;
  let config =
    process.env.npm_package_type === "module"
      ? await import(absolutePath)
      : _interopDefaultLegacy(require(absolutePath));

  console.log("config", config.default, absolutePath);
  config = config.default;
  // 判断 有问题如果传入进行参数有,为了方便进行合并
  if (!config.oss) {
    console.error("x 配置文件缺少oss项");
    process.exit(-1);
  }
  // 如果存在 合并配置
  const { region, accessKeyId, accessKeySecret, bucket } = config.oss;
  // 优先读取命令的参数 后读取alioss.config.js
  // 合并配置
  const conf = {
    region: args.region || args.r || region,
    accessKeyId: args.accessKeyId || args.i || accessKeyId,
    accessKeySecret: args.accessKeySecret || args.s || accessKeySecret,
    bucket: args.bucket || args.b || bucket,
    timeout: 60000,
  };
  // 重新写入
  config.oss = conf;
  console.log(`To Bucket: '${conf.bucket}'`, config);
  // 校验配置
  if (!validate(config)) {
    process.exit(-1);
  }
  await run(config);
}

/**
 * @description 验证oss配置是否存在
 * @param {*} config
 * @returns boolean
 */
function validate(config) {
  const {
    oss: { region, accessKeyId, accessKeySecret, bucket },
    task,
  } = config;
  if (!region && !accessKeyId && !accessKeySecret && !bucket) {
    return console.error("x oss配置不正确");
  }
  if (!task || !task.length) {
    return console.error("x 没有配置task项");
  }
  return true;
}

/**
 * @description 运行任务
 * @param {*} config
 */
async function run(config) {
  const client = new OSS(config.oss);
  // 并行启动任务
  console.log(`start:任务总数：${config.task.length}`);
  // 每个task其实是将源文件地址和oss上传的路径进行指定
  const results = await Promise.all(
    config.task.map((task) => runTask(client, task.source, task.publicPath))
  );
  // 计算文件总数
  let total = 0;
  results.forEach((v) => {
    total += v;
  });
  console.log(`√ 文件总数: ${total}`);
  console.timeEnd("√ 耗时");
}
let uid = 0;
async function runTask(client, from, to) {
  console.log(from, to);
  // 转换成绝对路径
  if (!path.isAbsolute(from)) {
    from = path.resolve(__dirname, from);
  }
  // 获取文件列表
  const files = glob
    .sync(path.resolve(from, "./**/*"))
    .filter((v) => fs.statSync(v).isFile());
  // 上传到 alioss
  await upload(files, from, to, client);
  console.log("打印***files======>", files);
  console.log(
    `${++uid}、 Done:  { Total:${files.length},  From:'${from}',  To:'${to}' }`
  );
  return files.length;
}

/**
 * @description 上传文件
 * @param {*} files
 * @param {*} from
 * @param {*} to
 * @param {*} client
 * @returns
 */
async function upload(files, from, to, client) {
  return Promise.all(
    files.map((file) => {
      // 目标地址  posix: linux  /   windows: \   ??
      const targetPath = path.posix.normalize(
        file.replace(from.replace(/\\/g, "/"), to)
      );
      return client
        .put(targetPath, file)
        .then((res) => {
          if (res.res.statusCode === 200) {
            console.error(` ${res.res} 上传成功`);
            return res;
          } else {
            console.error(res);
            throw res;
          }
        })
        .catch((e) => {
          console.error(e);
          console.error(`❌❌❌  上传失败`);
          process.exit(-1);
        });
    })
  );
}

main();
