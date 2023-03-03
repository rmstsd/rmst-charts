import { Stage, Circle, Group, Rect, Text, Path } from '../../rmst-render'
import { pieColors } from '../constant'

function calcMain(dataSource: { value: number; name: string }[], end_angle = 360) {
  const sum = dataSource.reduce((acc, item) => acc + item.value, 0)
  const radianArray = dataSource.map(item => (item.value / sum) * end_angle)

  const finalRadianArray: { startAngle: number; endAngle: number; color: string; label: string }[] = []
  radianArray.forEach((item, index) => {
    const lastItem = finalRadianArray[finalRadianArray.length - 1]

    const startAngle = index === 0 ? 0 : lastItem.endAngle
    const endAngle = index === 0 ? item : lastItem.endAngle + item
    const nvItem = { startAngle, endAngle, color: pieColors[index], label: dataSource[index].name }

    finalRadianArray.push(nvItem)
  })

  return finalRadianArray
}

export function createRenderElements(stage, innerOption) {
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
    const text = new Text({ x: x + width + 5, y, content: item.label, color: item.color, fontSize: 16 })
    const legendGroup = new Group({ onlyKey: 'legend' })
    legendGroup.append([rect, text])

    const arc = new Circle({
      onlyKey: 'main-pie',
      x: stage.center.x,
      y: stage.center.y,
      radius: 100,
      startAngle: 0,
      endAngle: 0,
      bgColor: item.color
    })

    legendGroup.onEnter = () => {
      arc.animate({ radius: 105, shadowBlur: 20 }, 200)
      stage.setCursor('pointer')
    }

    legendGroup.onLeave = () => {
      arc.animate({ radius: 100, shadowBlur: 0 }, 200)
      stage.setCursor('auto')

      console.log('legend.onLeave', index)
    }

    arc.onEnter = () => {
      arc.animate({ radius: 105, shadowBlur: 20 }, 200)
      stage.setCursor('pointer')
    }

    arc.onLeave = () => {
      arc.animate({ radius: 100, shadowBlur: 0 }, 200)
      stage.setCursor('auto')
    }

    return acc.concat([legendGroup, arc])
  }, [])

  elements.push(fakeArc)

  function afterAppendStage() {
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

  return { elements, afterAppendStage }
}
