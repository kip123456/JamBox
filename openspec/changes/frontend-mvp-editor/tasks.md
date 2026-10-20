## 1. 工程初始化

- [ ] 1.1 用 `npm create vite@latest frontend -- --template react-ts` 创建 React + TS 项目，验证 `cd frontend && npm run dev` 能启动开发服务器
- [ ] 1.2 安装依赖：`tone`、`zustand`，验证 `npm run build` 成功无报错
- [ ] 1.3 清理 Vite 默认模板文件（App.css, index.css 等），建立 `src/store/`、`src/types/`、`src/utils/`、`src/components/`、`src/hooks/`、`src/player/` 目录结构，验证所有目录存在

## 2. 类型定义与工具函数

- [ ] 2.1 在 `src/types/score.ts` 中定义 Score / Track / Note 接口（含 version、bpm、timeSignature、tick 单位等字段），以及 `emptyScore()` 工厂函数返回默认空乐谱
- [ ] 2.2 在 `src/utils/tick-converter.ts` 中实现 tick ↔ 秒 ↔ Tone.js Time 的转换函数（每拍 480 tick 标准），验证 `tickToSeconds(480, 120)` 在 BPM=120 时返回 0.5
- [ ] 2.3 在 `src/utils/serialization.ts` 中实现 `serializeScore` / `deserializeScore` 函数，验证序列化后再反序列化能还原相同对象（深比较通过）
- [ ] 2.4 在 `src/utils/storage.ts` 中实现 localStorage 读写函数和 debounce 自动保存装饰器，验证保存后刷新页面能读到相同数据

## 3. 状态管理

- [ ] 3.1 在 `src/store/scoreStore.ts` 中创建 Zustand store，包含 score、selectedNoteId、isPlaying、bpm 等状态字段，以及 addNote、deleteNote、selectNote、setBpm 等 action
- [ ] 3.2 为 store 添加 zustand undo middleware（`undo(...)` 包裹），配置 `limit: 50`、`include: ['score']`，验证 Ctrl+Z 能撤销最后一次编辑、Ctrl+Y 能重做
- [ ] 3.3 为 store 添加 zustand persist middleware，验证页面刷新后 score 状态从 localStorage 自动恢复

## 4. 钢琴卷帘画布

- [ ] 4.1 在 `src/components/PianoRoll.tsx` 中实现 Canvas 组件，能渲染钢琴键位标签 + 时间网格 + 空白画布，验证初始加载显示 2 个八度 + 4 小节网格
- [ ] 4.2 实现绘制已有音符方块到画布的逻辑，验证 store 中有音符时画布正确渲染彩色方块
- [ ] 4.3 实现鼠标事件：左键点空白格子添加音符（调用 store.addNote）、右键点已有音符删除、左键点已有音符选中高亮，验证三种交互都能正确更新 store 并重绘画布
- [ ] 4.4 在画布上绘制垂直光标线，暴露 `cursorTick` prop，验证外部传入 tick 值时光标正确定位

## 5. 播放引擎

- [ ] 5.1 在 `src/player/scorePlayer.ts` 中实现 `class ScorePlayer`：将 Score.tracks[].notes[] 转换为 Tone.Part 事件数组，用 Tone.Synth 作为合成器，实现 play() / pause() / stop() / setBpm() 方法，验证调用 play() 后能听到单轨旋律
- [ ] 5.2 在 `src/hooks/usePlayer.ts` 中封装 ScorePlayer 为 React hook，返回 { isPlaying, cursorTick, play, pause, stop, setBpm }，验证组件能拿到实时播放的 cursorTick
- [ ] 5.3 在 `src/components/Toolbar.tsx` 中实现顶部工具栏（播放/暂停/停止按钮 + BPM 输入框 + 导出按钮），点击按钮能触发 player 对应方法，BPM 输入框修改能更新 store.bpm

## 6. 钢琴键试听

- [ ] 6.1 在 PianoRoll 组件左侧渲染可点击的钢琴键区域（区分黑键白键），点击时触发短音播放，验证点击 C4 键能听到 C4 的单音

## 7. 导入导出

- [ ] 7.1 在 Toolbar 中实现"导出"按钮：点击后生成 JSON 文件并触发浏览器下载（默认文件名 jambox-score.json），验证下载文件包含完整 score 数据
- [ ] 7.2 在 Toolbar 中实现"导入"按钮：通过文件选择器读取 JSON 文件并反序列化后写入 store，验证导入后画布正确显示导入的音符

## 8. 集成与打磨

- [ ] 8.1 在 `src/App.tsx` 中组装所有组件：Toolbar + PianoRoll + TrackSelector（单轨占位）+ StatusBar，构建完整编辑器页面，验证整个界面流畅可用
- [ ] 8.2 在 TrackSelector 组件中实现单轨 Tab 切换（从 store.score.tracks 渲染），验证多轨存在时能切换显示当前编辑的轨
- [ ] 8.3 全局键盘快捷键：Ctrl+Z 撤销、Ctrl+Y 重做、空格键播放/暂停，验证在画布聚焦时快捷键生效
- [ ] 8.4 清理和最终验证：`npm run build` 无错误、所有功能链路（添加→播放→导出→导入→还原）完整跑通