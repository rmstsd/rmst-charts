import { Menu, MenuProps } from 'antd'
import { Outlet, useLocation, useMatches, RouteObject } from 'react-router-dom'
import { routes } from '../App'

const convertAntd = (array: RouteObject[]) => {
  return array.map(item => ({ label: item.path, key: item.path }))
}

const LayoutView = () => {
  const location = useLocation()
  console.log(location)

  const [mainName] = location.pathname.split('/').filter(Boolean)

  const items: MenuProps['items'] = convertAntd(routes)

  const erItems = convertAntd(routes.find(item => item.path === mainName).children)

  const onMenuClick = info => {
    const { key, keyPath } = info
    console.log(info)
  }

  return (
    <div>
      <Menu mode="horizontal" items={items} onClick={onMenuClick} />
      <Menu items={erItems} onClick={onMenuClick} style={{ width: 200 }} />
      Layout
      <Outlet />
    </div>
  )
}

export default LayoutView
