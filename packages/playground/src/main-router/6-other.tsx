import LayoutView from '@/components/LayoutView/LayoutView'

import Plum from '@/demo/6-other/Plum'
import AniCurve from '@/demo/6-other/贝塞尔曲线计算动画'
import LinePath from '@/demo/6-other/过点曲线'
import CurveRect from '@/demo/6-other/渐变'
import Translation from '@/demo/6-other/Translation'
import BBox from '@/demo/6-other/BBox'
import LineAnimate from '@/demo/6-other/折线计算动画'
import 贝塞尔曲线峰值吸附 from '@/demo/6-other/贝塞尔曲线峰值吸附'
import Mt from '@/demo/6-other/Mt'
import UpAniEnd from '@/demo/6-other/UpAniEnd'

import { IRouteObject } from './router'

import { isProd } from '@/utils'

const otherRouteConfig: IRouteObject = {
  path: '/other',
  element: <LayoutView />,
  uiConfig: { title: '杂项', hidden: isProd },
  children: [
    { path: 'plum', element: <Plum /> },
    { path: '贝塞尔曲线峰值吸附', element: <贝塞尔曲线峰值吸附 /> },
    { path: '贝塞尔曲线计算动画', element: <AniCurve /> },
    { path: '折线计算动画', element: <LineAnimate /> },
    { path: 'linePath', element: <LinePath />, uiConfig: { title: '过点曲线' } },
    { path: 'curveRect', element: <CurveRect />, uiConfig: { title: '渐变' } },
    { path: 'translation', element: <Translation /> },
    { path: 'rotate', element: <Mt /> },
    { path: 'brush', element: <BBox /> },
    { path: 'UpAniEnd', element: <UpAniEnd /> }
  ]
}

export default otherRouteConfig
