import { IShape } from 'rmst-render/type'
import { Stage } from '.'

// 1. 此方法的 绘制 层级关系 父子关系
// 2. Circle.draw 递归
export function drawAllShape(stage: Stage) {
  sortByZIndex(stage)

  stage.ctx.clearRect(0, 0, stage.canvasElement.width, stage.canvasElement.height)

  stage.children.forEach(elementItem => {
    elementItem.draw(stage.ctx)
  })
}

export function mountStage(children: IShape[], stage: Stage) {
  children.forEach(item => {
    item.stage = stage

    if (item.children) {
      mountStage(item.children, stage)
    }
  })
}

function sortByZIndex(root) {
  if (root.children) {
    root.children = root.children.toSorted((a, b) => {
      const a_zIndex = a.data.zIndex ?? 0
      const b_zIndex = b.data.zIndex ?? 0

      return a_zIndex - b_zIndex
    })

    for (const item of root.children) {
      sortByZIndex(item)
    }
  }
}
