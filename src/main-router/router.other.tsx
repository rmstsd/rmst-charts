import LayoutView from '../LayoutView/LayoutView'

import Plum from '@/demo/other/Plum'
import AniCurve from '@/demo/other/AniCurve'

export default {
  path: '/other',
  element: <LayoutView />,
  uiConfig: { title: '杂项' },
  children: [
    { path: 'plum', element: <Plum /> },
    { path: 'aniCurve', element: <AniCurve /> }
  ]
}
