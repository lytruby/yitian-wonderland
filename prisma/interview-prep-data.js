const catalog = {
  frontend: {
    JavaScript: [
      "Scope & Closure",
      "this",
      "Prototype Chain",
      "Event Loop",
      "Promise",
      "async / await",
      "Modules",
      "Debounce / Throttle",
      "Var, Let & Const",
      "Map, Filter, Reduce & forEach",
    ],
    "Browser & Network": [
      "What Happens After Entering a URL",
      "Browser Rendering Pipeline",
      "Reflow & Repaint",
      "HTTP Cache",
      "CORS",
      "Storage",
      "Frontend Security",
    ],
    React: [
      "Rendering Model",
      "State & Props",
      "Hooks",
      "useEffect",
      "Reconciliation & key",
      "State Management",
      "Performance",
      "SSR & Hydration",
    ],
    CSS: [
      "Box Model",
      "Flexbox",
      "Grid",
      "Positioning & Stacking Context",
      "Responsive Design",
    ],
    Engineering: [
      "TypeScript",
      "Bundling",
      "Code Splitting",
      "Testing",
      "Web Performance",
      "Error Handling",
    ],
  },
  system_design: {
    General: [
      "Requirement Clarification",
      "Scale & Constraints",
      "System Boundaries",
      "Component Design",
      "Data Flow",
      "API Design",
      "Performance & Reliability",
      "Security",
      "Trade-offs",
      "Evolution Plan",
    ],
    Microfrontend: [
      "When to Use Microfrontends",
      "Domain Boundaries",
      "Host & Remote",
      "Module Federation",
      "Routing",
      "Cross-App Communication",
      "Shared Dependencies",
      "Style Isolation",
      "Independent Deployment",
      "Version Compatibility",
      "Performance Cost",
      "When Not to Use It",
    ],
    Monorepo: [
      "Workspace",
      "App & Package Boundaries",
      "Internal Dependencies",
      "Versioning",
      "Incremental Build",
      "Build Cache",
      "Affected Projects",
      "CI/CD",
      "Code Ownership",
      "Turborepo / Nx",
      "Maintenance Cost",
    ],
    i18n: [
      "Locale Detection",
      "Locale Routing",
      "Translation Resources",
      "Translation Keys",
      "Server / Client Translation",
      "Lazy Loading",
      "Date, Number & Currency",
      "Plural Rules",
      "Fallback",
      "SEO",
      "RTL",
      "Translation Workflow",
    ],
  },
};

const leetcodeProblems = [
  {
    id: "leetcode-problem-27",
    track: "leetcode",
    section: "Two Pointers",
    title: "27. 移除元素",
    sourceUrl: "https://leetcode.cn/problems/remove-element/",
    status: "need_review",
  },
  {
    id: "leetcode-problem-209",
    track: "leetcode",
    section: "Sliding Window",
    title: "209. 长度最小的子数组",
    sourceUrl:
      "https://leetcode.cn/problems/minimum-size-subarray-sum/",
    status: "need_review",
  },
  {
    id: "leetcode-problem-20",
    track: "leetcode",
    section: "Stack / Queue",
    title: "20. 有效的括号",
    sourceUrl: "https://leetcode.cn/problems/valid-parentheses/",
    status: "need_review",
  },
  {
    id: "leetcode-problem-739",
    track: "leetcode",
    section: "Stack / Queue",
    title: "739. 每日温度",
    sourceUrl: "https://leetcode.cn/problems/daily-temperatures/",
    status: "need_review",
    notes:
      "核心思路：使用单调递减栈存下标。遍历 temperatures 时，如果当前温度高于栈顶下标对应的温度，说明当前这一天就是栈顶那一天等到的第一个更暖的日子。\n\n弹出栈顶下标 prevIndex，并设置 answer[prevIndex] = currentIndex - prevIndex。只要当前温度仍然更高，就继续弹栈处理。最后把当前下标入栈。\n\n关键点：栈里放的是下标，不是温度本身，因为结果需要计算间隔天数；栈保持从栈底到栈顶温度递减，尚未找到答案的日期留在栈中。",
  },
  {
    id: "leetcode-problem-94",
    track: "leetcode",
    section: "Tree DFS / BFS",
    title: "94. 二叉树的中序遍历",
    sourceUrl:
      "https://leetcode.cn/problems/binary-tree-inorder-traversal/",
    status: "need_review",
    notes:
      "94. 二叉树的中序遍历（迭代）\n当前节点不为空时，一直向左走，并把沿途节点入栈。没有左节点后，从栈中弹出一个节点并访问它。将当前节点切换为被弹出节点的右子树，然后重复以上过程。",
  },
  {
    id: "leetcode-problem-144",
    track: "leetcode",
    section: "Tree DFS / BFS",
    title: "144. 二叉树的前序遍历",
    sourceUrl:
      "https://leetcode.cn/problems/binary-tree-preorder-traversal/",
    status: "need_review",
  },
  {
    id: "leetcode-problem-102",
    track: "leetcode",
    section: "Tree DFS / BFS",
    title: "102. 二叉树的层序遍历",
    sourceUrl:
      "https://leetcode.cn/problems/binary-tree-level-order-traversal/",
    status: "need_review",
    notes:
      "核心思路：使用队列进行 BFS，并在每一轮开始时记录当前 queue 的长度 levelSize。这个长度就是当前层的节点数量。\n\n一开始 queue 中只有 root，所以 levelSize = 1。处理 root 时先将它出队，再把左右子节点入队。此时 queue 中的节点属于下一层。\n\n每一轮只循环 levelSize 次，确保本轮只处理当前层；循环过程中新增的子节点留到下一轮处理。完成这一轮后，将收集到的节点值作为一层加入结果。\n\n关键点：levelSize 必须在当前层循环开始前固定下来，不能在循环过程中直接使用不断变化的 queue.length。",
  },
  {
    id: "leetcode-problem-977",
    track: "leetcode",
    section: "Two Pointers",
    title: "977. 有序数组的平方",
    sourceUrl:
      "https://leetcode.cn/problems/squares-of-a-sorted-array/",
    status: "need_review",
  },
  {
    id: "leetcode-problem-1",
    track: "leetcode",
    section: "Hash Map / Set",
    title: "1. 两数之和",
    sourceUrl: "https://leetcode.cn/problems/two-sum/",
    status: "need_review",
  },
  {
    id: "leetcode-problem-349",
    track: "leetcode",
    section: "Hash Map / Set",
    title: "349. 两个数组的交集",
    sourceUrl:
      "https://leetcode.cn/problems/intersection-of-two-arrays/",
    status: "need_review",
  },
  {
    id: "leetcode-problem-202",
    track: "leetcode",
    section: "Hash Map / Set",
    title: "202. 快乐数",
    sourceUrl: "https://leetcode.cn/problems/happy-number/",
    status: "need_review",
  },
  {
    id: "leetcode-problem-15",
    track: "leetcode",
    section: "Two Pointers",
    title: "15. 三数之和",
    sourceUrl: "https://leetcode.cn/problems/3sum/",
    status: "need_review",
  },
];

const prepItems = leetcodeProblems.map((item, index) => ({
  ...item,
  sortOrder: index,
}));
let sortOrder = prepItems.length;

for (const [track, sections] of Object.entries(catalog)) {
  for (const [section, titles] of Object.entries(sections)) {
    titles.forEach((title, index) => {
      prepItems.push({
        id: `${track}-${section.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index + 1}`,
        track,
        section,
        title,
        sortOrder: sortOrder++,
      });
    });
  }
}

module.exports = { prepItems };
