# old-charts 目录

根目录的 `old-charts` 目录是旧版本的实现，目前处于废弃状态

# packages 目录

新版的 `packages/rmst-charts` 基于 `packages/rmst-render` 进行开发

# src 目录

`src` 目录是网站 demo 示例

## src/demo 目录

1. `src/demo/new-charts` 是新版 `rmst-charts` 的 demo

2. `src/demo/render` 是渲染引擎的 demo

3. `src/demo/zrender` 是用于观察 `zrender` 的 UI 效果, 以及使用方式

4. `src/demo/old-charts` 是旧版实现 处于废弃状态, 将使用新版全部实现

5. `src/demo/other` 是一些杂项例子

> 3,4,5 均为 1,2 服务

# 其他

`vite-plugins` 用于显示最新的构建时间

`z-attempt` 用于尝试 `canvas` 的 `api`, 实现一些小功能, 观察 `echarts` 的 UI 效果等
