import { isBox, isGroup } from '../utils'
import { IShape } from '../type'
import { isHitShape } from './isHitShape'
import { Group, Stage } from '..'
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
  x = x * stage.dpr
  y = y * stage.dpr

  const possible: IShape[] = []

  const { ctx, camera } = stage

  ctx.save()

  ctx.translate(camera.tx, camera.ty)
  ctx.scale(camera.zoom, camera.zoom)

  detectHit(stage.data.children)
  ctx.restore()

  if (possible.length === 0) {
    return null
  }

  const ans = compareZLevel(possible)

  // console.log('data.name ->: ', ans.data.name)

  return ans

  function detectHit(_children: IShape[]) {
    _children.forEach(elementItem => {
      if (isPointerEventsNone(elementItem)) {
        return
      }
      if (!elementItem.data.visible) {
        return
      }

      if (isGroup(elementItem)) {
        ctx.save()

        const mt = elementItem.data.mt
        ctx.transform(mt.a, mt.b, mt.c, mt.d, mt.e, mt.f)
        detectHit(elementItem.data.children)

        ctx.restore()
      } else if (isBox(elementItem)) {
        if (isHitShape(stage, elementItem, x, y)) {
          ctx.save()
          const mt = elementItem.data.mt
          ctx.transform(mt.a, mt.b, mt.c, mt.d, mt.e, mt.f)
          const isHit = isHitDescendant((elementItem as Group).data.children)

          if (isHit) {
            detectHit(elementItem.data.children)
          } else {
            possible.push(elementItem)
          }
          ctx.restore()
        }
      } else {
        if (isHitShape(stage, elementItem, x, y)) {
          possible.push(elementItem)
        }
      }
    })
  }

  function isHitDescendant(children: IShape[]) {
    let ans = true

    for (const elementItem of children) {
      if (isPointerEventsNone(elementItem)) {
        continue
      }

      if (isHitShape(stage, elementItem, x, y)) {
        return ans
      }

      if (Array.isArray(elementItem.data.children)) {
        return isHitDescendant(elementItem.data.children)
      }
    }

    return false
  }
}
