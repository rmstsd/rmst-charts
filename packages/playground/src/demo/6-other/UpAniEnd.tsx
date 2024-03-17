import { useEffect, useRef, useState } from 'react'
import { AnimatorSingle } from 'rmst-render'
import { Controller } from '@react-spring/web'
import { detectNear } from 'rmst-charts/utils'

const ct = new Controller({
  left: 0,
  onChange(v) {
    // console.log(v.value.left)
    // setDomX(v.value.left)
  }
})

// ct.start({ left: x })

let x = 0

const UpAniEnd = () => {
  console.log('render')

  const ref = useRef<HTMLDivElement>(null)
  function setDomX(x) {
    ref.current.style.setProperty('left', x + 'px')
  }

  let ac = null

  useEffect(() => {
    // setTimeout(() => {
    //   ct.start({ left: 500 })
    // }, 500)

    let ani = new AnimatorSingle(0, 0)
    ani.onUpdate = v => {
      console.log('up 1')
      setDomX(v)
    }

    const setBtn = document.querySelector('.set') as HTMLButtonElement
    setBtn.onclick = () => {
      console.log(11)
      x += 100

      // ani 中断

      ani.setBreak(true)

      ani = new AnimatorSingle(ani.centerValue, x)
      ani.onUpdate = v => {
        setDomX(v)
      }

      ani.setEndValue(x)
    }

    const areaDom = document.querySelector('.area') as HTMLDivElement
    areaDom.onmousemove = evt => {
      const target = evt.target as HTMLDivElement
      const x = evt.clientX - target.getBoundingClientRect().left

      const tt = 200
      const isNeared = detectNear(x / tt, 0.5)

      if (isNeared.isNear) {
        if (ac !== isNeared.nearValue) {
          ac = isNeared.nearValue
          // aniRef.current.setBreak(true)

          const nn = tt * isNeared.nearValue

          ani.setDuration(0.0001)
          ani = new AnimatorSingle(ani.centerValue, nn)
          ani.onUpdate = v => {
            setDomX(v)
          }

          ani.setEndValue(x)
        }
      }
    }
  }, [])

  return (
    <div className="relative">
      <button className="set">set x 100</button>
      {/* <button onClick={() => ani.setEndValue(200)}>set x 200</button> */}
      <hr />

      <div className="border border-gray-500 h-[300px] area"></div>

      <div ref={ref} className="absolute w-[100px] h-[100px] bg-pink-200"></div>

      {/* <div className="uu"></div> */}
    </div>
  )
}

export default UpAniEnd
