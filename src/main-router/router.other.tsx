import LayoutView from '../LayoutView/LayoutView'

import Plum from '@/demo/other/Plum'
import SelfTry from '@/demo/other/SelfTry'

export default {
  path: '/other',
  element: <LayoutView />,
  uiConfig: { title: '杂项' },
  children: [
    { path: 'plum', element: <Plum /> },
    { path: 'selfTry', element: <SelfTry /> }
  ]
}
