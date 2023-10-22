import { Circle, Stage } from 'rmst-render'

class PieMain {
  constructor(stage: Stage, data, innerRadius, outerRadius, hoverRadius, seriesItem) {
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

      function onPieActiveEnter() {
        arc.animateCartoon({ radius: hoverRadius, shadowBlur: 20 }, 200)
        stage.setCursor('pointer')
      }
      function onPieActiveLeave() {
        arc.animateCartoon({ radius: outerRadius, shadowBlur: 0 }, 200)
        stage.setCursor('auto')
      }

      arc.onEnter = () => {
        onPieActiveEnter()
        this.onSelected(index)
      }
      arc.onLeave = onPieActiveLeave

      return arc
    })
  }

  pieElements: Circle[]

  fakeArc: Circle

  onSelected = (index: number) => {}
}

export default PieMain
