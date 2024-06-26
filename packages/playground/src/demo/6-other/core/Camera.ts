import { Matrix3 } from './Matrix3'
import { Vector2 } from './Vector2'

class Camera {
  position: Vector2
  zoom: number

  constructor(x = 0, y = 0, zoom = 1) {
    this.position = new Vector2(x, y)
    this.zoom = zoom
  }
  /* 视图投影矩阵：先逆向缩放，再逆向位置 */
  get pvMatrix() {
    const { position, zoom } = this
    return new Matrix3().scale(1 / zoom).translate(-position.x, -position.y)
  }
  /* 使用视图投影矩阵变换物体*/
  transformInvert(ctx: CanvasRenderingContext2D) {
    const { position, zoom } = this

    const scale = 1 / zoom
    ctx.translate(-position.x, -position.y)
    ctx.scale(scale, scale)
  }
}

export { Camera }
