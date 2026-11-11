// 从黄金模板创建一个新的 Demo 项目。
// 用法：node <模板目录>/scripts/new-demo.mjs <目标目录> [--name 系统名称]
// 复制模板（不含依赖、构建产物和 .git），改好系统名称，初始化 git 并提交第一版。
import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { ROOT } from './lib.mjs'

const args = process.argv.slice(2)
const nameIndex = args.indexOf('--name')
const name = nameIndex >= 0 ? args[nameIndex + 1] : null
// 没有 --name 时 nameIndex 是 -1，不能用 nameIndex + 1 去排除参数
const target = args.find((arg, index) => !arg.startsWith('--') && (nameIndex < 0 || index !== nameIndex + 1))

if (!target) {
  console.error('用法：node scripts/new-demo.mjs <目标目录> [--name 系统名称]')
  process.exit(2)
}

const dest = path.resolve(target)
if (existsSync(dest) && readdirSync(dest).length > 0) {
  console.error(`目标目录已存在且不为空：${dest}。不覆盖已有代码`)
  process.exit(1)
}
if (dest.startsWith(ROOT + path.sep)) {
  console.error('目标目录不能在模板目录里面')
  process.exit(1)
}

/** 不复制的目录和文件：依赖、构建产物、本机配置 */
const SKIP = new Set(['.git', 'node_modules', 'target', 'dist', '.idea', '.vscode', 'coverage', '.DS_Store'])

cpSync(ROOT, dest, {
  recursive: true,
  filter: (source) => !SKIP.has(path.basename(source)),
})

if (name) {
  if (/['"\\\n]/.test(name)) {
    console.error('系统名称里不能有引号、反斜杠或换行')
    process.exit(2)
  }
  replaceIn(path.join(dest, 'frontend/src/config.ts'), "APP_TITLE = 'Demo'", `APP_TITLE = '${name}'`)
  replaceIn(path.join(dest, 'frontend/index.html'), '<title>Demo</title>', `<title>${name}</title>`)
  replaceIn(path.join(dest, 'backend/src/main/resources/application.yml'), '  name: Demo\n', `  name: ${name}\n`)
}

const git = (...gitArgs) => spawnSync('git', gitArgs, { cwd: dest, stdio: 'inherit' })
if (git('init', '-q').status === 0) {
  git('add', '-A')
  git('commit', '-q', '-m', 'chore: 从黄金模板创建项目')
} else {
  console.warn('没有找到 git，跳过初始化仓库')
}

console.log(`已创建：${dest}`)
console.log('下一步：pnpm deps 安装依赖，然后 pnpm dev 启动')

function replaceIn(file, from, to) {
  const content = readFileSync(file, 'utf8')
  if (!content.includes(from)) {
    console.error(`没有在 ${file} 里找到 ${JSON.stringify(from)}，模板结构可能变了，请更新 new-demo.mjs`)
    process.exit(1)
  }
  writeFileSync(file, content.replace(from, to))
}
