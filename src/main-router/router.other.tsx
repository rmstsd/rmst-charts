import LayoutView from '@/components/LayoutView/LayoutView'

import Plum from '@/demo/other/Plum'
import AniCurve from '@/demo/other/AniCurve'
import LinePath from '@/demo/other/LinePath'
import CurveRect from '@/demo/other/CurveRect'
import Translation from '@/demo/other/Translation'

export default {
  path: '/other',
  element: <LayoutView />,
  uiConfig: { title: '杂项' },
  children: [
    { path: 'plum', element: <Plum /> },
    { path: 'aniCurve', element: <AniCurve /> },
    { path: 'linePath', element: <LinePath /> },
    { path: 'curveRect', element: <CurveRect /> },
    { path: 'translation', element: <Translation /> }
  ]
}
