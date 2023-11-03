import { Circle, Stage } from 'rmst-render'

class PieMain {
  hoverIndex: number

  hoverRadius: number
  outerRadius: number

  constructor(stage: Stage, data, innerRadius, outerRadius, hoverRadius, seriesItem) {
    this.outerRadius = outerRadius
    this.hoverRadius = hoverRadius

    this.fakeArc = new Circle({
      x: stage.center.x,
      y: stage.center.y,
      radius: outerRadius,
      startAngle: 0,
      endAngle: 0,
      bgColor: 'transparent'
    })

    this.pieElements = data.map((item, index) => {
      const arc = new Circle({
        onlyKey: 'main-pie',
        x: stage.center.x,
        y: stage.center.y,
        radius: outerRadius,
        innerRadius: innerRadius ? outerRadius * 0.5 : undefined,
        startAngle: 0,
        endAngle: 0,
        bgColor: item.color,
        animatedProps: { startAngle: item.startAngle, endAngle: item.endAngle }
      })

      arc.onEnter = () => {
        this.select(index)
        stage.setCursor('pointer')

        this.onSelected(index)
      }
      arc.onLeave = () => {
        this.cancelSelect(index)
        stage.setCursor('auto')
      }

      return arc
    })
  }

  pieElements: Circle[]

  fakeArc: Circle

  onSelected = (index: number) => {}

  select(index: number) {
    this.pieElements[index].animateCartoon({ radius: this.hoverRadius, shadowBlur: 20 }, 200)
    // stage.setCursor('pointer')
  }

  cancelSelect(index: number) {
    this.pieElements[index].animateCartoon({ radius: this.outerRadius, shadowBlur: 20 }, 200)
    // stage.setCursor('pointer')
  }
}

export default PieMain
