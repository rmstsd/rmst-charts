import LayoutView, { LayoutOutlet } from '@/components/LayoutView/LayoutView'
import DogHead from '@/components/DogHead'

import { IRouteObject } from './router'

import Overview from '@/demo/2-rmst-render/a_overview'
import Debug from '@/demo/2-rmst-render/a_overview/debug'

import RectDemo from '@/demo/2-rmst-render/base-shape/RectDemo'
import Circle from '@/demo/2-rmst-render/base-shape/CircleDemo'
import LineDemo from '@/demo/2-rmst-render/base-shape/LineDemo'
import TrapezoidDemo from '@/demo/2-rmst-render/base-shape/TrapezoidDemo'
import TextDemo from '@/demo/2-rmst-render/base-shape/TextDemo'

import ZIndex from '@/demo/2-rmst-render/z-index/ZIndex'

import Single from '@/demo/2-rmst-render/event/Single'
import TwoOverRect from '@/demo/2-rmst-render/event/TwoOverRect'
import TwoAdjacentRect from '@/demo/2-rmst-render/event/TwoAdjacentRect'
import NestRect from '@/demo/2-rmst-render/event/NestRect'

import Draggable from '@/demo/2-rmst-render/drag/Draggable'
import GroupDraggable from '@/demo/2-rmst-render/drag/GroupDraggable'
import DraggableRange from '@/demo/2-rmst-render/drag/DraggableRange'

import Animate from '@/demo/2-rmst-render/animate/Animate'
import GroupClipAnimate from '@/demo/2-rmst-render/animate/GroupClipAnimate'
import Ani_1000个动画 from '@/demo/2-rmst-render/animate/Ani_1000个动画'

import Plum from '@/demo/2-rmst-render/funny/Plum'
import Bubble from '@/demo/2-rmst-render/funny/Bubble'
import Collision from '@/demo/2-rmst-render/funny/Collision'

import SoundingBox from '@/demo/2-rmst-render/boundingBox'
import CollisionOOP from '@/demo/2-rmst-render/funny/Collision/CollisionOOP'

import { isProd } from '@/utils'

const rmstRenderRouteConfig: IRouteObject = {
  path: '/rmst-render',
  element: <LayoutView />,
  uiConfig: { title: 'rmst-render' },

  children: [
    {
      path: 'overview',
      element: <LayoutOutlet />,
      uiConfig: { title: 'overview' },
      children: [
        { path: 'index', element: <Overview />, uiConfig: { title: 'overview' } },
        { path: 'debug', element: <Debug /> }
      ]
    },
    {
      path: 'base',
      element: <LayoutOutlet />,
      uiConfig: { title: '基础图形' },
      children: [
        { path: 'rect', element: <RectDemo />, uiConfig: { title: '矩形' } },
        { path: 'trapezoid', element: <TrapezoidDemo />, uiConfig: { title: '梯形' } },
        { path: 'circle', element: <Circle />, uiConfig: { title: '圆, 环, 扇, 扇环' } },
        { path: 'line', element: <LineDemo />, uiConfig: { title: '线' } },
        { path: 'text', element: <TextDemo />, uiConfig: { title: '文本' } }
      ]
    },
    {
      path: 'zIndex',
      element: <LayoutOutlet />,
      uiConfig: { title: '层级' },
      children: [{ path: 'z', element: <ZIndex />, uiConfig: { title: '层级' } }]
    },
    {
      path: 'event',
      element: <LayoutOutlet />,
      uiConfig: { title: '事件' },
      children: [
        { path: 'single', element: <Single />, uiConfig: { title: '单个图形' } },
        { path: 'adjacent', element: <TwoAdjacentRect />, uiConfig: { title: '同级相邻' } },
        { path: 'over', element: <TwoOverRect />, uiConfig: { title: '同级覆盖' } },
        { path: 'nest', element: <NestRect />, uiConfig: { title: '父子嵌套' } }
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
      path: 'funny',
      element: <LayoutOutlet />,
      uiConfig: { title: 'funny demo' },
      children: [
        { path: 'Plum', element: <Plum /> },
        { path: 'Bubble', element: <Bubble /> },
        { path: 'Collision', element: <Collision />, uiConfig: { title: '碰撞' } },
        { path: 'CollisionOOP', element: <CollisionOOP />, uiConfig: { title: '碰撞OOP' } }
      ]
    },
    {
      path: 'sb',
      element: <LayoutOutlet />,
      uiConfig: { title: 'SoundingBox' },
      children: [{ path: 'sb', element: <SoundingBox />, uiConfig: { icon: <DogHead size={26} /> } }]
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
