import { Stage, Circle, Group, Rect, Text, Path } from '../rmst-render'
import { calcMain } from './calcMain/calcPie'

const rmstCharts = {
  init: (canvasContainer: HTMLElement) => {
    const stage = new Stage({
      container: canvasContainer
    })

    return {
      setOption: innerOption => {
        const data = calcMain(innerOption.series.data)

        const elements = data.reduce<Path[]>((acc, item, index) => {
          const width = 40
          const height = 20

          const gap = 10
          const x = 10
          const y = 10 + (height + gap) * index

          const rect = new Rect({ x, y, width, height, bgColor: item.color })
          const text = new Text({ x: x + width, y, content: item.label, color: '#333', fontSize: 16 })
          const legend = new Group({ onlyKey: 'legend' })
          legend.append([rect, text])

          const arc = new Circle({
            onlyKey: 'arc',
            x: stage.center.x,
            y: stage.center.y,
            radius: 100,
            startAngle: item.startAngle,
            endAngle: item.endAngle,
            bgColor: item.color
          })

          legend.onEnter = () => {
            arc.animate({ radius: 120 })
            stage.setCursor('pointer')
          }

          legend.onLeave = () => {
            arc.animate({ radius: 100 })
            stage.setCursor('auto')
          }

          arc.onEnter = () => {
            arc.animate({ radius: 120 })
            stage.setCursor('pointer')
          }

          arc.onLeave = () => {
            arc.animate({ radius: 100 })
            stage.setCursor('auto')
          }

          return acc.concat([legend, arc])
        }, [])

        stage.append(elements)

        // ctx.clearRect(0, 0, offsetWidth, offsetHeight)
      }
    }
  }
}

export default rmstCharts
