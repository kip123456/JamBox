## Context

「合奏盒子」项目当前为完全空白状态，MVP 目标是构建一个纯前端乐谱编辑器。此版本不包含后端、多人协同、AI 智能体等后续功能，但数据结构需要提前设计好以兼容后续扩展。前端代码放在 `frontend/` 目录下，为同级 `backend/` 目录预留位置。

## Goals / Non-Goals

**Goals:**
- 构建一个可运行的钢琴卷帘编辑器 MVP，实现编辑-试听-导出完整链路
- 定义稳定的乐谱数据结构（Score / Track / Note），使用 tick 作为时间单位
- 提供撤销/重做、自动保存、JSON 导入导出等编辑器基础能力
- 为后续智能体读写乐谱预留清晰的数据接口（后续智能体直接操作 Score 对象）

**Non-Goals:**
- 多人协同编辑（Yjs + WebSocket）
- WebRTC 实时音频流
- AI 智能体、LLM 集成、RAG 知识库
- 后端服务器、用户认证、数据库持久化
- MIDI 文件格式（此版本仅支持 JSON，MIDI 导出后续添加）
- 拖拽移动音符、修改音符时长（此版本仅支持点击添加/删除固定时长的音符）
- 多轨同时显示和编辑（此版本单轨，单轨切换通过 Tab 实现）

## Decisions

### 1. 纯前端方案 vs 前后端分离

**选择：纯前端，所有状态在浏览器本地**

理由：MVP 阶段零后端依赖，`npm install && npm run dev` 即可运行，大幅缩短开发周期。localStorage 作为持久化层，JSON 导出/导入作为数据交换手段。后续需要跨设备同步时再加后端。

### 2. 技术栈选择

**选择：Vite + React + TypeScript + Zustand + Tone.js + Canvas**

| 组件 | 选择 | 备选 | 理由 |
|------|------|------|------|
| 构建工具 | Vite | Webpack, CRA | 启动速度极快，配置简洁，是当前 React 项目标配 |
| UI 框架 | React | Vue, Svelte | 用户指定 React + TypeScript |
| 状态管理 | Zustand | Redux Toolkit, Jotai | API 最简洁，内置 devtools，配合 history middleware 可实现撤销/重做 |
| 音频播放 | Tone.js | Web Audio API 原生封装 | Tone.js 封装了合成器、调度器、时间单位转换，省去大量底层工作 |
| 画布渲染 | Canvas | HTML 网格 + DOM | Canvas 适合密集网格绘制和高频重绘（播放时光标移动） |
| 历史管理 | Zustand `undo` middleware | 手动 history stack | Zustand 官方提供 undo middleware，开箱即用，维护成本低 |

### 3. 乐谱数据结构设计

**选择：MIDI-like 数据结构，使用 tick 作为时间单位**

```typescript
interface Score {
  version: string;
  bpm: number;
  timeSignature: [number, number];
  tracks: Track[];
}

interface Track {
  id: string;
  name: string;
  instrument: string;
  color: string;
  notes: Note[];
}

interface Note {
  pitch: number;       // MIDI 音高 60 = C4
  startTick: number;    // 开始位置
  durationTick: number;  // 持续长度
  velocity: number;     // 音量 0-127
}
```

**为什么用 tick 而不是秒？** 编辑时需要网格对齐。每拍 480 tick 是 MIDI 标准：
- 4 分音符 = 480 tick
- 8 分音符 = 240 tick
- 16 分音符 = 120 tick

Tone.js 播放时用 `Tone.Time(tick * (60 / bpm / 480))` 转换为秒。

**版本号字段** `Score.version` 用于后续数据格式升级时做迁移。

### 4. 组件架构

```
frontend/src/
├── main.tsx                    入口
├── App.tsx                     顶层路由和布局
├── store/
│   └── scoreStore.ts           Zustand store + undo middleware
├── types/
│   └── score.ts                Score / Track / Note 类型定义
├── utils/
│   ├── serialization.ts        JSON 序列化/反序列化
│   ├── storage.ts              localStorage 读写 + debounce 自动保存
│   └── tick-converter.ts       tick ↔ 秒 ↔ Tone.js Time 转换
├── components/
│   ├── PianoRoll.tsx           钢琴卷帘 Canvas 组件
│   ├── Toolbar.tsx             顶部工具栏（播放/停止/BPM/导出）
│   ├── TrackSelector.tsx       轨选择 Tab（MVP 单轨，预留扩展）
│   └── StatusBar.tsx           底部状态栏（选中信息、位置）
├── hooks/
│   ├── usePianoRoll.ts         画布事件处理 + 绘制逻辑
│   └── usePlayer.ts            Tone.js 播放控制 hook
└── player/
    └── scorePlayer.ts          将 Score 数据转换为 Tone.js Event 并调度播放
```

**关键边界：**
- `store/scoreStore.ts` 是单一数据源，所有组件通过 `useScoreStore()` 读写状态
- `player/scorePlayer.ts` 是独立层，只负责把 Score 数据喂给 Tone.js，不写回 store
- `components/PianoRoll.tsx` 只处理画布交互，通过 store 的 action 修改数据
- `utils/` 是纯函数，无副作用，方便后续单元测试

### 5. 撤销/重做实现

**选择：Zustand persist + undo middleware**

```typescript
const useScoreStore = create(
  undo(
    persist(
      (set) => ({
        score: emptyScore(),
        selectedNoteId: null,
        // actions: addNote, deleteNote, ...
      }),
      { name: 'jambox:autosave' }
    ),
    {
      limit: 50,
      include: ['score'],
    }
  )
);
```

`include: ['score']` 表示只有 score 字段的变化才进入历史栈，其他 UI 状态（如 selectedNoteId）不触发历史记录。

### 6. 文件组织（为后端预留空间）

```
JamBox/
├── frontend/        ← 此 change 的所有代码
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
├── backend/         ← 后续创建（MVP 阶段不存在）
└── openspec/
```

## Risks / Trade-offs

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Tone.js 学习曲线 | 初期调试音频调度逻辑可能困难 | Tone.js 文档完善，先用最简合成器 (`Tone.Synth`) 验证 |
| Canvas 性能在大量音符时下降 | 滚动/重绘卡顿 | MVP 单轨音符有限，且 Canvas 重绘只在必要时触发（编辑、播放光标移动通过 `requestAnimationFrame` 节流） |
| Zustand undo middleware 在复杂嵌套对象上的历史栈膨胀 | 内存占用高 | `limit: 50` 做硬限制，每次 push 前做深拷贝的代价在 MVP 数据量下可接受 |
| localStorage 存储量限制（通常 5MB） | 大型乐谱可能超出 | MVP 单轨乐谱远不会到这个量级，后续加压缩或后端存储 |
| 数据格式设计不足导致后续智能体难以读写 | 智能体技能需要重新适配 | 当前字段已覆盖 pitch/time/duration/velocity/volume/version 核心需求，够用 |