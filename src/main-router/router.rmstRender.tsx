import LayoutView, { LayoutOutlet } from '@/components/LayoutView/LayoutView'

import RectDemo from '@/demo/render/base-shape/RectDemo'
import Circle from '@/demo/render/base-shape/CircleDemo'
import LineDemo from '@/demo/render/base-shape/LineDemo'
import TextDemo from '@/demo/render/base-shape/TextDemo'

import Draggable from '@/demo/render/drag/Draggable'
import GroupDraggable from '@/demo/render/drag/GroupDraggable'

import Animate from '@/demo/render/animate/Animate'
import GroupClipAnimate from '@/demo/render/animate/GroupClipAnimate'

import WatermarkClip from '@/demo/render/real-case/WatermarkClip'

import { IRouteObject } from './router'

const rmstRenderRouteConfig: IRouteObject = {
  path: '/rmst-render',
  element: <LayoutView />,
  uiConfig: { title: 'render (core)' },
  children: [
    {
      path: 'base',
      element: <LayoutOutlet />,
      uiConfig: { title: '基础图形' },
      children: [
        { path: 'rect', element: <RectDemo />, uiConfig: { title: '矩形' } },
        { path: 'circle', element: <Circle />, uiConfig: { title: '圆, 环, 扇, 扇环' } },
        { path: 'line', element: <LineDemo />, uiConfig: { title: '线' } },
        { path: 'text', element: <TextDemo />, uiConfig: { title: '文本' } }
      ]
    },
    {
      path: 'drag',
      element: <LayoutOutlet />,
      uiConfig: { title: '拖拽' },
      children: [
        { path: 'draggable', element: <Draggable />, uiConfig: { title: 'draggable' } },
        { path: 'group', element: <GroupDraggable />, uiConfig: { title: '成组 draggable' } }
      ]
    },
    {
      path: 'animate',
      element: <LayoutOutlet />,
      uiConfig: { title: '动画' },
      children: [
        { path: 'base', element: <Animate />, uiConfig: { title: 'Animate' } },
        { path: 'groupClipAnimate', element: <GroupClipAnimate />, uiConfig: { title: '组 clip 动画' } }
      ]
    },
    {
      path: 'real-case',
      element: <LayoutOutlet />,
      uiConfig: { title: '真实场景' },
      children: [{ path: 'watermarkClip', element: <WatermarkClip />, uiConfig: { title: '水印' } }]
    }
  ]
}

export default rmstRenderRouteConfig
