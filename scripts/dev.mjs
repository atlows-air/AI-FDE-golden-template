// 一条命令同时启动后端（默认 mock 模式，8080）和前端（5173）。Ctrl+C 两个一起停。
// 用法：node scripts/dev.mjs [--profile mysql] [--backend-port 8080] [--frontend-port 5173]
import { BACKEND, FRONTEND, MVNW, killTree, run } from './lib.mjs'

function option(name, fallback) {
  const index = process.argv.indexOf(name)
  return index > 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback
}

const profile = option('--profile', 'mock')
const backendPort = option('--backend-port', '8080')
const frontendPort = option('--frontend-port', '5173')
for (const port of [backendPort, frontendPort]) {
  if (!/^\d{2,5}$/.test(port)) {
    console.error(`端口不对：${port}`)
    process.exit(2)
  }
}

console.log(`[dev] 后端 profile=${profile}：http://127.0.0.1:${backendPort}（接口文档 /swagger-ui.html）`)
console.log(`[dev] 前端：http://127.0.0.1:${frontendPort}（/api 转发到后端）`)

const backend = run(MVNW, ['-q', 'spring-boot:run'], BACKEND, {
  env: { SPRING_PROFILES_ACTIVE: profile, SERVER_PORT: backendPort },
})
const frontend = run('pnpm', ['dev', '--host', '127.0.0.1', '--port', frontendPort, '--strictPort'], FRONTEND, {
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

backend.on('exit', (code) => {
  if (!stopping) console.error(`[dev] 后端退出了（退出码 ${code}），前端一起停止`)
  stop(code ?? 1)
})
frontend.on('exit', (code) => {
  if (!stopping) console.error(`[dev] 前端退出了（退出码 ${code}），后端一起停止`)
  stop(code ?? 1)
})
process.on('SIGINT', () => stop(0))
process.on('SIGTERM', () => stop(0))
