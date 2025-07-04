import { getBBox, ICoord, Path } from 'rmst-render'
import { getStroke } from 'perfect-freehand'
import WhiteboardEditor from '../../../whiteboardEditor'
import { ITool } from './../type'
import { ToolEnum } from './../constant'
import { applyToPoint, compose, inverse, translate } from 'transformation-matrix'
import { IGraph } from '../../../type'
import { uuid } from '@/utils'
import { svgPathBbox } from 'svg-path-bbox'
import svgPath from 'svgpath'
import fitCurve from 'fit-curve'
import { defaultGraphPencilColor } from '@/demo/7-whiteboard/color'

export default class ToolDrawPencil implements ITool {
  constructor(private wbEditor: WhiteboardEditor) {}

  downPos: ICoord
  graphItem = {} as IGraph

  private points: [number, number, number][] = []

  onActive() {
    this.wbEditor.selectManager.clearSelect()

    this.wbEditor.triggerRender()
  }

  onPointerDown(downEvt: PointerEvent) {}

  onDragStart(downEvt: PointerEvent) {
    this.downPos = this.wbEditor.client2World(downEvt)

    const mt = compose(inverse(this.wbEditor.graphLayer.data.mt))
    this.downPos = applyToPoint(mt, this.downPos)

    this.points.push([this.downPos.x, this.downPos.y, downEvt.pressure])

    this.graphItem.id = uuid()
    this.graphItem.graphShape = new Path({})
    this.wbEditor.graphs.push(this.graphItem)

    this.wbEditor.graphLayer.append(this.graphItem.graphShape)
  }

  onDragMove(moveEvt: PointerEvent) {
    let movePos = this.wbEditor.client2World(moveEvt)

    const mt = compose(inverse(this.wbEditor.graphLayer.data.mt))
    movePos = applyToPoint(mt, movePos)

    this.points.push([movePos.x, movePos.y, moveEvt.pressure])

    const stroke = getStroke(this.points, {
      size: 2,
      smoothing: 0.5,
      thinning: 0,
      streamline: 0.5,
      easing: t => t,
      start: { taper: 0, cap: true },
      end: { taper: 0, cap: true }
    })
    const pathData = getSvgPathFromStroke(stroke)

    const bbox = svgPathBbox(pathData)
    const [x1, y1] = bbox
    const d = svgPath(pathData).translate(-x1, -y1).toString()

    const tempD = 'M' + this.points.map(item => `${item[0]},${item[1]}`).join(' L')

    this.graphItem.graphShape.attr({
      id: this.graphItem.id,
      name: ToolEnum.label(ToolEnum.Pencil),
      d: tempD,
      // mt: translate(x1, y1),
      strokeStyle: defaultGraphPencilColor,
      lineWidth: 3,
      extraData: {
        wbType: ToolEnum.Pencil
      }
    })
  }

  onDragEnd(upEvt: PointerEvent) {
    let curveD = fitCurveD(this.points)

    const bbox = getBBox(curveD)
    curveD = svgPath(curveD).translate(-bbox.x, -bbox.y).toString()
    this.graphItem.graphShape.attr({ d: curveD, width: bbox.width, height: bbox.height, mt: translate(bbox.x, bbox.y) })
  }
}

export function getSvgPathFromStroke(stroke) {
  if (!stroke.length) return ''

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length]
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2)
      return acc
    },
    ['M', ...stroke[0], 'Q']
  )

  d.push('Z')
  return d.join(' ')
}

function fitCurveD(points) {
  var error = 50 // The smaller the number - the much closer spline should be
  var bezierCurves = fitCurve(points, error)

  let dd = ''
  bezierCurves.forEach(item => {
    const [f1, c1, c2, s2] = item

    dd += `M ${f1[0]},${f1[1]} C ${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${s2[0]},${s2[1]}`
  })

  return dd
}
