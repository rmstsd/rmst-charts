import { getRectByTwoPoint } from 'rmst-render'

//  alt shift space
export const ass = (
  downPos,
  movePos,
  { isSpaceKeyPressing, isAltKeyPressing, isShiftKeyPressing, spacePrevPos, spaceDownPos }
) => {
  if (isSpaceKeyPressing) {
    const dx = movePos.x - spacePrevPos.x
    const dy = movePos.y - spacePrevPos.y

    downPos.x = spaceDownPos.x + dx
    downPos.y = spaceDownPos.y + dy
  }

  const rect = { x: downPos.x, y: downPos.y, width: movePos.x - downPos.x, height: movePos.y - downPos.y }

  let cx = 0
  let cy = 0
  if (isAltKeyPressing) {
    rect.width = rect.width * 2
    rect.height = rect.height * 2
    rect.x = rect.x - rect.width / 2
    rect.y = rect.y - rect.height / 2

    cx = rect.x + rect.width / 2
    cy = rect.y + rect.height / 2
  }

  if (isShiftKeyPressing) {
    const maxSize = Math.max(Math.abs(rect.width), Math.abs(rect.height))
    rect.width = (Math.sign(rect.width) || 1) * maxSize
    rect.height = (Math.sign(rect.height) || 1) * maxSize
  }

  if (isAltKeyPressing) {
    rect.x = cx - rect.width / 2
    rect.y = cy - rect.height / 2
  }

  const rectAns = getRectByTwoPoint({ x: rect.x, y: rect.y }, { x: rect.x + rect.width, y: rect.y + rect.height })

  return rectAns
}
