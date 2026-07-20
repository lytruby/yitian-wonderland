const frontendNotes = {
  "frontend-javascript-1": `核心概念
作用域决定变量在哪里可见。JavaScript 使用词法作用域：函数能访问哪些变量，由它定义的位置决定，而不是调用位置。let/const 是块级作用域，var 是函数作用域，并存在提升。

闭包
函数与其定义时的词法环境组合形成闭包。即使外层函数已经返回，内层函数仍能访问外层变量。常用于封装私有状态、回调和函数工厂。

注意
- 闭包捕获的是变量绑定，不是创建时的值。
- 长期存活的闭包可能保留大对象，造成内存占用。
- 循环中 var 共享同一个绑定；let 会为每次迭代创建绑定。

面试表达
“闭包让函数携带其词法环境，因此状态可以跨调用保存；代价是被引用的环境不能被垃圾回收。”

自检
词法作用域和动态作用域有什么不同？为什么 setTimeout 循环中 var 常得到同一个值？`,

  "frontend-javascript-2": `核心概念
this 不是由函数写在哪里决定，而通常由函数如何调用决定。

绑定规则
- obj.fn()：this 是 obj。
- fn()：严格模式下 this 是 undefined。
- fn.call(x) / apply / bind：显式绑定为 x。
- new Fn()：this 是新创建的实例。
- 箭头函数：没有自己的 this，沿词法作用域向外取。

优先级通常是 new > 显式绑定 > 隐式绑定 > 默认绑定。把 obj.fn 赋给变量后再调用会丢失 obj。

React 中
函数组件通常不依赖 this；箭头函数适合回调中继承外层 this，但不适合作为需要动态 this 的对象方法。

自检
bind 与 call 的区别是什么？为什么箭头函数不能用作构造函数？`,

  "frontend-javascript-3": `核心概念
对象读取属性时，先查自身；没有就沿 [[Prototype]] 链向上查，直到 null。class 是基于原型机制的语法糖。

关键关系
- obj.__proto__ 指向创建它的构造函数的 prototype（不建议业务代码直接使用 __proto__）。
- Fn.prototype 是 new Fn() 实例共享的方法对象。
- Object.getPrototypeOf(obj) 用于读取原型。
- hasOwn() 只检查自身属性，in 会沿原型链查找。

优点
方法放在 prototype 上可被实例共享，不必为每个实例复制。

注意
修改内建对象原型会污染全局；过长原型链增加理解成本。Object.create(null) 可创建无 Object.prototype 的字典对象。

自检
prototype 和实例原型有什么区别？new 操作符依次做了什么？`,

  "frontend-javascript-4": `核心概念
JavaScript 主线程一次只执行一个调用栈。异步能力由宿主环境提供；任务完成后，回调进入相应队列，事件循环在栈清空时调度。

顺序
一次 task（如 script、setTimeout）执行完后，浏览器会清空 microtask 队列，再获得渲染机会，然后处理下一个 task。

常见分类
- microtask：Promise.then、queueMicrotask、MutationObserver。
- task：setTimeout、事件回调、网络回调。
- requestAnimationFrame 在下一次绘制前执行。

风险
不断产生 microtask 会阻塞渲染；长任务会导致输入延迟。可拆分计算、交给 Worker，或在任务间让出主线程。

自检
为什么 Promise.then 通常先于 setTimeout(..., 0)？async/await 的后半段进入哪个队列？`,

  "frontend-javascript-5": `核心概念
Promise 是一个“未来结果的容器”，用于描述一个现在还不知道结果的操作。

三个状态
- pending：等待中。
- fulfilled：操作成功。
- rejected：操作失败。

状态只能发生一次变化：
pending → fulfilled
pending → rejected

一旦确定就不可逆。多次调用 resolve 或 reject，只有第一次有效。

基本结构
const promise = new Promise((resolve, reject) => {
  // 启动任务
  // 成功：resolve(value)
  // 失败：reject(error)
});

Executor 的作用
传给 new Promise 的函数叫 executor。它会在创建 Promise 时立即、同步执行，负责：
1. 启动任务或注册异步操作。
2. 成功时调用 resolve。
3. 失败时调用 reject。

Executor 执行结束不等于 Promise 已完成。比如 executor 同步注册 setTimeout 后很快结束，但 Promise 要等定时器中调用 resolve 才会 fulfilled。

resolve 和 reject 不是必须声明的语法参数。如果 executor 不需要使用它们，可以写 new Promise(() => {})，语法完全合法；但如果之后也没有调用 resolve/reject，这个 Promise 会永远保持 pending，then 和 catch 都不会执行。

同步与异步
new Promise(executor) 中的 executor 同步执行；then、catch、finally 注册的回调在 Promise settled 后进入微任务队列。

例如：
console.log(1);
new Promise(() => console.log(2));
console.log(3);

输出 1、2、3，因为 executor 立即执行。

微任务与宏任务
常见微任务：
- Promise.then / catch / finally
- queueMicrotask
- await 后面的代码

常见宏任务（task）：
- 当前整体 script
- setTimeout / setInterval
- DOM 事件和部分网络回调

事件循环的基本顺序：
执行一个宏任务 → 清空所有微任务 → 浏览器可能渲染 → 下一个宏任务。

示例：
console.log(1);
Promise.resolve().then(() => console.log(2));
setTimeout(() => console.log(3));
console.log(4);

输出：1、4、2、3。
原因：先执行同步代码，再清空 Promise 微任务，最后执行 setTimeout 宏任务。调用 resolve 不会立刻执行 then；then 要等当前同步代码结束。

链式调用
每次 then 都返回一个新的 Promise，因此可以链式调用。
- 回调返回普通值：新 Promise fulfilled，结果是该值。
- 回调返回另一个 Promise：新 Promise 等待它。
- 回调抛出错误：新 Promise rejected。
- 没有 return：新 Promise fulfilled，结果是 undefined。

catch 是 then(undefined, onRejected) 的语法形式。错误会沿链向后传递，直到被 catch 处理。finally 无论成功失败都会执行，通常用于清理 loading，并通常透传原状态。

组合
- Promise.all：全部成功；任一失败立即 reject。
- allSettled：等待全部并返回每项结果。
- race：第一个 settled 的结果。
- any：第一个 fulfilled；全部失败才 reject。

注意
Promise 本身不能取消，通常使用 AbortController 取消底层请求。Promise.all 中一个任务失败，也不会自动取消其他任务。

Executor 内同步抛出的错误会自动使 Promise rejected；setTimeout 等异步回调中抛出的错误不会被 executor 自动捕获，需要在异步回调里手动 reject(error)。

自检
1. Executor 是同步还是异步执行？
2. 为什么 new Promise(() => {}) 会永久 pending？
3. 调用 resolve 后，then 是否立即执行？
4. 为什么 Promise.then 通常先于 setTimeout？
5. then 返回普通值、Promise、抛错和不 return 时分别会怎样？
6. Promise.all 会自动取消其他请求吗？`,

  "frontend-javascript-6": `核心概念
async 函数总是返回 Promise。await 会暂停当前 async 函数，把控制权交还调用者；等待结果 settled 后，后续代码以 microtask 继续执行，并不会阻塞整个线程。

错误处理
可使用 try/catch，也可以让 async 函数返回 rejected Promise 给上层处理。

并发
连续 await 会串行执行。互不依赖的任务应先启动，再 Promise.all：
const [user, posts] = await Promise.all([getUser(), getPosts()]);

注意
- 数组 forEach 不会等待 async 回调；串行用 for...of，并发用 Promise.all(map(...))。
- 并发量过大时需要队列或 limit。
- 使用 AbortController 处理组件卸载、超时和竞态。

自检
await 后面的代码何时继续？如何避免无意的串行请求？`,

  "frontend-javascript-7": `核心概念
ES Module 使用静态 import/export，依赖可在执行前分析，支持 tree shaking。CommonJS 使用运行时 require 和 module.exports。

ESM 特性
- 模块默认严格模式。
- 顶层绑定是模块私有的。
- import 是只读的 live binding：导出方更新后，导入方能看到新值。
- 模块通常只执行一次并被缓存。
- dynamic import() 返回 Promise，可用于按需加载。

循环依赖
ESM 能建立循环图，但读取尚未初始化的绑定仍可能报错，且会使架构难懂。应提取共同依赖或反转依赖。

Tree shaking
依赖静态结构和无副作用假设；package.json 的 sideEffects 配置会影响优化。

自检
default export 与 named export 如何选择？为什么动态 import 适合 code splitting？`,

  "frontend-javascript-8": `核心概念
Debounce：事件停止触发一段时间后才执行，适合搜索输入、保存草稿。
Throttle：在持续触发期间，每个时间窗口最多执行一次，适合滚动位置、拖拽反馈。

实现要素
两者都需要闭包保存 timer 或上次执行时间，并正确保留 this 与参数。实际工具通常还支持 leading、trailing、cancel、flush。

Debounce 实现
function debounce(fn, delay) {
  let timer = null;

  return function (...args) {
    const context = this;
    clearTimeout(timer);

    timer = setTimeout(() => {
      fn.apply(context, args);
    }, delay);
  };
}

每次调用都会清除上一次定时器并重新计时。只有停止触发达到 delay 后，fn 才执行。

Throttle 实现
function throttle(fn, delay) {
  let lastTime = 0;

  return function (...args) {
    const now = Date.now();

    if (now - lastTime >= delay) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

持续触发时，只有距离上次真正执行已经超过 delay，fn 才会再次执行。这个版本是 leading throttle，不保证停止触发后补执行最后一次。

选择
- 用户只关心最终结果：debounce。
- 用户需要持续但受控的反馈：throttle。
- 与绘制同步的视觉更新可用 requestAnimationFrame 节流。

注意
组件卸载时清理 timer；React 中要保持包装函数引用稳定，否则每次渲染都会创建新的计时状态。

自检
搜索建议为何常用 debounce？无限滚动为何更适合 throttle？`,

  "frontend-javascript-9": `核心区别
- var：函数作用域，可以重复声明，声明会提升并初始化为 undefined。
- let：块级作用域，可以重新赋值，但不能在同一作用域重复声明。
- const：块级作用域，声明时必须赋值，变量绑定不能重新指向其他值。

暂时性死区
let 和 const 的声明也会被提升，但从作用域开始到声明语句执行前处于 TDZ，访问会抛出 ReferenceError。这能让“先使用、后声明”的错误更早暴露。

const 的含义
const 限制的是变量绑定，不会冻结对象：
const user = { name: "Yitian" };
user.name = "Tian"; // 可以
user = {}; // TypeError

循环闭包
for 循环中的 var 共享同一个绑定；let 会为每次迭代创建独立绑定，因此异步回调能得到各轮的值。

实践规则
默认使用 const；确实需要重新赋值时使用 let；现代业务代码一般不使用 var。

自检
为什么 const 对象仍能修改属性？var 的提升与 let 的 TDZ 有什么区别？`,

  "frontend-javascript-10": `核心区别
- map：把每个元素转换成新元素，返回一个通常等长的新数组。
- filter：根据条件保留元素，返回长度可能变化的新数组。
- reduce：把多个元素逐步累积成一个最终结果。
- forEach：遍历并执行副作用，返回值始终是 undefined。

Map
const numbers = [1, 2, 3];
const doubled = numbers.map((number) => number * 2);
// [2, 4, 6]

map 适合数据转换，不适合只为了 console.log、修改外部变量或发送请求。需要副作用时，forEach 更能表达意图。

Filter
const numbers = [1, 2, 3, 4];
const even = numbers.filter((number) => number % 2 === 0);
// [2, 4]

回调返回 truthy 时保留当前元素。filter 不会改变原数组，但数组中的对象仍与原数组共享引用。

Reduce
const total = [1, 2, 3].reduce((accumulator, current) => {
  return accumulator + current;
}, 0);
// 6

accumulator 保存上一次回调的结果，initialValue 是第一次计算的初始值。建议明确传入初始值：
- 空数组没有初始值时会抛出 TypeError。
- 有初始值时，空数组直接返回初始值。
- 初始值也让 accumulator 类型和业务含义更清楚。

Reduce 分组
const users = [
  { name: "A", role: "admin" },
  { name: "B", role: "user" },
  { name: "C", role: "admin" },
];

const grouped = users.reduce((result, user) => {
  result[user.role] ??= [];
  result[user.role].push(user);
  return result;
}, {});

常见陷阱：map(parseInt)
["1", "2", "3"].map(parseInt);
// [1, NaN, NaN]

map 会把 value、index、array 传给回调，而 parseInt 的第二个参数是 radix，所以实际近似：
parseInt("1", 0);
parseInt("2", 1);
parseInt("3", 2);

正确写法：
["1", "2", "3"].map((value) => parseInt(value, 10));

选择原则
- 一对一转换：map。
- 按条件筛选：filter。
- 汇总、计数、分组或建立索引：reduce。
- 只执行副作用：forEach。

不要为了“高级”而把所有逻辑塞进 reduce。简单的 map/filter 组合通常更容易阅读。

自检
1. map、filter、forEach 分别返回什么？
2. reduce 为什么建议传 initialValue？
3. 空数组执行 reduce 会发生什么？
4. ["1", "2", "3"].map(parseInt) 为什么不是 [1, 2, 3]？
5. 如何用 reduce 实现分组和计数？`,

  "frontend-browser-network-1": `主要过程
1. 解析 URL，检查缓存、Service Worker 与安全策略。
2. DNS 将域名解析为 IP。
3. 建立 TCP；HTTPS 还需要 TLS 握手。
4. 发送 HTTP 请求，经 CDN、负载均衡和服务器处理。
5. 接收响应，可边下载边解析 HTML。
6. 发现 CSS、JS、图片等子资源并继续请求。
7. 构建 DOM/CSSOM、生成渲染树，布局、绘制和合成。
8. JS 执行并可能继续修改页面；框架应用执行 hydration。

优化视角
DNS/TCP/TLS 影响连接时间；TTFB 反映后端与网络；关键资源影响 LCP；阻塞脚本和长任务影响交互。

自检
为什么 CSS 常被称为渲染阻塞资源？浏览器何时可以开始解析 HTML？`,

  "frontend-browser-network-2": `渲染流水线
HTML → DOM，CSS → CSSOM；两者结合生成 render tree。随后计算 layout（几何位置），paint（绘制指令），最后 compositor 把各图层合成到屏幕。

JS 的影响
普通 script 会暂停 HTML 解析；defer 在解析完成后按顺序执行；async 下载完成即执行，顺序不保证。读取布局信息可能迫使浏览器同步完成之前积累的样式与布局计算。

合成友好属性
transform 和 opacity 通常可只触发 composite，但图层过多也会增加显存与管理成本，不能滥用 will-change。

性能思路
减少关键 CSS、避免长任务、批量 DOM 读写、优先改变不会触发布局的属性。

自检
DOM 和 render tree 是否一一对应？display:none 与 visibility:hidden 有什么渲染差异？`,

  "frontend-browser-network-3": `Reflow / Layout
元素尺寸或位置变化时，浏览器可能重新计算几何信息，例如修改 width、插入节点、改变字体或窗口尺寸。影响可能传播到祖先和兄弟节点。

Repaint
几何不变但视觉改变时重新绘制，例如 color、background、box-shadow。Reflow 通常会带来 repaint；repaint 不一定触发 reflow。

Layout thrashing
交替写 DOM 与读 offsetWidth/getBoundingClientRect，会迫使浏览器多次同步布局。应先批量读取，再批量写入，并用 rAF 安排视觉更新。

优化
优先 transform/opacity 动画；虚拟化长列表；减少复杂布局；谨慎使用 contain。

自检
为什么读取 offsetHeight 可能很昂贵？transform: translate 为什么通常比修改 left 更流畅？`,

  "frontend-browser-network-4": `缓存层次
浏览器可能使用 memory cache、disk cache、Service Worker cache，也可能经过 CDN。HTTP 缓存由响应头控制。

强缓存
Cache-Control: max-age 在有效期内直接使用缓存。immutable 表示版本化资源不会改变。no-store 表示不存储；no-cache 不是不缓存，而是每次使用前验证。

协商缓存
过期后携带 If-None-Match/ETag 或 If-Modified-Since；未变化返回 304。ETag 通常比 Last-Modified 更精确。

实践
带内容 hash 的静态资源可设长期缓存；HTML 通常短缓存或验证，以便引用最新资源。Vary 告诉缓存响应受哪些请求头影响。

自检
no-cache 和 no-store 的区别？为什么 app.js 应使用内容 hash？`,

  "frontend-browser-network-5": `核心概念
同源策略限制页面读取不同 scheme、host 或 port 的资源。CORS 是服务器通过响应头，明确允许某些跨源读取的机制，不是前端绕过安全限制的方法。

简单请求
满足限定方法、头和 Content-Type 时可直接发送，浏览器检查 Access-Control-Allow-Origin。

预检
其他请求先发送 OPTIONS，询问允许的方法、请求头和凭证。预检结果可通过 Access-Control-Max-Age 缓存。

凭证
跨源携带 cookie 需要客户端 credentials: include，服务端允许 credentials，并且 Allow-Origin 不能是 *。Cookie 的 SameSite 也会影响发送。

注意
CORS 由浏览器执行，服务器间请求不受它限制；请求可能已到达服务器，只是响应被浏览器阻止读取。

自检
什么情况触发 preflight？为什么 Postman 请求成功而浏览器失败？`,

  "frontend-browser-network-6": `常见存储
- Cookie：每次匹配请求自动携带；容量小，可设置 HttpOnly、Secure、SameSite，适合会话标识。
- localStorage：同步、持久、同源，约数 MB；会阻塞主线程，不应保存敏感 token。
- sessionStorage：与标签页会话绑定。
- IndexedDB：异步、结构化、容量更大，适合离线数据。
- Cache API：保存 Request/Response，常配合 Service Worker。

安全
能被 JavaScript 读取的数据在 XSS 下都可能泄露。认证 cookie 宜使用 HttpOnly + Secure + 合适 SameSite，并配合 CSRF 防护。

选择
根据生命周期、容量、查询能力、是否需随请求发送及安全模型决定。

自检
为什么 localStorage 不适合大量数据？HttpOnly cookie 能防止什么，不能防止什么？`,

  "frontend-browser-network-7": `主要风险
XSS：不可信内容被当作脚本执行。防护包括默认转义、避免危险 HTML、输入验证、输出编码和 CSP。

CSRF：浏览器自动携带身份凭证，攻击站诱导用户发请求。使用 SameSite cookie、CSRF token，并验证 Origin/Referer。

其他
- 点击劫持：frame-ancestors 或 X-Frame-Options。
- 依赖供应链：锁定版本、审计依赖、最小权限。
- 开放重定向与不安全 URL。
- 敏感信息泄露到前端 bundle、日志或 source map。

原则
前端校验提升体验，不能作为安全边界；服务端必须重新鉴权和验证。HTTPS 保护传输，不解决 XSS。

自检
XSS 与 CSRF 的根本区别？CSP 为什么是纵深防御而不是唯一方案？`,

  "frontend-react-1": `核心模型
React 组件是根据 props、state 和 context 描述 UI 的函数。render 阶段计算下一棵元素树，应该保持纯净；commit 阶段才把变更应用到 DOM 并运行相应 effect。

触发渲染
组件初次挂载、自己的 state 更新、父组件渲染或读取的 context 改变。渲染不等于 DOM 一定变化，React 会比较结果后提交必要变更。

状态快照
每次 render 都看到当次 state 快照；事件处理器闭包也捕获那次值。批处理会合并同一轮更新，需要基于前值时使用 setState(prev => ...)。

Concurrent 思维
render 可能被暂停或重做，因此不能在 render 中产生副作用。

自检
父组件渲染时子组件一定修改 DOM 吗？为什么 render 必须是纯函数？`,

  "frontend-react-2": `Props
由父组件传入，应视为只读。它描述外部输入。

State
组件自己的记忆，通过 setter 更新；不要直接修改对象或数组，应创建新引用，让 React 能识别变化。

设计原则
- 能从 props/state 计算出的值不要再存一份，避免状态不同步。
- 把状态放在需要共享它的最近公共祖先。
- 用受控组件让表单值由 React state 驱动；非受控组件由 DOM 保存值。
- state 与组件在树中的位置关联，改变 key 可重置 state。

注意
初始化 state 使用 props 后不会自动跟随 props 更新；通常应直接计算或明确同步原因。

自检
什么时候需要 lifting state up？为什么不应在 state 中保存 filteredList？`,

  "frontend-react-3": `Hooks 规则
只在 React 函数组件或自定义 Hook 顶层调用，不能放在条件、循环或普通函数中。React 依赖固定调用顺序把状态与每个 Hook 对应。

常用 Hook
- useState：局部状态。
- useReducer：复杂状态转换。
- useRef：跨渲染保存可变值，不触发渲染。
- useMemo/useCallback：缓存计算或函数身份，是性能工具而非语义保证。
- useContext：读取上下文。

自定义 Hook
提取可复用的有状态逻辑，而不是共享同一份状态。命名以 use 开头，并把依赖显式传入。

闭包
Hook 回调会捕获某次 render 的值；依赖数组应如实描述外部引用。

自检
为什么 Hook 不能条件调用？useRef 与 useState 的区别？`,

  "frontend-react-4": `核心定位
useEffect 用于让 React 与外部系统同步，例如订阅、网络连接、定时器或非 React 控件。能在 render 或事件处理中完成的逻辑通常不需要 effect。

生命周期
commit 后运行 setup；依赖变化前先运行上一次 cleanup，再运行新 setup；卸载时 cleanup。开发环境 Strict Mode 可能额外执行 setup→cleanup→setup，以暴露不对称逻辑。

依赖
Effect 内使用的响应式值应出现在依赖数组。对象和函数的新身份会导致重复执行，可移入 effect、稳定引用或重新设计。

请求
处理竞态与取消：使用 AbortController 或 ignore 标志。框架的数据加载方案通常比手写 effect 更适合 SSR 和缓存。

自检
为什么不该用 effect 计算 derived state？cleanup 应该清理哪些资源？`,

  "frontend-react-5": `核心流程
state / props 更新 → re-render（重新调用组件）→ 生成新的 React 元素树 → reconciliation（协调）→ commit（更新必要的真实 DOM）→ 浏览器 paint。

注意：re-render 不等于 DOM 一定更新。

虚拟 DOM
虚拟 DOM 是对 UI 结构的 JavaScript 对象描述。React 用它表达“UI 应该是什么样”，再协调新旧元素树。它不是真实 DOM 的完整复制，也不保证比所有手写 DOM 操作都快；核心价值是声明式开发、可维护性和足够好的通用性能。

Reconciliation
协调是 React 判断节点应当复用、更新、移动、创建还是卸载的过程。可以用“身份 ≈ 树中位置 + type + key”来理解。

- 同一位置、type 相同：通常复用节点和组件 state，只更新变化的属性。
- type 不同：替换旧子树，内部组件可能重新挂载并重置 state。
- key 相同但 type 不同：仍然不会复用。

key 的作用
key 帮助 React 在同一组兄弟节点中识别元素身份。列表插入、删除或排序时，React 根据 key 判断哪些项目应复用、移动、创建或卸载。

好 key 的条件：稳定、可预测、在兄弟节点中唯一。优先使用稳定的业务 id：

users.map((user) => (
  <UserRow key={user.id} user={user} />
));

key 不需要全局唯一，只需在当前兄弟集合中唯一。它是 React 使用的特殊属性，不会作为普通 prop 传入组件；组件需要 id 时应另外传入 itemId。

为什么动态列表不建议使用 index
index 描述的是位置，不是数据身份。列表在头部插入、删除或排序后，React 会按原位置复用组件，可能让本地 state 跟错数据，造成输入框、checkbox、focus 或动画错位。

只有当列表完全静态、不会排序或增删，并且项目没有需要跟随数据身份的本地状态时，index 才通常安全。

为什么不能使用随机 key
Math.random() 或 Date.now() 会让每次 render 都得到新 key。React 会卸载旧组件再挂载新组件，造成 state 重置、Effect cleanup/setup、DOM 重建和性能损失。这是 remount，不是普通 re-render。

key 与 state
改变 key 会让 React 将元素视为新身份，因此可以有意重置组件状态：

<EditForm key={selectedUserId} user={selectedUser} />

切换用户后旧表单卸载，新表单重新初始化。这个技巧应当用于确实需要重置组件身份的场景。

Fragment
列表中的 Fragment 需要 key 时，不能使用 <>...</> 短语法，应使用完整写法：

items.map((item) => (
  <Fragment key={item.id}>
    <dt>{item.name}</dt>
    <dd>{item.description}</dd>
  </Fragment>
));

高频陷阱
- 动态列表使用 key={index}：state 可能跟着位置走。
- 使用 key={Math.random()}：每次都 remount。
- 认为相同 key 一定复用：还要看 type 和树中位置。
- 在组件内读取 props.key：结果是 undefined。
- 认为 re-render 等于 DOM 更新：React 可能发现输出没变而不修改 DOM。

面试表达
“虚拟 DOM 是 React 对 UI 的 JavaScript 对象描述。数据更新后，React 重新执行组件生成新的元素树，通过 reconciliation 比较新旧树，并在 commit 阶段更新必要的真实 DOM。协调时 React 主要根据元素类型以及同级节点的 key 判断身份。key 应稳定、可预测且在兄弟节点中唯一；动态列表使用 index 可能让 state 跟随位置，随机 key 则会导致组件每次 remount。”

自检
1. 删除列表首项时，index key 为什么可能造成输入框或 checkbox 状态错位？
2. key 是否需要全局唯一？
3. key 改变后，组件是 re-render 还是 remount？
4. 为什么相同 key、不同 type 的节点仍不能复用？
5. 虚拟 DOM 是否一定比直接操作真实 DOM 更快？`,

  "frontend-react-6": `选择层级
1. 组件局部 state：默认选择。
2. 提升到最近公共祖先：少量兄弟共享。
3. Context：跨层传递低频全局值，如主题、用户。
4. 外部 store：复杂跨页面状态、高频更新或需要开发工具。
5. Server state 工具：请求缓存、失效、重试与同步，不应和客户端 UI state 混为一谈。

设计
按领域拆分状态，保持最小源数据，派生值现场计算。避免一个巨型全局 store。Context value 频繁变化会使消费者重渲染，可拆分 context。

状态机
多步骤流程和复杂状态转换适合 reducer 或显式状态机，避免多个 boolean 组合出非法状态。

自检
Context 为什么不等于完整状态管理？表单输入是否应该全部放进全局 store？`,

  "frontend-react-7": `先测量
使用 React Profiler、浏览器 Performance 和 Web Vitals 找真正瓶颈，不要默认 memo 一切。

常见优化
- 把 state 放得更靠近使用处，缩小更新范围。
- 保持组件纯净，避免不必要 effect。
- React.memo 跳过 props 未变的子组件渲染。
- useMemo 缓存昂贵计算；useCallback 稳定传给 memo 子组件的函数。
- 虚拟化超长列表。
- code splitting 减少初始 JavaScript。
- transition/deferred value 降低非紧急更新对输入的阻塞。

注意
memo 有比较成本，并会被每次新建的对象/函数 props 破坏。性能也包括网络、bundle、布局和图片，不只是 render 次数。

自检
什么时候 React.memo 没有效果？如何判断慢的是 render 还是网络？`,

  "frontend-react-8": `SSR
服务器把组件渲染成 HTML，用户可更早看到内容，也利于 SEO。HTML 本身尚不能响应 React 事件。

Hydration
客户端 React 在现有 HTML 上恢复组件树、状态与事件绑定。服务端首屏输出必须与客户端第一次 render 一致，否则出现 hydration mismatch。

常见不一致
render 中使用 Date.now、Math.random、window、用户本地时区或不同数据。应传递一致快照，把仅客户端逻辑放到 effect，或有意识地隔离动态区域。

权衡
SSR 增加服务器成本和架构复杂度；流式 SSR 与 Suspense 可逐步发送内容。Server Components 可减少客户端 JS，但交互组件仍需客户端边界。

自检
SSR HTML 为什么还不能点击交互？hydration mismatch 常由什么引起？`,

  "frontend-css-1": `盒模型
元素由 content、padding、border、margin 构成。默认 content-box 下 width 只代表内容宽度，总宽度还要加 padding 和 border。

border-box
box-sizing: border-box 让声明的 width 包含 padding 和 border，更容易布局，通常全局启用：
*, *::before, *::after { box-sizing: border-box; }

细节
- margin 不属于盒子尺寸，垂直块级 margin 在特定条件下会折叠。
- inline 元素的宽高行为与 block 不同。
- 百分比 padding 通常相对包含块宽度计算。
- min-width: auto 可能让 flex item 无法收缩，常需 min-width: 0。

自检
width:100% 加 padding 为什么可能溢出？margin collapsing 在什么方向发生？`,

  "frontend-css-2": `核心模型
Flexbox 是一维布局：沿 main axis 排列 item，并在 cross axis 对齐。flex-direction 决定主轴。

常用属性
- 容器：display:flex、justify-content、align-items、gap、flex-wrap。
- 项目：flex-grow、flex-shrink、flex-basis、align-self。
- flex: 1 通常近似 1 1 0%，表示共同分配可用空间。

容易混淆
justify-content 沿主轴，align-items 沿交叉轴。项目默认 min-width:auto，内容可能阻止收缩。margin-left:auto 可吸收主轴剩余空间。

使用场景
导航、工具栏、卡片内部排列、居中和一维响应式布局。

自检
flex-basis 与 width 谁优先？为什么 flex 子元素文字可能撑破容器？`,

  "frontend-css-3": `核心模型
Grid 是二维布局，同时控制行和列。容器定义 tracks，子项放入 grid cells，也可以跨行列。

常用写法
grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
可根据空间自动调整列数。fr 分配剩余空间；minmax 定义轨道范围；gap 设置间距。

布局能力
可用显式网格、自动放置、grid-column/row、命名区域。auto-fill 保留空轨道，auto-fit 会折叠空轨道并拉伸已有项目。

选择
二维页面或卡片网格用 Grid；内容驱动的一维排列用 Flex。两者可以组合，不是竞争关系。

自检
auto-fit 与 auto-fill 的区别？什么时候 Grid 比 Flex 更合适？`,

  "frontend-css-4": `定位
- static：正常文档流。
- relative：保留原位置，并成为绝对定位后代的包含块之一。
- absolute：脱离正常流，相对最近的定位祖先。
- fixed：通常相对视口。
- sticky：达到阈值前在流中，之后在滚动容器内吸附。

Stacking context
z-index 只在对应层叠上下文中比较。position + z-index、opacity<1、transform、filter 等都可能创建新的 stacking context。

常见问题
子元素 z-index 再大也无法越过父层叠上下文的兄弟。sticky 失效常与错误滚动容器、缺少 top 或祖先 overflow 有关。

自检
为什么 z-index:9999 仍可能被遮挡？absolute 的包含块如何确定？`,

  "frontend-css-5": `核心原则
响应式设计不是为几个设备写固定页面，而是让布局根据可用空间、内容和用户偏好适应。

手段
- mobile-first：基础样式适合小屏，再用 min-width media query 增强。
- 流式尺寸：%、fr、minmax、clamp。
- 图片使用 max-width、srcset、sizes。
- container queries 让组件按容器而非视口适应。
- 尊重 prefers-reduced-motion、颜色对比和触控目标。

断点
根据内容何时失效选择，而不是只跟随设备型号。避免仅靠隐藏内容解决小屏问题。

自检
media query 与 container query 分别适合什么？为什么响应式不仅是屏幕宽度？`,

  "frontend-engineering-1": `核心价值
TypeScript 在编译期检查 JavaScript 程序，改善重构、接口约束和编辑器体验；类型在运行时被擦除，因此外部数据仍需运行时验证。

重要概念
- structural typing：结构兼容即可赋值。
- union + narrowing：通过 typeof、in、判别字段缩小类型。
- generics：保留输入输出之间的类型关系。
- unknown 比 any 安全，使用前必须收窄。
- never 表示不可能值，可做穷尽检查。

实践
优先推断，避免无意义断言；用 discriminated union 表达状态；API 边界配合 Zod 等验证。开启 strict。

自检
type 与 interface 的常见差异？unknown 为什么优于 any？`,

  "frontend-engineering-2": `Bundler 做什么
从入口构建模块依赖图，解析 JS/TS/CSS/资源，经过转换与优化，输出浏览器可加载的 chunks。

常见阶段
resolve → load/transform → link graph → tree shaking → chunking → minify → emit。开发环境还需要 dev server 与 HMR。

工具差异
Webpack 配置与生态成熟；Vite 开发期利用原生 ESM，生产常由 Rollup 打包；esbuild/SWC/Rspack 用更快语言实现转换或构建。

关键概念
loader/plugin、source map、content hash、side effects、externals、target 与 polyfill。编译新语法不等于补齐运行时 API。

自检
为什么需要 dependency graph？Babel 转译 async 之后是否自动提供所有浏览器 API？`,

  "frontend-engineering-3": `目标
Code splitting 把一个大 bundle 拆成按需加载的 chunks，降低初始下载、解析和执行成本。

方式
- 路由级拆分：每个页面独立 chunk。
- 组件级动态 import：重型编辑器、图表或低频弹窗按需加载。
- vendor/shared chunk：复用公共依赖，但要避免过度拆碎。

React
React.lazy(() => import("./Editor")) 配合 Suspense。Next.js 可使用 dynamic import，并根据 Server/Client Component 边界减少客户端 JS。

权衡
chunk 太少导致首包大；太多会增加请求和调度开销。应 preload 即将需要的资源，并处理 loading/error 状态。

自检
dynamic import 为什么能形成拆分点？什么组件不值得单独拆包？`,

  "frontend-engineering-4": `测试层级
- Unit：纯函数和小模块，快且定位清楚。
- Integration：多个模块或组件协作，是前端测试主力。
- E2E：从用户视角验证关键流程，真实但更慢、更易受环境影响。

原则
测试可观察行为，而不是内部实现。React Testing Library 倡导按角色、标签和文本操作，接近用户使用方式。网络可用 MSW 在边界模拟。

策略
关键业务路径、复杂状态转换、错误与边界条件优先。不要追求空洞覆盖率。测试应确定性、独立，并给出清晰失败原因。

金字塔不是硬规则
组件集成测试通常比大量细碎 unit test 更有价值；保留少量关键 E2E。

自检
为什么不建议断言组件内部 state？哪些流程最值得写 E2E？`,

  "frontend-engineering-5": `用户指标
Core Web Vitals：
- LCP：主要内容显示速度。
- INP：交互响应延迟。
- CLS：视觉稳定性。

优化路径
先用真实用户监控和 Lighthouse/Performance 定位瓶颈。网络侧优化缓存、压缩、CDN、图片和关键资源；JS 侧减少 bundle、code splitting、拆分长任务；渲染侧减少布局抖动与昂贵绘制。

加载优先级
预加载真正关键资源，延迟非关键脚本和图片。为图片设置尺寸避免 CLS。字体使用合理 preload、子集化和 font-display。

原则
性能是预算和持续监控，不是上线前一次优化；需要区分实验室数据与真实用户数据。

自检
LCP、INP、CLS 分别反映什么？为什么 bundle 变小不一定让 LCP 改善？`,

  "frontend-engineering-6": `错误分类
用户输入错误、预期业务错误、网络/服务错误、程序 bug 应区别处理。可恢复错误给出明确反馈和重试；未知错误记录上下文并降级。

分层处理
- 请求层统一规范超时、取消、状态码与错误类型。
- 领域层返回可理解的业务错误。
- UI 层决定 inline、toast、空状态或错误页。
- React Error Boundary 捕获后代 render 错误，但不自动捕获事件处理器和异步回调。

可观察性
记录错误消息、stack、版本、路由、关联 id 和必要上下文，同时避免上传敏感信息。Source map 应安全托管并与版本对应。

UX
保留用户输入，提供下一步，不把技术错误直接暴露给用户。

自检
Error Boundary 能捕获哪些错误？为什么不能只 catch 后显示 “Something went wrong”？`,
};

module.exports = { frontendNotes };
