# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Canvas 2D 的自研图表库，使用 pnpm workspace monorepo 管理三个包。

## 常用命令

```bash
pnpm dev                    # 启动 playground 开发服务器 (Vite, 端口 5400)
pnpm build                  # 构建 playground (Vite)
pnpm build:rmst-render      # 构建渲染引擎 (unbuild)
pnpm build:rmst-charts      # 构建图表库 (unbuild)
```

## 包结构与职责

### `packages/rmst-render` — Canvas 2D 渲染引擎

独立的底层渲染库。核心概念：

- **形状层级树**：所有形状（`Rect`, `Circle`, `Ellipse`, `Line`, `Path`, `Text`, `Image`, `Polygon`, `Star`, `Trapezoid`, `Group`, `Box`）都继承自 `UiBase` → `AbsEvent`。`Stage` 继承自 `Group`，是树的根节点。
- **渲染流程**：`Stage.render()` 通过 `requestAnimationFrame` 异步调度，最终调用 `drawStage()` 递归遍历形状树，使用 Canvas 2D API 和 Path2D 进行绘制和点击检测。
- **事件系统**：`EventDispatcher` 管理 hover 栈（mouseenter/mouseleave），支持冒泡（仅 click）。`AbsEvent.on(eventType, handler)` 返回取消订阅函数。
- **变换**：每个形状的 `data.mt` 是 `transformation-matrix` 的 `Matrix`，在渲染时通过 `ctx.transform` 应用。
- **动画**：`UiBase.animateCartoon(targetProps, cfg)` 创建 `Animator` 实例，使用 `requestAnimationFrame` 驱动属性插值。

### `packages/rmst-charts` — 图表库

基于 `rmst-render` 构建。核心入口：

- **`ChartRoot`**：主要类，通过 `rmstCharts.init(container)` 创建。内部持有 `Stage` 实例，编排坐标系、序列（series）、图例、提示框、区域缩放等组件。
- **`SeriesManager`**：遍历 `finalSeries`，为每种图表类型（`line`/`bar`/`pie`/`candlestick`）创建对应的 `_Chart` 子类实例，收集渲染元素和图例数据。
- **`_Chart`**：所有图表类型的基类（`LineMain`, `BarMain`, `PieMain`, `CandlestickMain`），提供 `render()` 和 `afterAppendStage()` 钩子。
- **坐标系**：`cartesian2d`（直角坐标系）和 `polar`（极坐标系），分别计算 X/Y 轴刻度、分割线、轴标签。
- **组件**：`Legend`（图例）、`dataZoom`（区域缩放/滚轮缩放）、`AssistLine`（十字辅助线）、`Tooltip`（悬浮提示框）。
- **数据流**：`ChartRoot.setOption(option)` 是主要入口 → 计算 `finalSeries` → `renderCoordinateSystem()` → `renderDataZoom()` → `SeriesManager.render()` → `Legend.render()` → `refreshChart()`（挂载到 Stage）。

### `packages/playground` — 开发调试环境

Vite + React + Tailwind + Ant Design。`vite.config.ts` 通过 alias 直接引用 `rmst-render/src` 和 `rmst-charts/src` 源码，无需构建即可调试。

**白板** (`src/demo/7-whiteboard/`) 是 playground 内最重要的模块，是一个完整的功能性绘图应用。

## 白板架构 (`packages/playground/src/demo/7-whiteboard/`)

基于 `rmst-render` 构建的绘图编辑器。入口：`WhiteboardEditor`（React 组件 `Whiteboard` 通过 `WbEditorContext` 将编辑器实例注入子组件）。

### 层级结构

`WhiteboardEditor.init()` 时创建 6 个 Group 层，按渲染顺序：

| 层 | 名称 | 职责 |
|---|---|---|
| `RulerLayer` | 标尺层 | 从标尺区拖出的红色参考线 (`ruler_root_group`) |
| `GraphLayerWithRulerWrapper` | 含标尺偏移的包装层 | 统一 `rulerSize` 偏移，包裹以下 5 层 |
| `GraphLayer` | 图形层 | 用户绘制的所有图形 (`graph_root_group`) |
| `TempLayer` | 临时层 | 拖拽绘制过程中的预览图形 |
| `HoveredLayer` | hover 层 | 鼠标悬停时的高亮外框 |
| `CtrlBoxLayer` | 控件层 | 选中后的变换控件（平移/缩放/旋转 handle） |
| `RefLineLayer` | 参考线层 | 拖拽吸附时显示的红色对齐线 |

### 坐标系

`CoordSys` 类管理三种坐标系的转换：

- **client**：浏览器视口坐标（`MouseEvent.clientX/Y`）
- **world**：画布内坐标（client 减去容器 offset，受相机平移/缩放影响）
- **scene**：图形层局部坐标（world 减去 `graphLayer.data.mt` 的变换）

核心方法：`client2World()`, `world2Scene()`, `scene2World()`, `client2Scene()`。

### 工具系统

`ToolManager` 是核心控制器，通过策略模式管理当前激活的工具。所有工具实现 `ITool` 接口：

- **绘制工具**（`ToolEnum`）：`Rect`, `Ellipse`, `Rhombus`, `Pencil`, `Image`, `Polygon`, `Star` — 继承自 `ToolDrawByRect` 或自定义实现，绘制完成后自动切回 `Select`
- **操作工具**：`Pan`（空格临时平移，及鼠标中键平移）、`Ruler`（从标尺区域拖出红色参考线）
- **选择工具** `ToolSelect`：根据 hover 的 handle 类型，分发到子策略：
  - `ToolBoxSelection` — 框选
  - `ToolTranslate` — 平移（按 Alt 则复制）
  - `ToolRotate` — 旋转
  - `ToolScale` — 缩放（四个角 + 四条边中点的 handle）
  - `ToolCustomHandle` — 自定义 handle（按图形类型分发 provider）

`toolManager.switchTool(tool)` 切换工具：先调 `onDeActive()` → 实例化新工具类 → `onActive()` → 设置光标。

### 选中与变换

`selectedManager` 管理选中状态，在每个渲染帧重建 ctrlBox：
- `renderSelected()`：在 `CtrlBoxLayer` 上绘制选中外框、旋转 handle（四角）、缩放 handle（四角矩形 + 四条边）、自定义 handle
- `transformRect`：返回被选中图形在 scene 坐标系的包围盒和变换矩阵
- `renderHovered()`：在 `HoveredLayer` 上绘制 hover 高亮外框（通过 `getOutLineShape()` + svgPath matrix 变换）

### 键盘交互

`Keyboard` 类通过 `keydown/keyup` 事件跟踪修饰键状态，emit toggle 事件：
- **Space**：临时切换到平移模式
- **Alt**：选择工具下复制图形
- **Shift**：约束比例/角度
- **Delete**：删除选中图形
- **Escape**：取消选中或切换回选择工具

### 吸附参考线

`RefLine` 计算拖拽时的吸附偏移量：遍历其他图形的边和中点、以及标尺位置，当距离小于 `5/zoom` 时自动吸附，并在 `RefLineLayer` 上绘制红色对齐线和 X 标记。

## 关键约定

- 所有模块使用 ESM（`"type": "module"`）
- TypeScript 配置 `strict: false`
- 常量命名：大驼峰 + 下划线分隔（如 `canvasPaddingTop`, `dataZoomHeight`）
- 形状 ID 通过 `crypto.randomUUID()` 生成
- 根 `tsconfig.base.json` 作为各包的 tsconfig 继承基础
