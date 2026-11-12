// 预览环境：构建后端和前端，用生产方式启动（后端 jar + 前端静态文件），打印同一网络里别人也能打开的地址。
// 用途：Demo 做完后给产品或客户在他们自己的电脑和手机上点一点，不用在你的机器上演示。
// 用法：node scripts/preview.mjs [--no-build] [--port 4173] [--backend-port 18081]
//   --no-build  跳过构建，用上次的产物
// Ctrl+C 停止。注意：预览环境用的是 mock 数据和公开的演示账号（admin / admin123），只在可信的内网里开，不要映射到公网。
import { existsSync, readdirSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { BACKEND, FRONTEND, MVNW, killTree, run, waitExit } from './lib.mjs'

const args = process.argv.slice(2)
const option = (name, fallback) => {
  const index = args.indexOf(name)
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback
}
const port = option('--port', '4173')
const backendPort = option('--backend-port', '18081')
for (const value of [port, backendPort]) {
  if (!/^\d{2,5}$/.test(value)) {
    console.error(`端口不对：${value}`)
    process.exit(2)
  }
}

if (!args.includes('--no-build')) {
  console.log('[preview] 构建后端（跳过测试，测试用 pnpm check）')
  if ((await waitExit(run(MVNW, ['-q', '-B', '-DskipTests', 'package'], BACKEND))) !== 0) process.exit(1)
  console.log('[preview] 构建前端')
  if ((await waitExit(run('pnpm', ['build'], FRONTEND))) !== 0) process.exit(1)
}

const targetDir = path.join(BACKEND, 'target')
const jar = existsSync(targetDir)
  ? readdirSync(targetDir).find((name) => name.endsWith('.jar') && !name.endsWith('.original') && !name.includes('sources'))
  : undefined
if (!jar || !existsSync(path.join(FRONTEND, 'dist'))) {
  console.error('[preview] 找不到构建产物，去掉 --no-build 重新运行')
  process.exit(1)
}

const backend = run('java', ['-jar', path.join(targetDir, jar)], BACKEND, {
  env: { SPRING_PROFILES_ACTIVE: 'mock', SERVER_PORT: backendPort },
})
const frontend = run('pnpm', ['exec', 'vite', 'preview', '--host', '0.0.0.0', '--port', port, '--strictPort'], FRONTEND, {
  env: { VITE_API_TARGET: `http://127.0.0.1:${backendPort}` },
})

let stopping = false
function stop(code) {
  if (stopping) return
  stopping = true
  killTree(backend)
  killTree(frontend)
  process.exit(code)
}
backend.on('exit', (code) => !stopping && (console.error(`[preview] 后端退出了（退出码 ${code}）`), stop(code ?? 1)))
frontend.on('exit', (code) => !stopping && (console.error(`[preview] 前端退出了（退出码 ${code}）`), stop(code ?? 1)))
process.on('SIGINT', () => stop(0))
process.on('SIGTERM', () => stop(0))

const lan = Object.values(os.networkInterfaces())
  .flat()
  .filter((item) => item && item.family === 'IPv4' && !item.internal)
  .map((item) => item.address)

// 等前后端都就绪再打印地址
const deadline = Date.now() + 120_000
for (;;) {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/auth/me`, { signal: AbortSignal.timeout(3000) })
    if (response.status === 401) break
  } catch {
    // 还没起来
  }
  if (Date.now() > deadline) {
    console.error('[preview] 等了 120 秒还没就绪')
    stop(1)
  }
  await new Promise((resolve) => setTimeout(resolve, 1500))
}
console.log('\n[preview] 预览环境已就绪')
console.log(`  本机：http://127.0.0.1:${port}`)
for (const address of lan) console.log(`  同一网络：http://${address}:${port}`)
console.log('  演示账号：admin / admin123（全部权限），viewer / demo123（只读）。Ctrl+C 停止')
