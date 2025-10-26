import LayoutView, { LayoutOutlet } from '@/components/LayoutView/LayoutView'

import Plum from '@/demo/6-other/Plum'
import AniCurve from '@/demo/6-other/贝塞尔曲线计算动画'
import LinePath from '@/demo/6-other/过点曲线'
import CurveRect from '@/demo/6-other/渐变'
import Translation from '@/demo/6-other/mtDe/Translation'
import BBox from '@/demo/6-other/BBox'
import LineAnimate from '@/demo/6-other/折线计算动画'
import 贝塞尔曲线峰值吸附 from '@/demo/6-other/贝塞尔曲线峰值吸附'
import CanvasTransform from '@/demo/6-other/mtDe/CanvasTransform'
import UpAniEnd from '@/demo/6-other/UpAniEnd'
import XiFu from '@/demo/6-other/xifu/XiFu'

import { IRouteObject } from './router'

import { isProd } from '@/utils'
import Xg from '@/demo/6-other/mtDe/Xg/Xg'
import Xg_multi from '@/demo/6-other/mtDe/Xg_multi/Xg_multi'
import MyTest from '@/demo/6-other/mtDe/MyTest'
import PureMt from '@/demo/6-other/mtDe/PureMt'

const otherRouteConfig: IRouteObject = {
  path: '/other',
  element: <LayoutView />,
  uiConfig: { title: '杂项', hidden: isProd },
  children: [
    {
      path: 'mt',
      element: <LayoutOutlet />,
      uiConfig: { title: '矩阵' },
      children: [
        { path: 'translation', element: <Translation /> },
        { path: 'canvasTransform', element: <CanvasTransform /> },
        { path: 'PureMt', element: <PureMt /> },
        { path: 'xg', element: <Xg /> },
        { path: 'xg_multi', element: <Xg_multi /> },
        { path: 'MyTest', element: <MyTest /> }
      ]
    },
    { path: 'plum', element: <Plum /> },
    { path: '贝塞尔曲线峰值吸附', element: <贝塞尔曲线峰值吸附 /> },
    { path: '贝塞尔曲线计算动画', element: <AniCurve /> },
    { path: '折线计算动画', element: <LineAnimate /> },
    { path: 'linePath', element: <LinePath />, uiConfig: { title: '过点曲线' } },
    { path: 'curveRect', element: <CurveRect />, uiConfig: { title: '渐变' } },
    { path: 'brush', element: <BBox /> },
    { path: 'UpAniEnd', element: <UpAniEnd /> },
    { path: 'XiFu', element: <XiFu /> }
  ]
}

export default otherRouteConfig
