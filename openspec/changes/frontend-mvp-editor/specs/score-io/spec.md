## Purpose

负责乐谱数据的持久化和导入导出，包括自动保存到浏览器本地存储和导出为 JSON 文件。

## ADDED Requirements

### Requirement: localStorage 自动保存
系统 SHALL 在用户编辑乐谱时自动将乐谱数据保存到浏览器的 localStorage。

#### Scenario: 编辑后自动保存
- **WHEN** 用户进行了任何音符编辑操作后停止操作 500ms
- **THEN** 系统将当前乐谱序列化后存入 localStorage，键名为 "jambox:autosave"

#### Scenario: 页面刷新后恢复
- **WHEN** 用户刷新页面或重新打开编辑器
- **THEN** 系统检查 localStorage 中的自动保存，若存在则加载并恢复上次编辑的乐谱

### Requirement: 导出 JSON 文件
系统 SHALL 允许用户将当前乐谱导出为 JSON 文件并下载到本地。

#### Scenario: 点击导出按钮下载文件
- **WHEN** 用户点击"导出"按钮
- **THEN** 系统生成包含完整乐谱数据的 JSON 文件，触发浏览器下载，文件名默认为 "jambox-score.json"

### Requirement: 导入 JSON 文件
系统 SHALL 允许用户从 JSON 文件导入乐谱数据。

#### Scenario: 选择文件后导入
- **WHEN** 用户选择一个有效的乐谱 JSON 文件
- **THEN** 系统解析该文件并将当前乐谱替换为文件中的内容