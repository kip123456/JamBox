## Purpose

封装 Tone.js 播放引擎，让用户能够试听、控制正在编辑的乐谱。

## ADDED Requirements

### Requirement: 播放控制
系统 SHALL 提供播放、暂停、停止的播放控制能力。

#### Scenario: 点击播放开始播放
- **WHEN** 用户点击"播放"按钮
- **THEN** 系统从当前光标位置开始播放当前乐谱的所有音轨

#### Scenario: 播放中点击暂停
- **WHEN** 播放进行中用户点击"暂停"按钮
- **THEN** 系统停止播放并保持光标位置

#### Scenario: 点击停止回到开头
- **WHEN** 用户点击"停止"按钮
- **THEN** 系统停止播放并将光标位置重置到乐谱开头

### Requirement: BPM 调节
系统 SHALL 允许用户调节播放速度（BPM）。

#### Scenario: 修改 BPM 值
- **WHEN** 用户修改 BPM 数值
- **THEN** 乐谱存储更新为新值，若正在播放则下次播放时以新速度播放

### Requirement: 播放光标移动
系统 SHALL 在播放过程中显示一个随时间移动的垂直光标线。

#### Scenario: 播放时光标跟随移动
- **WHEN** 乐谱正在播放
- **THEN** 画布上显示一条垂直光标线，随播放进度在时间轴上从左向右移动

### Requirement: 单音试听
系统 SHALL 允许用户点击钢琴卷帘的钢琴键区域试听单个音。

#### Scenario: 点击钢琴键试听
- **WHEN** 用户点击钢琴卷帘左侧的钢琴键
- **THEN** 系统短暂播放对应音高的单音