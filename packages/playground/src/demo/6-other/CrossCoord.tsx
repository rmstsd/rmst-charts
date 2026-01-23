import { startDrag } from '@/utils/util'
import { cloneDeep } from 'es-toolkit'
import { useRef, useState } from 'react'
import { applyToPoint, compose, inverse, Matrix, rotateDEG, scale, skew, toCSS, translate } from 'transformation-matrix'

export default function CrossCoord() {
  const [childMt, setChildMt] = useState<Matrix>(translate(33, 33))
  const childMtRef = useRef(childMt)
  childMtRef.current = childMt

  const pMt = compose(rotateDEG(30, 50, 50), scale(1.5, 1.1), skew(0.1, 0.2), translate(50, 10))
  const mtCss = toCSS(pMt)

  const parentRef = useRef()

  const childMtCss = toCSS(childMt)

  const [isIn, setIsIn] = useState(true)

  let childElement = (
    <div
      data-child
      className="child-el w-[40px] h-[40px] bg-green-300 absolute left-0 top-0"
      style={{ transformOrigin: '0 0', transform: childMtCss }}
    ></div>
  )

  const onPointerDown = downEvt => {
    if (!downEvt.target.classList.contains('child-el')) {
      return
    }

    const canvasDD = document.querySelector('.canvas-dd')
    const canvasDDRect = canvasDD?.getBoundingClientRect()

    let _isIn = isIn

    let domMt = cloneDeep(childMt)

    let downClient = {
      x: downEvt.clientX - canvasDDRect?.left,
      y: downEvt.clientY - canvasDDRect?.top
    }

    function getLocalDown() {
      if (_isIn) {
        return applyToPoint(inverse(pMt), downClient)
      } else {
        return downClient
      }
    }

    startDrag(downEvt, {
      isDocumentMove: true,
      onDragMove(moveEvt) {
        const { clientX, clientY } = moveEvt
        const elements = document.elementsFromPoint(clientX, clientY)

        function getLocalMove() {
          if (_isIn) {
            return applyToPoint(inverse(pMt), { x: clientX - canvasDDRect?.left, y: clientY - canvasDDRect?.top })
          } else {
            return { x: clientX - canvasDDRect?.left, y: clientY - canvasDDRect?.top }
          }
        }

        if (elements.includes(parentRef.current)) {
          if (!_isIn) {
            _isIn = true

            domMt = compose(inverse(pMt), childMtRef.current)

            downClient = {
              x: clientX - canvasDDRect?.left,
              y: clientY - canvasDDRect?.top
            }

            console.log('移入')
          }
        } else {
          if (_isIn) {
            _isIn = false
            console.log('移出')

            domMt = compose(pMt, childMtRef.current)

            downClient = {
              x: clientX - canvasDDRect?.left,
              y: clientY - canvasDDRect?.top
            }
          }
        }

        const localMove = getLocalMove()
        const localDown = getLocalDown()

        const dx = localMove.x - localDown.x
        const dy = localMove.y - localDown.y

        const tmt = translate(dx, dy)
        const newMt = compose(tmt, domMt)
        setChildMt(newMt)

        setIsIn(_isIn)
      }
    })
  }

  return (
    <div className="canvas-dd relative w-[100px] h-[100px] left-[200px] top-[200px] select-none" onPointerDown={onPointerDown}>
      <button
        onClick={() => {
          setIsIn(false)
          setChildMt(compose(pMt, childMt))
        }}
      >
        移出
      </button>
      <div
        ref={parentRef}
        data-parent
        className="bg-red-300 w-[100px] h-[100px] absolute left-0 top-0 overflow-clip"
        style={{
          transformOrigin: '0 0',
          // transform: 'translate(-50px, 50px) rotate(45deg) translate(50px, -50px)'
          transform: mtCss
        }}
      >
        {isIn && childElement}
      </div>

      {!isIn && childElement}

      <div className="absolute inset-0 border border-black pointer-events-none"></div>
    </div>
  )
}
