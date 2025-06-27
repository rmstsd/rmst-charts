import { Enum } from 'enum-plus'

export const ToolEnum = Enum({
  Select: { label: '选择' },
  Rect: { label: '矩形' },
  Ellipse: { label: '椭圆' },
  Rhombus: { label: '菱形' },
  Pencil: { label: '铅笔' }
})

export type ToolEnumKey = (typeof ToolEnum.keys)[number]
