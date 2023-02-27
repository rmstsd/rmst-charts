import { Stage, Circle, Group, Rect, Text, Path } from '../rmst-render'
import { calcMain } from './calcMain/calcPie'

const rmstCharts = {
  init: (canvasContainer: HTMLElement) => {
    const stage = new Stage({
      container: canvasContainer
    })

    return {
      setOption: innerOption => {
        // ctx.clearRect(0, 0, offsetWidth, offsetHeight)

        const data = calcMain(innerOption.series.data)

        const fakeArc = new Circle({
          x: stage.center.x,
          y: stage.center.y,
          radius: 100,
          startAngle: 0,
          endAngle: 0,
          bgColor: 'transparent'
        })

        const elements = data.reduce<Path[]>((acc, item, index) => {
          const width = 40
          const height = 20

          const gap = 10
          const x = 10
          const y = 10 + (height + gap) * index

          const rect = new Rect({ x, y, width, height, bgColor: item.color })
          const text = new Text({ x: x + width, y, content: item.label, color: item.color, fontSize: 16 })
          const legend = new Group({ onlyKey: 'legend' })
          legend.append([rect, text])

          const arc = new Circle({
            onlyKey: 'main-pie',
            x: stage.center.x,
            y: stage.center.y,
            radius: 100,
            startAngle: 0,
            endAngle: 0,
            bgColor: item.color
          })

          legend.onEnter = () => {
            arc.animate({ radius: 105 })
            stage.setCursor('pointer')
          }

          legend.onLeave = () => {
            arc.animate({ radius: 100 })
            stage.setCursor('auto')
          }

          arc.onEnter = () => {
            arc.animate({ radius: 105 })
            stage.setCursor('pointer')
          }

          arc.onLeave = () => {
            arc.animate({ radius: 100 })
            stage.setCursor('auto')
          }

          return acc.concat([legend, arc])
        }, [])

        elements.push(fakeArc)
        stage.append(elements)

        fakeArc.animate({
          endAngle: 360,
          animateCallback(prop) {
            const data = calcMain(innerOption.series.data, prop.endAngle)

            elements
              .filter(o => o.data.onlyKey === 'main-pie')
              .forEach((element, index) => {
                const curr = data[index]

                element.attr({ startAngle: curr.startAngle, endAngle: curr.endAngle })
              })
          }
        })
      }
    }
  }
}

export default rmstCharts
