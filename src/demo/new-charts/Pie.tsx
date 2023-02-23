// 饼图
import { useEffect } from 'react'

const option = {
  series: {
    type: 'pie' as const,
    data: [
      { value: 1, name: 'pie-1' },
      { value: 2, name: 'pie-2' },
      { value: 3, name: 'pie-3' },
      { value: 4, name: 'pie-4' },
      { value: 5, name: 'pie-5' }
    ]
  }
}
const Pie = () => {
  useEffect(() => {}, [])

  return <div className="canvas-container"></div>
}

export default Pie
