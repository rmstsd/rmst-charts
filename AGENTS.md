# Repository Guidelines

## 项目结构与模块组织

本仓库是 pnpm workspace，包统一放在 `packages/*` 下。

- `packages/rmst-render/src`：核心渲染引擎，包含舞台控制器、几何工具、动画工具和公共导出。
- `packages/rmst-charts/src`：图表层抽象与实现，包括柱状图、折线图、饼图、K 线图等。
- `packages/playground/src`：基于 React + Vite 的演示应用，用于本地调试和人工验证。
- `packages/playground/src/assets`：演示应用使用的图片资源。
- `dist` 目录是构建产物，不要手动编辑。

## 构建、测试与开发命令

在仓库根目录使用 pnpm 执行命令。

- `pnpm install`：安装 workspace 依赖。
- `pnpm dev`：启动 Vite playground，并允许局域网访问。
- `pnpm build`：构建 playground。
- `pnpm build:rmst-render`：使用 `unbuild` 构建 `rmst-render`。
- `pnpm build:rmst-charts`：使用 `unbuild` 构建 `rmst-charts`。
- `pnpm run -C packages/playground tsc`：运行 playground 的 TypeScript 检查。

当前没有根级测试脚本。修改行为逻辑后，至少运行相关包的构建命令，并在 playground 中验证受影响场景。

## 编码风格与命名约定

代码使用 TypeScript 和 ES modules。优先沿用现有目录和抽象方式，不要为小改动引入额外架构。公共 API 应通过各包的 `src/index.ts` 导出。文件命名保持描述性，并与邻近文件一致，例如 `ChartRoot.ts`、`SeriesMgr.ts`，控制器类放在 `src/_stage/controller` 下。

编辑时遵循被修改文件的既有格式。变更应聚焦当前任务，避免无关重构，不要直接修改生成的 `dist` 文件。

## 测试指南

目前尚未配置正式测试框架。若后续引入测试，请把测试放在最接近被测逻辑的包内，并使用清晰的用例名称描述行为。现阶段应通过 TypeScript 检查、相关构建命令，以及 `packages/playground/src/main-router` 中对应路由的人工验证来确认改动。

## 提交与 Pull Request 规范

近期提交信息较短且直接，包含中文或英文主题，例如 `椭圆重构`、`fix`、`rect custom handle bug`。提交标题应聚焦单一行为变化，避免混入无关修改。

PR 应包含清晰摘要、影响的包、已运行的验证命令。涉及 UI 或 playground 可见变化时，附截图或录屏。若存在关联 issue，请在 PR 中链接；若有破坏性 API 变化，需要明确说明。

## 安全与配置提示

不要提交本地密钥、机器相关配置或生成的依赖目录。依赖版本变化时，应同步提交 `pnpm-lock.yaml`，并确保变更是有意引入的。
