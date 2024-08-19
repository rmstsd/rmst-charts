import { IShape } from '../type'
import { Stage } from '.'

export function mountStage(children: IShape[], stage: Stage) {
  children.forEach(item => {
    item.stage = stage

    // @ts-ignore
    if (item.children) {
      // @ts-ignore
      mountStage(item.children, stage)
    }
  })
}
