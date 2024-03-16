import { useEffect, useRef, useState } from 'react'
import { AnimatorSingle } from 'rmst-render'
import { throttle } from 'throttle-debounce'

const UpAniEnd = () => {
  const ref = useRef<HTMLDivElement>(null)
  function setDomX(x) {
    ref.current.style.setProperty('left', x + 'px')
  }

  const [ani] = useState(() => new AnimatorSingle(0, 0))

  useEffect(() => {
    ani.onUpdate = v => {
      console.log(v)
      setDomX(v)
    }
  }, [])

  const setX = () => {
    // ani.setStartValue(0)
    ani.setEndValue(100)
  }

  const onMouseMove = (evt: React.MouseEvent) => {
    const target = evt.target as HTMLDivElement
    const x = evt.clientX - target.getBoundingClientRect().left

    ani.setEndValue(x)
  }

  return (
    <div className="relative">
      <button onClick={setX}>set x 100</button>
      <button
        onClick={() => {
          ani.setEndValue(200)
        }}
      >
        set x 200
      </button>
      <hr />

      <div className=" border border-gray-500 h-[300px]" onMouseMove={onMouseMove}></div>

      <div ref={ref} className="absolute w-[100px] h-[100px] bg-pink-100"></div>
    </div>
  )
}

export default UpAniEnd
