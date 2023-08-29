import LayoutView from '@/components/LayoutView/LayoutView'

import Plum from '@/demo/other/Plum'
import AniCurve from '@/demo/other/AniCurve'
import LinePath from '@/demo/other/LinePath'
import CurveRect from '@/demo/other/CurveRect'
import Translation from '@/demo/other/Translation'
import WaterDrop from '@/demo/other/WaterDrop'
import Brush from '@/demo/other/Brush'

import { IRouteObject } from './router'
console.log(import.meta.env)
const otherRouteConfig: IRouteObject = {
  path: '/other',
  element: <LayoutView />,
  uiConfig: { title: '杂项', hidden: import.meta.env.PROD },
  children: [
    { path: 'plum', element: <Plum /> },
    { path: 'aniCurve', element: <AniCurve /> },
    { path: 'linePath', element: <LinePath /> },
    { path: 'curveRect', element: <CurveRect /> },
    { path: 'translation', element: <Translation /> },
    { path: 'waterDrop', element: <WaterDrop /> },
    { path: 'brush', element: <Brush /> }
  ]
}

export default otherRouteConfig
