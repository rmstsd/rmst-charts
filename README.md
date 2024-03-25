# rmst-render & rmst-charts

- `rmst-render` 是一个 类似与 `zrender` 的 canvas2d 渲染引擎 (packages/rmst-render)

- `rmst-charts` 是一个 类似与 `echarts` 的 图表库 (packages/rmst-charts)

## 以下是 rmst-render 使用文档

> rmst-charts 撰写中...

---

在线示例：[https://charts.rmst.site/#/rmst-render/overview/index](https://charts.rmst.site/#/rmst-render/overview/index)

# 快速开始

```typescript
import { Stage, Rect, Circle, Line } from 'rmst-render'

const stage = new Stage({
  container: document.querySelector('.container')
})

const rect = new Rect({
  x: 10,
  y: 10,
  width: 80,
  height: 80,
  fillStyle: 'purple',
  cornerRadius: 20,
  cursor: 'pointer',
  draggable: true
})

stage.append(rect)
```

即可渲染一个 圆角矩形

# 舞台参数

```typescript
import { Stage } from 'rmst-render'

const stage = new Stage({
  container: document.querySelector('.container')
})

stage.center // canvas 中心
stage.canvasSize // canvas 尺寸
stage.removeAllElements() // 移除所有元素，重新渲染图形
stage.append() // 添加图形
stage.renderStage() // 渲染所有图形
```

# 图形参数

## 共有参数

```typescript
interface AbstractUiData {
  name?: string
  x?: number // Line 无此参数
  y?: number // Line 无此参数
  shadowColor?: string
  shadowBlur?: number
  shadowOffsetX?: number
  shadowOffsetY?: number
  lineWidth?: number
  opacity?: number // 透明度
  zIndex?: number // 同级顺序

  fillStyle?: CanvasFillStrokeStyles['fillStyle']
  strokeStyle?: CanvasFillStrokeStyles['strokeStyle']

  lineCap?: CanvasLineCap
  lineJoin?: CanvasLineJoin

  draggable?: boolean | 'horizontal' | 'vertical' // 是否可拖拽 | 只水平方向 | 只垂直方向
  cursor?: ICursor // 鼠标 hover 时的光标样式
}
```

## Rect 矩形，圆角矩形

```typescript
interface RectData extends AbstractUiData {
  x: number
  y: number
  width: number
  height: number
  cornerRadius?: number
}
```

## Circle 圆形，扇形，扇环

```typescript
interface CircleData extends AbstractUiData {
  x: number
  y: number

  radius: number
  innerRadius?: number // 扇形, 扇环

  startAngle?: number // 圆弧 角度 60 180 360
  endAngle?: number // 圆弧
  offsetAngle?: number // 默认情况下, 圆弧的起始角度是 0, 但是如果需要从其他角度开始, 可以设置 offsetAngle
}
```

## Line 线段，折线，曲线

```typescript
interface LineData extends AbstractUiData {
  path2D?: Path2D
  points?: number[] // [x1, y1, x2, y2, x3, y3 ...]
  closed?: boolean
  smooth?: boolean
  percent?: number // 0 - 1
}
```

## 组 Group（本身不渲染实际的图形，但事件冒泡可以传播到它）

```typescript
import { Stage, Group, Rect } from 'rmst-render'

const stage = new Stage({
  container: document.querySelector('.container')
})

const group = new Group()

const rect = new Rect({
  x: 10,
  y: 10,
  width: 80,
  height: 80,
  fillStyle: 'purple'
})

group.append(rect)
stage.append(group)
```

## BoxHidden 盒子（渲染实际图形，参数与 Rect 一致）

只会在其内部显示

```javascript
import { Stage, BoxHidden, Rect } from 'rmst-render'

const stage = new Stage({
  container: document.querySelector('.container')
})

const bh = new BoxHidden({
  x: 10,
  y: 10,
  width: 50,
  height: 50
})

const rect = new Rect({
  x: 10,
  y: 10,
  width: 80,
  height: 80,
  fillStyle: 'purple'
})

bh.append(rect)
stage.append(bh)
```

rect 只会在 bh 的内部显示，超出部分会隐藏

## Text 文字

```typescript
interface TextData extends AbstractUiData {
  x: number
  y: number
  content: string
  fontSize?: number
  textAlign?: CanvasTextAlign
}
```

# 更新图形

调用 `attr` 方法 即可更新图形并渲染 UI

```typescript
import { Stage, Rect, Circle, Line } from 'rmst-render'

const stage = new Stage({
  container: document.querySelector('.container')
})
const rect = new Rect({ x: 10, y: 10, width: 80, height: 80, fillStyle: 'purple' })
stage.append(rect)

// 更新
rect.attr({ x: 20 })
// 或者
rect.attr('x', 20)

// 两种方式均有完整的 ts 的类型定义, 比如
// 当如下使用时
rect.attr({ width: '200' })
rect.attr('x', 'aaa')
`vscode` 均会提示: 类型 `string` 的参数不能赋给类型 `number` 的参数
```

# 拖拽

添加  `draggable` 属性即可拖拽

```typescript
import { Stage, Rect, Circle, Line } from 'rmst-render'

const rect = new Rect({
  x: 10,
  y: 10,
  width: 80,
  height: 80,
  fillStyle: 'purple',
  draggable: true
})
```

对于 `Group` 或者 `BoxHidden` 这种有后代的元素，会找到拾取的图形的最近的 设置了 `draggable` 属性的图形作为拖拽目标，如果有后代元素，则后代元素跟着一起动。[在线示例](https://charts.rmst.site/#/rmst-render/drag/group)

# 事件

```typescript
import { Stage, Rect, Circle, Line } from 'rmst-render'

const rect = new Rect({
  x: 10,
  y: 10,
  width: 80,
  height: 80,
  fillStyle: 'purple',
  draggable: true
})

rect_1.on('click', () => {
  console.log('on-click 1')
})

rect_1.onclick = () => {
  console.log('onclick rect_1')
}
```

支持的事件

```typescript
type EventType = 'mouseleave' | 'mouseenter' | 'mousemove' | 'mousedown' | 'mouseup' | 'click'
```

**且支持后代元素的鼠标事件触发, 其行为与 dom 表现一致** [在线示例](https://charts.rmst.site/#/rmst-render/event/nest)

设置了 `draggable: true` 的图形，额外有 `ondragstart` `ondrag` `ondragend` 事件，可用于自定义拖拽范围

其中 `'mouseleave' | 'mouseenter'`事件的触发行为与 dom 表现一致，当两个图形位置相邻或者产生覆盖的时候，会先触发上一个图形的 `'mouseleave'` 再触发下一个图形的 `'mouseenter'` ，且这两次触发在同一轮事件循环内完成。 [在线示例](https://charts.rmst.site/#/rmst-render/event/over)

# 动画

[上千个动画同时执行不掉帧示例](https://charts.rmst.site/#/rmst-render/animate/ani-1000)

执行图形上的 `animateCartoon` 方法执行动画

```typescript
import { Stage, Rect, Circle, Line } from 'rmst-render'

const stage = new Stage({
  container: document.querySelector('.container')
})

const rect = new Rect({
  x: 10,
  y: 10,
  width: 80,
  height: 80,
  fillStyle: 'purple',
  cornerRadius: 20,
  cursor: 'pointer',
  draggable: true
})

stage.append(rect)

setTimeout(() => {
  rect.animateCartoon({ x: 40, width: 200 }, { duration: 3000, easing: 'sinusoidalInOut' })
  rect.animateCartoon({ y: 60, height: 40 }, { duration: 5000, easing: 'cubicInOut' })
}, 1000)
```

如示例所示，可以对同一个图形同时执行多个动画

`animateCartoon` 函数返回 `Promise`，当动画执行完毕后，这个`Promise`变成`fulfilled`状态

可以等上一个动画结束后，再执行下一个动画

```typescript
setTimeout(async () => {
  await rect.animateCartoon({ x: 40, width: 200 }, { duration: 3000, easing: 'sinusoidalInOut' })
  rect.animateCartoon({ y: 60, height: 40 }, { duration: 5000, easing: 'cubicInOut' })
}, 1000)
```
