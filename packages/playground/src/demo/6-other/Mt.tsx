import { useEffect } from 'react'
import { Vector2 } from './core/Vector2'
import { Matrix3 } from './core/Matrix3'
import { Camera } from './core/Camera'

const Mt = () => {
  useEffect(() => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement
    const ctx = canvas.getContext('2d')

    // ctx.save()
    // ctx.translate(200, 100)
    // ctx.rotate(Math.PI / 6)
    // ctx.scale(1, 2)
    // ctx.fillRect(0, 0, 200, 100)
    // ctx.restore()

    // ctx.translate(200, 100)
    // ctx.scale(1, 2)
    // ctx.rotate(Math.PI / 6)
    // ctx.fillStyle = 'pink'
    // ctx.fillRect(0, 0, 200, 100)
    // ctx.restore()

    /*
      a (m11) 水平缩放 ; c (m21) 水平倾斜 ; e (dx) 水平移动
      b (m12) 垂直倾斜 ; d (m22) 垂直缩放 ; f (dy) 垂直移动。
      [  
        a	c	e
        b	d	f
        0	0	1
      ]

      旋转角度为 30度
      s = sin30
      c = cos30
      旋转矩阵 mr = [
        c -s 0
        s c 0
        0 0 1
      ]
      // -- 
      x, y缩放量 (1, 2)
      缩放矩阵 ms = [
        1	0	0
        0	2	0
        0	0	1
      ]
      矩阵乘法不符合乘法交换律规则, 矩阵a * 矩阵b 和 矩阵b * 矩阵a 的结果不一样
    */

    // scale 非等比缩放时, 先 scale 再 rotate 会发生倾斜

    const vertices = [0, 0, 100, 0, 100, 50, 0, 50]
    const position = new Vector2(300, 200)
    const rotate = 0.4
    const scale = new Vector2(1, 2)

    // matrixTest(ctx)

    function matrixTest(ctx: CanvasRenderingContext2D) {
      /* translate(),rotate(),scale()测试 */
      ctx.save()
      ctx.translate(position.x, position.y)
      ctx.rotate(rotate)
      ctx.scale(scale.x, scale.y)
      drawRect(ctx, vertices, 'black', 40)
      ctx.restore()

      const [pm, rm, sm] = [
        new Matrix3().makeTranslation(position.x, position.y),
        new Matrix3().makeRotation(rotate),
        new Matrix3().scale(scale.x, scale.y)
      ]
      const mt = pm.multiply(rm).multiply(sm)
      // const mt = new Matrix3().scale(scale.x, scale.y).rotate(rotate).translate(position.x, position.y)

      const { elements: e } = mt

      ctx.save()
      ctx.transform(e[0], e[1], e[3], e[4], e[6], e[7])
      drawRect(ctx, vertices, 'red', 20, 'blue')
      ctx.restore()

      // 顶点变换时,xy 缩放不一致的时, 描边不会缩放, 描边宽度是一致的
      ctx.save()
      drawRect(ctx, tranformVertices(vertices, mt), '#acec00', 20, 'orange')
      ctx.restore()
    }

    function tranformVertices(vertices: number[], matrix: Matrix3) {
      const worldVertives: number[] = []
      for (let i = 0, len = vertices.length; i < len; i += 2) {
        const { x, y } = new Vector2(vertices[i], vertices[i + 1]).applyMatrix3(matrix)
        worldVertives.push(x, y)
      }
      return worldVertives
    }

    const camera = new Camera(-200, -200, 2)

    cameraTest()
    function cameraTest() {
      ctx.save()

      camera.transformInvert(ctx)

      ctx.fillRect(0, 0, 200, 100)

      ctx.restore()
    }

    //
  }, [])

  return (
    <div>
      <canvas className="border" width={700} height={500}></canvas>
    </div>
  )
}

export default Mt

function drawRect(
  ctx: CanvasRenderingContext2D,
  vertices: number[],
  color: string = 'black',
  lineWidth: number = 0,
  strokeStyle = color
) {
  ctx.fillStyle = color
  ctx.strokeStyle = strokeStyle
  ctx.lineWidth = lineWidth
  ctx.beginPath()
  ctx.moveTo(vertices[0], vertices[1])
  for (let i = 2, len = vertices.length; i < len; i += 2) {
    ctx.lineTo(vertices[i], vertices[i + 1])
  }
  ctx.closePath()
  ctx.stroke()
  ctx.fill()
}
