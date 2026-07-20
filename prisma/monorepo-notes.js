const monorepoNotes = {
  "system_design-monorepo-1": `核心概念
Workspace 是由一个根目录统一管理多个 package / app 的机制。npm、pnpm 和 Yarn 都支持 workspace。根 package.json 声明成员目录，包管理器统一解析依赖，并把本地包链接起来。

为什么使用
它让多个项目共享一份 lockfile、依赖安装流程和脚本入口，也方便跨包修改、统一测试和原子提交。

需要说清的点
- workspace 是包管理层能力，不等于完整的 monorepo 构建系统。
- pnpm 使用内容寻址存储和严格依赖隔离，能减少幽灵依赖。
- 根目录适合放通用配置；每个 package 仍应保留清晰的依赖声明。

面试表达
“我会先用 pnpm workspace 管理依赖和本地包链接，再按规模决定是否引入 Turborepo 或 Nx 处理任务图、缓存和 affected builds。”

自检
为什么共享 lockfile 有利于可复现构建？什么是幽灵依赖？`,

  "system_design-monorepo-2": `核心概念
Monorepo 的关键不是把代码放进同一个仓库，而是设计清晰的边界。常见结构是 apps/ 放可部署产品，packages/ 放可复用能力。

边界原则
- app 可以依赖 package，package 不应反向依赖具体 app。
- 按业务能力拆包，避免按随意的技术碎片过度拆分。
- 每个 package 应有明确的 public API，外部只从入口导入。
- UI、配置、领域逻辑、数据访问可以分层，但不要制造循环依赖。

常见风险
“shared” 包不断膨胀，最终成为所有代码都能随意耦合的垃圾抽屉。可用 lint rule、dependency constraints 和 CODEOWNERS 保护边界。

面试表达
“我会让部署单元与共享包分离，并通过单向依赖、公开入口和边界检查降低仓库内的隐式耦合。”

自检
什么时候值得新建 package？如何阻止跨包引用内部文件？`,

  "system_design-monorepo-3": `核心概念
内部依赖是仓库内 package 之间的依赖。它们应该像外部 npm 包一样被显式声明，而不是依赖目录位置或隐式 hoisting。

实践方式
- 使用 workspace 协议，例如 "ui": "workspace:*"。
- 只通过包名和 public exports 导入。
- package.json 正确区分 dependencies、devDependencies 和 peerDependencies。
- React 这类宿主必须共享的依赖通常放 peerDependencies，避免产生多个实例。
- TypeScript paths 只解决编译期寻址，不能替代真实 package 依赖。

风险
循环依赖会让构建顺序、初始化时机和缓存失去确定性；幽灵依赖会导致本地能跑、隔离构建失败。

面试表达
“我把内部包当作真正的产品接口管理：显式声明版本、限制深层导入，并用依赖图发现循环。”

自检
为什么仅配置 tsconfig paths 不够？peerDependencies 适合什么场景？`,

  "system_design-monorepo-4": `核心概念
Monorepo 中的 versioning 常见两种策略：
1. Fixed / lockstep：所有包共享版本，一起发布。
2. Independent：每个包独立版本和发布节奏。

如何选择
强耦合、总是一起交付的包适合 fixed；被多个团队或外部消费者独立使用的库更适合 independent。仅供仓库内部使用的 private packages 往往不需要公开发布版本。

发布流程
Changesets 可以记录变更类型，计算 semver、生成 changelog，并在 CI 中创建发布 PR。发布时还要更新内部依赖范围。

权衡
统一版本简单但会产生无意义升级；独立版本精确但依赖协调和兼容矩阵更复杂。

面试表达
“版本策略取决于发布边界，而不是仓库形式。内部应用包可以保持 private，公共库再用 Changesets 管理独立 semver。”

自检
什么时候 breaking change 应升级 major？内部包是否一定要发布到 registry？`,

  "system_design-monorepo-5": `核心概念
增量构建只执行本次变更真正影响到的任务，而不是每次重建整个仓库。它依赖 package graph 和 task graph。

工作方式
如果 app-web 依赖 ui，ui 发生变化，那么 ui 的 build 以及 app-web 的 test/build 都可能受影响。调度器需要尊重拓扑顺序，先构建依赖，再构建消费者；互不依赖的任务可以并行。

任务输入
源码、配置、环境变量、lockfile 和上游输出都可能影响结果。输入声明不完整会产生错误复用，声明过宽则会降低命中率。

面试表达
“我会根据依赖图计算受影响范围，按拓扑顺序执行任务，并让无依赖任务并行，从 O(全仓库) 降到 O(受影响子图)。”

自检
修改根 tsconfig 为什么可能影响所有包？增量构建和缓存有什么区别？`,

  "system_design-monorepo-6": `核心概念
Build cache 用“任务 + 输入哈希”作为 key，复用此前的输出和日志。相同输入应得到相同输出，因此可缓存任务必须尽量确定性。

本地与远程缓存
本地缓存加速个人重复执行；远程缓存让 CI 和团队成员共享结果。缓存通常保存 dist、测试结果等声明过的 outputs。

正确性要点
- 把源码、依赖版本、配置和必要环境变量纳入 hash。
- 不缓存带时间、随机数或外部状态的非确定任务。
- secrets 不应进入缓存产物，也要谨慎参与 key。
- 明确 cache invalidation；错误缓存比无缓存更危险。

面试表达
“缓存优化的核心是正确描述输入和输出。我会先保证任务确定性，再引入 remote cache，并监控命中率和错误失效。”

自检
为什么 lockfile 必须参与 hash？环境变量遗漏会造成什么问题？`,

  "system_design-monorepo-7": `核心概念
Affected projects 是从 Git 变更文件出发，映射到所属 project，再沿依赖图向下游传播，得到本次需要测试、构建或部署的集合。

计算过程
1. 比较 base 与 head commit。
2. 找出 changed files。
3. 判断直接受影响的 projects。
4. 加入依赖这些 projects 的消费者。
5. 根据任务类型执行 test/build/lint。

边界情况
lockfile、根配置、CI 配置或共享工具链变化可能影响大量甚至全部项目。动态运行时依赖如果未体现在图中，也可能漏算。

面试表达
“Affected 并不是只测试改过的目录，还要沿反向依赖图加入所有消费者，并为全局文件定义显式规则。”

自检
修改共享 UI 包时哪些 app 应进入 affected 集合？如何选择可靠的 Git base？`,

  "system_design-monorepo-8": `核心概念
Monorepo CI/CD 的目标是在保持正确性的前提下，只执行必要任务，并让每个可部署 app 保持独立发布能力。

推荐流水线
install（锁定版本）→ lint/typecheck/test → build → deploy。利用 affected graph 缩小范围，利用 remote cache 复用结果，并按任务图并行。

工程要点
- lockfile 使用 frozen 模式，保证可复现。
- CI job 共享缓存，但部署权限和 secrets 按 app 隔离。
- 每个 app 有独立 artifact 和部署记录。
- 主干保护要求关键检查通过。
- 需要处理多个项目同时变化时的原子性与回滚。

权衡
单一巨大 pipeline 简单但缓慢；过度拆分会增加编排和观察成本。

面试表达
“代码统一管理不代表一起部署。我会共享验证基础设施，但按 app 生成不可变 artifact，并独立部署与回滚。”

自检
如何避免未受影响项目拖慢 CI？共享包变化后应该部署哪些 app？`,

  "system_design-monorepo-9": `核心概念
Code ownership 明确目录或 package 的维护责任。GitHub CODEOWNERS 可以自动请求对应团队 review，但它只是治理工具，不替代架构边界。

实践方式
- ownership 与业务领域或 package 边界对齐。
- 对关键配置、设计系统、认证和发布脚本设置强制 review。
- 每个包提供 README、负责人、稳定性级别和变更规范。
- ownership 不应只有一个人，避免 bus factor。
- 对跨团队公共包定义 RFC 或升级流程。

风险
规则过细会让每个 PR 等待大量 reviewer；规则过松则公共基础设施无人负责。

面试表达
“我会让 ownership 跟领域边界一致，并对高影响目录启用强制审核，同时为共享包明确升级与弃用机制。”

自检
CODEOWNERS 能否阻止不合理依赖？公共 UI 包应该由谁负责？`,

  "system_design-monorepo-10": `Turborepo
偏轻量，围绕 package.json scripts 构建 task graph，配置直观，适合已有 workspace 渐进接入。强项是并行任务、本地/远程缓存和较低迁移成本。

Nx
更完整的平台，拥有 project graph、affected commands、生成器、插件、边界规则和迁移工具。适合大型、多技术栈或需要强治理的仓库，但概念和配置成本更高。

选择维度
- 仓库规模与团队数量
- 是否需要 generators 和统一约束
- 是否有非 JavaScript 项目
- 迁移成本与团队学习成本
- 缓存、可观察性和云服务需求

不要这样回答
不要只说“某工具更快”。两者都能做任务编排和缓存，区别更在治理深度、生态与操作模型。

面试表达
“小到中型前端 workspace 我倾向先用 Turborepo；如果需要强 project graph、affected 分析和组织级约束，我会评估 Nx。”

自检
不用二者、只用 workspace scripts 是否可行？什么需求会推动团队选择 Nx？`,

  "system_design-monorepo-11": `主要成本
- 仓库 checkout、依赖安装、IDE 索引和 CI 可能随规模变慢。
- 根配置升级具有较大爆炸半径。
- 共享代码太方便，容易形成不健康耦合。
- 权限隔离比多仓库困难。
- 工具链、缓存和发布流程需要专门维护。

何时不适合
团队完全独立、技术栈毫无关联、代码有严格访问隔离，或项目很少共享变更时，多仓库可能更简单。

控制方式
清晰 package 边界、dependency constraints、affected CI、remote cache、ownership、可观察的构建指标，以及定期清理无主包。

判断标准
Monorepo 的价值来自“跨项目协作和原子变更”，不是时髦。要比较它减少的协作成本是否大于新增的平台成本。

面试表达
“我不会默认选择 monorepo；只有共享代码、跨项目原子修改和统一工程治理带来的收益足够大时才采用。”

自检
Monorepo 与 microfrontend 是否必须一起使用？什么迹象说明仓库治理正在失控？`,
};

module.exports = { monorepoNotes };
