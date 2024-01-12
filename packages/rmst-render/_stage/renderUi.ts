import { IShape } from 'rmst-render/type'
import { Stage } from '.'

export function mountStage(children: IShape[], stage: Stage) {
  children.forEach(item => {
    item.stage = stage

    if (item.children) {
      mountStage(item.children, stage)
    }
  })
}
