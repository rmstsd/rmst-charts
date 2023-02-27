import { useEffect } from 'react'

const Line = () => {
  useEffect(() => {
    let curr = performance.now()
    requestAnimationFrame(() => {
      console.log(performance.now() - curr)
    })
  }, [])

  return <div>Line</div>
}

export default Line
