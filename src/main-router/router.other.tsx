import LayoutView from '@/components/LayoutView/LayoutView'

import Plum from '@/demo/5-other/Plum'
import AniCurve from '@/demo/5-other/贝塞尔曲线计算动画'
import LinePath from '@/demo/5-other/过点曲线'
import CurveRect from '@/demo/5-other/渐变'
import Translation from '@/demo/5-other/Translation'
import WaterDrop from '@/demo/5-other/WaterDrop'
import Brush from '@/demo/5-other/Brush'
import LineAnimate from '@/demo/5-other/折线计算动画'
import 贝塞尔曲线峰值吸附 from '@/demo/5-other/贝塞尔曲线峰值吸附'
import Rotate from '@/demo/5-other/rotate'

import { IRouteObject } from './router'

const otherRouteConfig: IRouteObject = {
  path: '/other',
  element: <LayoutView />,
  uiConfig: { title: '杂项', hidden: import.meta.env.PROD },
  children: [
    { path: 'plum', element: <Plum /> },
    { path: '贝塞尔曲线峰值吸附', element: <贝塞尔曲线峰值吸附 /> },
    { path: '贝塞尔曲线计算动画', element: <AniCurve /> },
    { path: 'linePath', element: <LinePath />, uiConfig: { title: '过点曲线' } },
    { path: 'curveRect', element: <CurveRect />, uiConfig: { title: '渐变' } },
    { path: '折线计算动画', element: <LineAnimate /> },
    { path: 'translation', element: <Translation /> },
    { path: 'rotate', element: <Rotate /> },
    { path: 'waterDrop', element: <WaterDrop /> },
    { path: 'brush', element: <Brush /> }
  ]
}

export default otherRouteConfig
