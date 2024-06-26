import { isBoxHidden, isGroup } from '../utils'
import { IShape } from '../type'
import { isHitShape } from './isHitShape'
import { Stage } from '..'
import { compareZLevel, isPointerEventsNone } from './utils'

/*
r  a-0  b-0  c-0
r  a-0  b-0  c-1
r  a-0  b-2
r  a-1  b-2
r  a-1  b-3
*/

// console.log(arr.sort((a, b) => a.z - b.z))  // 从小到大排序

// 需要通过 四叉树算法 优化图形的拾取
export function findHover_v2(stage: Stage, x, y) {
  const possible: IShape[] = []

  const { ctx } = stage

  ctx.save()

  ctx.translate(stage.translateX, stage.translateY)
  ctx.scale(stage.scale, stage.scale)

  detectHit(stage.children)
  ctx.restore()

  if (possible.length === 0) {
    return null
  }

  const ans = compareZLevel(possible)

  // console.log('data.name ->: ', ans.data.name)

  return ans

  function detectHit(_children: any[]) {
    _children.forEach(elementItem => {
      if (isPointerEventsNone(elementItem)) {
        return
      }

      if (isGroup(elementItem)) {
        detectHit(elementItem.children)
      } else if (isBoxHidden(elementItem)) {
        if (isHitShape(stage, elementItem, x, y)) {
          const isHit = isHitDescendant((elementItem as any).children)

          if (isHit) {
            detectHit(elementItem.children)
          } else {
            possible.push(elementItem)
          }
        }
      } else {
        if (isHitShape(stage, elementItem, x, y)) {
          possible.push(elementItem)
        }
      }
    })
  }

  function isHitDescendant(children: any[]) {
    let ans = true
    for (const elementItem of children) {
      if (isPointerEventsNone(elementItem)) {
        continue
      }

      if (isHitShape(stage, elementItem, x, y)) {
        return ans
      }

      if (elementItem.children) {
        return isHitDescendant(elementItem.children)
      }
    }

    return false
  }
}
