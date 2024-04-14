import { isBoxHidden, isGroup, isStage } from '../utils'
import { IShape } from '../type'
import { isHitShape } from './isHitShape'

export function findHover(ctx: CanvasRenderingContext2D, children: IShape[], x: number, y: number): IShape {
  // return null

  return findHover_v2(ctx, children, x, y)
}

/*
r  a-0  b-0  c-0
r  a-0  b-0  c-1
r  a-0  b-2
r  a-1  b-2
r  a-1  b-3
*/

// console.log(arr.sort((a, b) => a.z - b.z))  // 从小到大排序

// 需要通过 四叉树算法 优化图形的拾取
export function findHover_v2(ctx: CanvasRenderingContext2D, children: IShape[], x: number, y: number) {
  const possible: IShape[] = []

  detectHit(children)

  if (possible.length === 0) {
    return null
  }

  const stack = possible.map(item => {
    const arr: IShape[] = []
    let shape = item
    while (shape && !isStage(shape)) {
      arr.unshift(shape)
      shape = shape.parent as IShape
    }
    return arr
  })

  let ans: IShape = null
  let level_index = 0

  while (!ans) {
    const pps = stack.sort((a, b) => {
      const aItem = a.at(level_index)
      const bItem = b.at(level_index)

      return aItem.data.zIndex - bItem.data.zIndex
    })

    const maxZIndexItem = pps.at(-1)[level_index]

    for (let i = 0; i < pps.length; i++) {
      const item = pps[i][level_index]

      if (maxZIndexItem === item) {
        continue
      } else {
        if (item.data.zIndex <= maxZIndexItem.data.zIndex) {
          pps.splice(i, 1)
          i--
        }
      }
    }

    const tempAns = pps
      .map(item => item[level_index])
      .toSorted((a, b) => a.data.zIndex - b.data.zIndex)
      .at(-1)

    if (possible.includes(tempAns)) {
      ans = tempAns
    } else {
      level_index++
    }
  }

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
        if (isHitShape(ctx, elementItem, x, y)) {
          const isHit = isHitDescendant((elementItem as any).children)

          if (isHit) {
            detectHit(elementItem.children)
          } else {
            possible.push(elementItem)
          }
        }
      } else {
        if (isHitShape(ctx, elementItem, x, y)) {
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

      if (isHitShape(ctx, elementItem, x, y)) {
        return ans
      }

      if (elementItem.children) {
        return isHitDescendant(elementItem.children)
      }
    }

    return false
  }
}

// 废弃
function findHover_v1_legacy(ctx: CanvasRenderingContext2D, children: IShape[], x: number, y: number) {
  const _elements = children.toReversed()

  for (const elementItem of _elements) {
    if (elementItem.data.pointerEvents === 'none') {
      continue
    }

    if (isGroup(elementItem) || isBoxHidden(elementItem)) {
      if (isBoxHidden(elementItem)) {
        if (isHitShape(ctx, elementItem, x, y)) {
          const hovered = findHover(ctx, elementItem.children, x, y)
          if (hovered) {
            return hovered
          }

          return elementItem
        } else {
          continue
        }
      }

      const hovered = findHover(ctx, elementItem.children, x, y)
      if (hovered) {
        return hovered
      }
    } else {
      const isInner = isHitShape(ctx, elementItem, x, y)
      if (isInner) {
        return elementItem
      }
    }
  }

  return null
}

function isPointerEventsNone(elementItem) {
  return elementItem.data.pointerEvents === 'none'
}
