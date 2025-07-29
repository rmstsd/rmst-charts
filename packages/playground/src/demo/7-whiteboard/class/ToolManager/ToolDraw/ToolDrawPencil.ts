import { getBBox, ICoord, Path } from 'rmst-render'
import { getStroke } from 'perfect-freehand'
import { svgPathBbox } from 'svg-path-bbox'
import WhiteboardEditor from '../../../whiteboardEditor'
import { ITool } from './../type'
import { ToolEnum } from './../constant'
import { translate } from 'transformation-matrix'
import svgPath from 'svgpath'
import fitCurve from 'fit-curve'
import { defaultGraphPencilColor } from '@/demo/7-whiteboard/color'

export default class ToolDrawPencil implements ITool {
  constructor(private wbEditor: WhiteboardEditor) {}

  graphShape: Path

  private points: [number, number, number][] = []

  onActive() {
    this.wbEditor.selectManager.clearSelect()

    this.wbEditor.triggerRender()
  }

  onPointerDown(downEvt: PointerEvent) {}

  onDragStart(downEvt: PointerEvent, sceneCoord: ICoord) {
    this.points.push([sceneCoord.x, sceneCoord.y, downEvt.pressure])

    this.graphShape = new Path({})
    this.wbEditor.graphLayer.append(this.graphShape)
  }

  onDragMove(moveEvt: PointerEvent, sceneCoord: ICoord) {
    this.points.push([sceneCoord.x, sceneCoord.y, moveEvt.pressure])

    // const stroke = getStroke(this.points, {
    //   size: 2,
    //   smoothing: 0.5,
    //   thinning: 0,
    //   streamline: 0.5,
    //   easing: t => t,
    //   start: { taper: 0, cap: true },
    //   end: { taper: 0, cap: true }
    // })
    // const pathData = getSvgPathFromStroke(stroke)
    // const bbox = svgPathBbox(pathData)
    // const [x1, y1] = bbox
    // const d = svgPath(pathData).translate(-x1, -y1).toString()

    const tempD = 'M' + this.points.map(item => `${item[0]},${item[1]}`).join(' L')

    this.graphShape.attr({
      name: ToolEnum.label(ToolEnum.Pencil),
      d: tempD,
      strokeStyle: defaultGraphPencilColor,
      lineCap: 'round',
      lineWidth: 3,
      extraData: {
        wbType: ToolEnum.Pencil
      }
    })

    this.wbEditor.triggerRender()
  }

  onDragEnd(upEvt: PointerEvent) {
    let curveD = fitCurveD(this.points)

    const bbox = getBBox(curveD)
    curveD = svgPath(curveD).translate(-bbox.x, -bbox.y).toString()
    this.graphShape.attr({ d: curveD, width: bbox.width, height: bbox.height, mt: translate(bbox.x, bbox.y) })

    this.points = []

    this.wbEditor.triggerRender()
  }

  onDrawAfterEnd() {
    return false
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
