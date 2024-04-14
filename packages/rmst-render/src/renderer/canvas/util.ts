import { IShape } from '../../type'

export function sortChildren(children: IShape[]) {
  return children.toSorted((a, b) => {
    const a_zIndex = a.data.zIndex
    const b_zIndex = b.data.zIndex

    return a_zIndex - b_zIndex
  })
}
