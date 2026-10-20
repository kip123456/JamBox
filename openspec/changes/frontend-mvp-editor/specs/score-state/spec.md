## Purpose

提供全局乐谱状态管理和撤销/重做历史，是编辑器、播放器、导出模块共享的单一数据源。

## ADDED Requirements

### Requirement: 乐谱单一数据源
系统 SHALL 使用 Zustand store 作为唯一的乐谱状态源，所有模块从 store 读取乐谱数据。

#### Scenario: 模块间数据一致性
- **WHEN** 编辑模块修改了乐谱中的音符
- **THEN** 播放器和导出模块从 store 中读取到的是同一份更新后的数据

### Requirement: 撤销操作
系统 SHALL 允许用户撤销最近一次编辑操作。

#### Scenario: 按 Ctrl+Z 撤销
- **WHEN** 用户按下 Ctrl+Z 快捷键
- **THEN** 系统恢复到上一步编辑操作之前的状态

### Requirement: 重做操作
系统 SHALL 允许用户重做刚刚撤销的操作。

#### Scenario: 按 Ctrl+Y 重做
- **WHEN** 用户按下 Ctrl+Y 快捷键
- **THEN** 系统恢复被撤销的操作

### Requirement: 历史栈容量限制
系统 SHALL 将撤销历史栈的容量限制在合理范围内，防止内存溢出。

#### Scenario: 历史达到上限时丢弃最旧记录
- **WHEN** 用户累计编辑操作超过 50 步
- **THEN** 新的撤销操作会丢弃最早的历史记录，栈始终保持最多 50 个状态