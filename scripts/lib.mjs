// dev.mjs、check.mjs 共用的小工具
import { spawn, spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const BACKEND = path.join(ROOT, 'backend')
export const FRONTEND = path.join(ROOT, 'frontend')
export const isWindows = process.platform === 'win32'

/** 后端用项目自带的 Maven Wrapper，不依赖本机装的 Maven 版本 */
// 用绝对路径：有的 Windows 机器设置了不从当前目录查找可执行文件。加引号防止路径里有空格
export const MVNW = isWindows ? `"${path.join(BACKEND, 'mvnw.cmd')}"` : path.join(BACKEND, 'mvnw')

/**
 * 启动子进程。Windows 上 .cmd 需要经过 shell 才能启动，命令都是固定的字符串，不拼接外部输入。
 * 显式指定 SPRING_PROFILES_ACTIVE，避免机器上的同名环境变量把 mock 模式顶掉。
 */
export function run(command, args, cwd, { stdio = 'inherit', env = {} } = {}) {
  return spawn(command, args, {
    cwd,
    stdio,
    shell: isWindows,
    env: { ...process.env, ...env },
  })
}

/** 结束整个进程树（Windows 上 mvn、vite 会再起子进程） */
export function killTree(child) {
  if (!child || child.exitCode !== null || child.pid === undefined) return
  if (isWindows) {
    spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
  } else {
    child.kill('SIGTERM')
  }
}

export function waitExit(child) {
  return new Promise((resolve) => child.on('exit', (code) => resolve(code ?? 1)))
}
