## Why

「合奏盒子」需要一个能手动编辑乐谱的前端基础，作为后续多人协同和 AI 智能体的载体。当前项目完全空白，需要先构建一个可运行的 MVP 编辑器，让用户能够在钢琴卷帘上手动编写音符、试听效果、导出作品。这个版本不包含多人协同和 AI 功能，但数据结构必须提前设计好，为后续智能体的读写预留统一接口。

## What Changes

- 初始化前端工程：Vite + React + TypeScript + Zustand
- 实现钢琴卷帘（Canvas）可视化编辑器，支持点击添加/删除音符
- 集成 Tone.js 播放引擎，支持播放/暂停/停止、BPM 调节
- 定义统一的乐谱数据结构（Score / Track / Note），使用 tick 时间单位
- 支持单轨编辑，预留多轨扩展接口
- 支持 localStorage 自动保存和 JSON 文件导出
- 提供撤销/重做能力
- 前端代码放在 `frontend/` 目录下，为后续后端预留空间

## Capabilities

### New Capabilities

- `score-editor`: 钢琴卷帘画布渲染和音符手动编辑交互（添加、删除、选中）
- `score-player`: Tone.js 播放引擎封装，支持播放控制、速度调节
- `score-io`: 乐谱数据的序列化、反序列化、localStorage 自动保存、JSON 导出
- `score-state`: 全局状态管理（Zustand store），包含撤销/重做 history

### Modified Capabilities

（无现有 specs，此版本全部为新建）

## Impact

- 新增依赖：`tone`、`zustand`、`vite`、`react`、`typescript`、`@types/react`
- 前端代码位于 `frontend/`，后续后端将位于同级 `backend/`
- 乐谱数据结构（Score / Track / Note）是后续智能体、协同编辑的核心契约，必须保持向后兼容