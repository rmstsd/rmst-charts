import LayoutView, { LayoutOutlet } from '@/components/LayoutView/LayoutView'

import { IRouteObject } from './router'

import RectDemo from '@/demo/2-rmst-render/base-shape/RectDemo'
import Circle from '@/demo/2-rmst-render/base-shape/CircleDemo'
import LineDemo from '@/demo/2-rmst-render/base-shape/LineDemo'
import TextDemo from '@/demo/2-rmst-render/base-shape/TextDemo'

import Draggable from '@/demo/2-rmst-render/drag/Draggable'
import GroupDraggable from '@/demo/2-rmst-render/drag/GroupDraggable'

import Animate from '@/demo/2-rmst-render/animate/Animate'
import GroupClipAnimate from '@/demo/2-rmst-render/animate/GroupClipAnimate'

import WatermarkClip from '@/demo/2-rmst-render/real-case/WatermarkClip'

import DraggableRange from '@/demo/2-rmst-render/drag/DraggableRange'

import Single from '@/demo/2-rmst-render/event/Single'
import TwoOverRect from '@/demo/2-rmst-render/event/TwoOverRect'
import TwoAdjacentRect from '@/demo/2-rmst-render/event/TwoAdjacentRect'
import Overview from '@/demo/2-rmst-render/a_overview'
import Ani_1000个动画 from '@/demo/2-rmst-render/animate/Ani_1000个动画'
import Plum from '@/demo/2-rmst-render/z_杂/Plum'

const rmstRenderRouteConfig: IRouteObject = {
  path: '/rmst-render',
  element: <LayoutView />,
  uiConfig: { title: 'rmst-render' },

  children: [
    {
      path: 'overview',
      element: <LayoutOutlet />,
      uiConfig: { title: 'overview' },
      children: [{ path: 'index', element: <Overview />, uiConfig: { title: 'overview' } }]
    },
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
      path: 'event',
      element: <LayoutOutlet />,
      uiConfig: { title: '事件' },
      children: [
        { path: 'single', element: <Single /> },
        { path: 'adjacent', element: <TwoAdjacentRect /> },
        { path: 'over', element: <TwoOverRect /> }
      ]
    },
    {
      path: 'drag',
      element: <LayoutOutlet />,
      uiConfig: { title: '拖拽' },
      children: [
        { path: 'draggable', element: <Draggable />, uiConfig: { title: 'draggable' } },
        { path: 'group', element: <GroupDraggable />, uiConfig: { title: '成组 draggable' } },
        { path: 'draggableRange', element: <DraggableRange />, uiConfig: { title: '在指定区域拖拽' } }
      ]
    },
    {
      path: 'animate',
      element: <LayoutOutlet />,
      uiConfig: { title: '动画' },
      children: [
        { path: 'base', element: <Animate />, uiConfig: { title: 'Animate' } },
        { path: 'groupClipAnimate', element: <GroupClipAnimate />, uiConfig: { title: '组动画' } },
        { path: 'ani-1000', element: <Ani_1000个动画 />, uiConfig: { title: '1000个动画 同时执行' } }
      ]
    },
    {
      path: 'za',
      element: <LayoutOutlet />,
      uiConfig: { title: '杂' },
      children: [{ path: 'plum', element: <Plum /> }]
    }
    // {
    //   path: 'real-case',
    //   element: <LayoutOutlet />,
    //   uiConfig: { title: '真实场景' },
    //   children: [{ path: 'watermarkClip', element: <WatermarkClip />, uiConfig: { title: '水印' } }]
    // }
  ]
}

export default rmstRenderRouteConfig
