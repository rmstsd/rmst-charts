import { startDrag } from '@/utils/util'
import { cloneDeep, keyBy } from 'es-toolkit'
import { observer, useLocalObservable } from 'mobx-react-lite'
import { useRef } from 'react'
import { applyToPoint, compose, inverse, Matrix, rotate, scale, skew, toCSS, translate } from 'transformation-matrix'
import { mergeBox } from '../Xg_multi/util'
import { Rect, strategy, TransformOrigin } from './util'
import { rad2deg } from 'rmst-render'

interface Coord {
  x: number
  y: number
}

export default observer(function PureMt() {
  const canvasRef = useRef(null)
  const clientToStageCoord = (p: Coord): Coord => {
    const rect = canvasRef.current.getBoundingClientRect()
    return { x: p.x - rect.left, y: p.y - rect.top }
  }

  const state = useLocalObservable(() => ({
    rects: [
      { id: '1', width: 100, height: 100, mt: translate(100, 100), fill: 'orange', stroke: 'blue' },
      { id: '2', width: 200, height: 140, mt: translate(300, 180), fill: 'pink', stroke: 'blue' }
    ],
    selectedIds: [] as string[],
    box: {
      tl: { x: 0, y: 0 },
      tr: { x: 0, y: 0 },
      br: { x: 0, y: 0 },
      bl: { x: 0, y: 0 },
      rotateCoord: { x: 0, y: 0 }
    },
    testCoord: { x: 0, y: 0 },
    renderer: 'svg' as 'svg' | 'html'
  }))

  const { rects, selectedIds, box } = state

  const selectedRects = selectedIds.map(id => rects.find(item => item.id === id))
  const isHasSelected = selectedRects.length > 0

  const onselect = (item: Rect) => {
    const id = item.id
    if (selectedIds.includes(id)) {
      selectedIds.splice(selectedIds.indexOf(id), 1)
    } else {
      selectedIds.push(id)
    }

    updateBox()
  }

  const updateBox = () => {
    if (selectedIds.length === 0) {
      return
    }
    if (selectedIds.length === 1) {
      const [selId] = selectedIds
      const selRect = rects.find(item => item.id === selId)

      const tl = applyToPoint(selRect.mt, { x: 0, y: 0 })
      const tr = applyToPoint(selRect.mt, { x: selRect.width, y: 0 })
      const br = applyToPoint(selRect.mt, { x: selRect.width, y: selRect.height })
      const bl = applyToPoint(selRect.mt, { x: 0, y: selRect.height })

      const rotateCoord = applyToPoint(selRect.mt, { x: selRect.width / 2, y: -20 })

      state.box = { tl, tr, br, bl, rotateCoord }
      return
    }

    {
      // 选中多个
      const selRects = rects
        .filter(item => selectedIds.includes(item.id))
        .map(item => {
          const tl = applyToPoint(item.mt, { x: 0, y: 0 })
          const tr = applyToPoint(item.mt, { x: item.width, y: 0 })
          const br = applyToPoint(item.mt, { x: item.width, y: item.height })
          const bl = applyToPoint(item.mt, { x: 0, y: item.height })
          return { tl, tr, br, bl }
        })

      const { minX, minY, maxX, maxY } = mergeBox(selRects)

      state.box = {
        tl: { x: minX, y: minY },
        tr: { x: maxX, y: minY },
        br: { x: maxX, y: maxY },
        bl: { x: minX, y: maxY },
        rotateCoord: { x: (minX + maxX) / 2, y: minY - 20 }
      }
    }
  }

  const onTranslatePointerDown = (downEvt: React.PointerEvent) => {
    const downPos = clientToStageCoord({ x: downEvt.clientX, y: downEvt.clientY })
    const downSnap = cloneDeep(keyBy(selectedRects, item => item.id))

    startDrag(downEvt, {
      onDragMove: moveEvt => {
        const movePos = clientToStageCoord({ x: moveEvt.clientX, y: moveEvt.clientY })

        selectedRects.forEach(item => {
          const dSnap = downSnap[item.id]

          const dx = movePos.x - downPos.x
          const dy = movePos.y - downPos.y

          const tmt = translate(dx, dy)

          item.mt = compose(tmt, dSnap.mt)
        })

        updateBox()
      }
    })
  }

  const onRotatePointerDown = (downEvt: React.PointerEvent) => {
    const downPos = clientToStageCoord({ x: downEvt.clientX, y: downEvt.clientY })

    const origin = { x: box.tl.x + (box.br.x - box.tl.x) / 2, y: box.tl.y + (box.br.y - box.tl.y) / 2 }
    const startRad = Math.atan2(downPos.y - origin.y, downPos.x - origin.x)

    const downSnap = cloneDeep(keyBy(selectedRects, item => item.id))

    state.testCoord = origin

    startDrag(downEvt, {
      onDragMove: moveEvt => {
        const movePos = clientToStageCoord({ x: moveEvt.clientX, y: moveEvt.clientY })

        const currRad = Math.atan2(movePos.y - origin.y, movePos.x - origin.x)
        const diffRad = currRad - startRad

        selectedRects.forEach((item, index) => {
          const dSnap = downSnap[item.id]

          item.mt = compose(rotate(diffRad, origin.x, origin.y), dSnap.mt)
        })

        updateBox()
      }
    })
  }

  const onScalePointerDown = (downEvt: React.PointerEvent, origin: TransformOrigin) => {
    const downPos = clientToStageCoord({ x: downEvt.clientX, y: downEvt.clientY })

    const st = strategy[origin]

    const downRect = cloneDeep(
      selectedIds.length === 1
        ? selectedRects[0]
        : { x: 0, y: 0, width: box.br.x - box.tl.x, height: box.br.y - box.tl.y, mt: translate(box.tl.x, box.tl.y) }
    )
    const downLocal = applyToPoint(inverse(downRect.mt), downPos)

    const pureOrigin = st.origin(downRect)
    const oldOrigin = applyToPoint(downRect.mt, pureOrigin)

    const downSnap = cloneDeep(keyBy(selectedRects, item => item.id))

    if (downEvt.ctrlKey) {
      const d_90 = Math.PI / 2

      let startRad = Math.atan2(downLocal.y, downLocal.x - downRect.width)

      startRad = d_90 - startRad

      startDrag(downEvt, {
        onDragMove: moveEvt => {
          const movePos = clientToStageCoord({ x: moveEvt.clientX, y: moveEvt.clientY })
          const moveLocal = applyToPoint(inverse(downRect.mt), movePos)

          let endRad = Math.atan2(moveLocal.y, moveLocal.x - downRect.width)

          endRad = d_90 - endRad

          const diff = endRad - startRad

          selectedRects.forEach(item => {
            const dSnap = downSnap[item.id]
            item.mt = compose(skew(diff, 0), dSnap.mt)
          })

          updateBox()
        }
      })
      return
    }

    startDrag(downEvt, {
      onDragMove: moveEvt => {
        const movePos = clientToStageCoord({ x: moveEvt.clientX, y: moveEvt.clientY })
        const moveLocal = applyToPoint(inverse(downRect.mt), movePos)

        const { dx, dy } = st.getDxDy(moveLocal, downLocal)

        {
          // 单个
          // const scaleMt = scale(1 + dx / downRect.width, 1 + dy / downRect.height)
          // const ansMt = compose(downRect.mt, scaleMt)
          // const newOrigin = applyToPoint(ansMt, pureOrigin)
          // const offset = { x: newOrigin.x - oldOrigin.x, y: newOrigin.y - oldOrigin.y }
          // const fixPosMt = translate(-offset.x, -offset.y)
          // selectedRects[0].mt = compose(ansMt)
          // updateBox()
          // return
        }

        {
          // 单个 和 多个
          const scaleMt = scale(1 + dx / downRect.width, 1 + dy / downRect.height)
          const newMt = compose(downRect.mt, scaleMt)
          const newOrigin = applyToPoint(newMt, pureOrigin)

          const offset = { x: newOrigin.x - oldOrigin.x, y: newOrigin.y - oldOrigin.y }
          const fixPosMt = translate(-offset.x, -offset.y)

          let varMt = compose(newMt, inverse(downRect.mt))
          varMt = compose(fixPosMt, varMt)

          selectedRects.forEach(item => {
            const dSnap = downSnap[item.id]
            item.mt = compose(varMt, dSnap.mt)
          })
        }

        updateBox()
      }
    })
  }

  const ctrlSize = 10

  return (
    <div className="h-full">
      <div className="mb-2 flex gap-2">
        <button onClick={() => (state.selectedIds = [])}>清空选择</button>

        <button
          style={{ borderColor: state.renderer === 'svg' ? 'red' : 'gray' }}
          onClick={() => (state.renderer = 'svg')}
        >
          svg 渲染
        </button>
        <button
          style={{ borderColor: state.renderer === 'html' ? 'red' : 'gray' }}
          onClick={() => (state.renderer = 'html')}
        >
          html 渲染
        </button>
      </div>

      {state.renderer === 'svg' ? (
        <svg width={800} height={600} className="border" onPointerDown={evt => evt.preventDefault()} ref={canvasRef}>
          {rects.map(item => (
            <rect
              key={item.id}
              x={0}
              y={0}
              width={item.width}
              height={item.height}
              transform={toCSS(item.mt)}
              fill={item.fill}
              stroke={item.stroke}
              strokeWidth={2}
              onClick={() => onselect(item)}
            />
          ))}

          {isHasSelected && (
            <g>
              <polygon
                points={`${box.tl.x},${box.tl.y} ${box.tr.x},${box.tr.y} ${box.br.x},${box.br.y} ${box.bl.x},${box.bl.y}`}
                fill="rgba(255,0,0,0.05)"
                stroke="red"
                strokeWidth={2}
                onPointerDown={onTranslatePointerDown}
                className="cursor-move"
              />

              <g className="cursor-grab" onPointerDown={onRotatePointerDown}>
                <circle cx={box.rotateCoord.x} cy={box.rotateCoord.y} r={6} fill="blue" />
                <text x={box.rotateCoord.x} y={box.rotateCoord.y} textAnchor="middle" transform="translate(0, -8)">
                  r
                </text>
              </g>

              <g className="cursor-pointer" onPointerDown={evt => onScalePointerDown(evt, TransformOrigin.BottomRight)}>
                <rect
                  x={box.tl.x}
                  y={box.tl.y}
                  width={ctrlSize}
                  height={ctrlSize}
                  fill="white"
                  stroke="blue"
                  transform={`translate(${-ctrlSize / 2}, ${-ctrlSize / 2})`}
                />
                <text x={box.tl.x} y={box.tl.y} textAnchor="middle" transform="translate(0, -8)">
                  1
                </text>
              </g>
              <g className="cursor-pointer" onPointerDown={evt => onScalePointerDown(evt, TransformOrigin.BottomLeft)}>
                <rect
                  x={box.tr.x}
                  y={box.tr.y}
                  width={ctrlSize}
                  height={ctrlSize}
                  fill="white"
                  stroke="blue"
                  transform={`translate(${-ctrlSize / 2}, ${-ctrlSize / 2})`}
                />
                <text x={box.tr.x} y={box.tr.y} textAnchor="middle" transform="translate(0, -8)">
                  2
                </text>
              </g>
              <g className="cursor-pointer" onPointerDown={evt => onScalePointerDown(evt, TransformOrigin.TopLeft)}>
                <rect
                  x={box.br.x}
                  y={box.br.y}
                  width={ctrlSize}
                  height={ctrlSize}
                  fill="white"
                  stroke="blue"
                  transform={`translate(${-ctrlSize / 2}, ${-ctrlSize / 2})`}
                />
                <text x={box.br.x} y={box.br.y} textAnchor="middle" transform="translate(0, 18)">
                  3
                </text>
              </g>
              <g className="cursor-pointer" onPointerDown={evt => onScalePointerDown(evt, TransformOrigin.TopRight)}>
                <rect
                  x={box.bl.x}
                  y={box.bl.y}
                  width={ctrlSize}
                  height={ctrlSize}
                  fill="white"
                  stroke="blue"
                  transform={`translate(${-ctrlSize / 2}, ${-ctrlSize / 2})`}
                />
                <text x={box.bl.x} y={box.bl.y} textAnchor="middle" transform="translate(0, 18)">
                  4
                </text>
              </g>
            </g>
          )}

          <circle cx={state.testCoord.x} cy={state.testCoord.y} r={4} fill="white" stroke="brown" />
        </svg>
      ) : (
        <div
          className="relative overflow-hidden"
          style={{ width: 800, height: 600, border: '1px solid #ccc' }}
          onPointerDown={evt => evt.preventDefault()}
          ref={canvasRef}
        >
          {rects.map(item => (
            <div
              className="absolute top-0 left-0 origin-top-left"
              key={item.id}
              style={{
                width: item.width,
                height: item.height,
                transform: toCSS(item.mt),
                backgroundColor: item.fill,
                border: `2px solid ${item.stroke}`
              }}
              onClick={() => onselect(item)}
            />
          ))}

          {isHasSelected && (
            <div>
              {selectedIds.length === 1 ? (
                <div
                  className="absolute top-0 left-0 cursor-move origin-top-left"
                  style={{
                    width: selectedRects[0].width,
                    height: selectedRects[0].height,
                    transform: toCSS(selectedRects[0].mt),
                    backgroundColor: 'rgba(255,0,0,0.05)',
                    border: '2px solid red'
                  }}
                  onPointerDown={onTranslatePointerDown}
                ></div>
              ) : (
                <div
                  className="absolute top-0 left-0 cursor-move"
                  style={{
                    transform: `translate(${box.tl.x}px, ${box.tl.y}px) `,
                    width: box.br.x - box.tl.x,
                    height: box.br.y - box.tl.y,
                    backgroundColor: 'rgba(255,0,0,0.05)',
                    border: '2px solid red'
                  }}
                  onPointerDown={onTranslatePointerDown}
                ></div>
              )}

              <div
                className="absolute top-0 left-0 cursor-grab"
                style={{
                  transform: `translate(${box.rotateCoord.x}px, ${box.rotateCoord.y}px) `,
                  width: 8,
                  height: 8,
                  backgroundColor: 'blue'
                }}
                onPointerDown={onRotatePointerDown}
              >
                <div>r</div>
              </div>

              <div
                className="absolute top-0 left-0 cursor-pointer"
                style={{
                  width: ctrlSize,
                  height: ctrlSize,
                  backgroundColor: 'white',
                  border: '1px solid blue',
                  transform: `translate(${box.tl.x}px, ${box.tl.y}px) `
                }}
                onPointerDown={evt => onScalePointerDown(evt, TransformOrigin.BottomRight)}
              >
                <div />
                <div>1</div>
              </div>
              <div
                className="absolute top-0 left-0 cursor-pointer"
                style={{
                  width: ctrlSize,
                  height: ctrlSize,
                  backgroundColor: 'white',
                  border: '1px solid blue',
                  transform: `translate(${box.tr.x}px, ${box.tr.y}px) `
                }}
                onPointerDown={evt => onScalePointerDown(evt, TransformOrigin.BottomLeft)}
              >
                <div>2</div>
              </div>
              <div
                className="absolute top-0 left-0 cursor-pointer"
                style={{
                  width: ctrlSize,
                  height: ctrlSize,
                  backgroundColor: 'white',
                  border: '1px solid blue',
                  transform: `translate(${box.br.x}px, ${box.br.y}px) `
                }}
                onPointerDown={evt => onScalePointerDown(evt, TransformOrigin.TopLeft)}
              >
                <div />
                <div>3</div>
              </div>
              <div
                className="absolute top-0 left-0 cursor-pointer"
                style={{
                  width: ctrlSize,
                  height: ctrlSize,
                  backgroundColor: 'white',
                  border: '1px solid blue',
                  transform: `translate(${box.bl.x}px, ${box.bl.y}px) `
                }}
                onPointerDown={evt => onScalePointerDown(evt, TransformOrigin.TopRight)}
              >
                <div />
                <div>4</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
})
