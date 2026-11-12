// 端到端测试：启动后端（mock）和前端，等就绪后跑 frontend/e2e/ 下的 Playwright 用例，跑完关掉服务。
// 用法：node scripts/e2e.mjs [--reuse] [Playwright 参数...]
//   --reuse   不启动服务，用已经在 http://127.0.0.1:5173 上跑着的（pnpm dev 开着的时候用，更快）
//   其余参数原样交给 playwright，例如 pnpm e2e --grep 登录
// 默认用 18080 / 15173 端口，不会和正在运行的 pnpm dev 冲突；被别的程序占用时自动换一个空闲端口。
// 要固定端口就设环境变量 E2E_BACKEND_PORT、E2E_FRONTEND_PORT。用本机装的 Chrome（找不到时见 playwright.config.ts 里的说明）。
import net from 'node:net'
import { FRONTEND, BACKEND, MVNW, killTree, run, waitExit } from './lib.mjs'

const args = process.argv.slice(2)
const reuse = args.includes('--reuse')
const passthrough = args.filter((arg) => arg !== '--reuse')

const backendPort = await pickPort(process.env.E2E_BACKEND_PORT, 18080)
const frontendPort = reuse ? '5173' : await pickPort(process.env.E2E_FRONTEND_PORT, 15173)

/**
 * 指定了端口就照用（被占用时由启动失败报出来）；没指定时先试默认端口，被占用就让系统分一个空闲的。
 * 本机同时开着别的项目时，默认端口经常被占，无人值守运行不能因此停下。
 */
async function pickPort(fixed, preferred) {
  if (fixed) return String(fixed)
  const listen = (port) =>
    new Promise((resolve) => {
      const server = net.createServer()
      server.once('error', () => resolve(null))
      server.listen(port, '127.0.0.1', () => {
        const { port: actual } = server.address()
        server.close(() => resolve(actual))
      })
    })
  const port = (await listen(preferred)) ?? (await listen(0))
  if (port !== preferred) console.log(`[e2e] 端口 ${preferred} 被占用，改用 ${port}`)
  return String(port)
}
const baseUrl = `http://127.0.0.1:${frontendPort}`

let backend = null
let frontend = null
function cleanup() {
  killTree(backend)
  killTree(frontend)
}
process.on('SIGINT', () => {
  cleanup()
  process.exit(130)
})
process.on('SIGTERM', () => {
  cleanup()
  process.exit(143)
})

/** 经前端的代理请求后端：返回 401（未登录）说明前后端都起来了 */
async function waitReady(timeoutMs) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    for (const [name, child] of [['后端', backend], ['前端', frontend]]) {
      if (child && child.exitCode !== null) throw new Error(`${name}启动失败（退出码 ${child.exitCode}），看上面的日志`)
    }
    try {
      const response = await fetch(`${baseUrl}/api/auth/me`, { signal: AbortSignal.timeout(3000) })
      if (response.status === 401) return
    } catch {
      // 还没起来，继续等
    }
    await new Promise((resolve) => setTimeout(resolve, 1500))
  }
  throw new Error(`等了 ${Math.round(timeoutMs / 1000)} 秒，${baseUrl} 还没就绪`)
}

let code = 1
try {
  if (!reuse) {
    console.log(`[e2e] 启动后端 mock 模式（${backendPort}）和前端（${frontendPort}）`)
    backend = run(MVNW, ['-q', 'spring-boot:run'], BACKEND, {
      stdio: 'ignore',
      env: { SPRING_PROFILES_ACTIVE: 'mock', SERVER_PORT: backendPort },
    })
    frontend = run('pnpm', ['dev', '--host', '127.0.0.1', '--port', frontendPort, '--strictPort'], FRONTEND, {
      stdio: 'ignore',
      env: { VITE_API_TARGET: `http://127.0.0.1:${backendPort}` },
    })
  }
  await waitReady(180_000)
  console.log(`[e2e] 服务就绪，开始跑用例：${baseUrl}`)
  code = await waitExit(
    run('pnpm', ['exec', 'playwright', 'test', ...passthrough], FRONTEND, { env: { E2E_BASE_URL: baseUrl } }),
  )
  console.log(code === 0 ? '[e2e] 全部通过，截图在 docs/acceptance/screenshots/' : `[e2e] 有用例失败（退出码 ${code}），失败截图和 trace 在 docs/acceptance/test-results/`)
} catch (error) {
  console.error(`[e2e] ${error.message}`)
} finally {
  cleanup()
}
process.exit(code)
