// 提交前、交付前跑这一条：后端编译 + 接口测试，前端类型检查 + lint + 格式 + 单测 + 构建。
// 任何一步失败就以非 0 退出。
import { BACKEND, FRONTEND, MVNW, run, waitExit } from './lib.mjs'

const steps = [
  { name: '后端：编译和测试', command: MVNW, args: ['-q', '-B', 'verify'], cwd: BACKEND, env: { SPRING_PROFILES_ACTIVE: 'mock' } },
  { name: '前端：类型、lint、格式、单测', command: 'pnpm', args: ['check'], cwd: FRONTEND },
  { name: '前端：构建', command: 'pnpm', args: ['build'], cwd: FRONTEND },
]

for (const step of steps) {
  console.log(`\n[check] ${step.name}`)
  const code = await waitExit(run(step.command, step.args, step.cwd, { env: step.env }))
  if (code !== 0) {
    console.error(`\n[check] 失败：${step.name}（退出码 ${code}）`)
    process.exit(code)
  }
}
console.log('\n[check] 全部通过')
