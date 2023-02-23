import { Layout, Menu, MenuProps } from 'antd'
import { Outlet, useLocation, useMatches, useNavigate, matchRoutes } from 'react-router-dom'
import { IRouteObject, routes } from '../main-router/router'

const convertAntd = (array: IRouteObject[]): MenuProps['items'] => {
  return array
    .filter(item => !item.uiConfig?.hidden)
    .map(item =>
      Object.assign(
        { label: item.uiConfig?.title || item.path, key: item.path },
        item.children && { children: convertAntd(item.children) }
      )
    )
}

const LayoutView = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const mRoutes = matchRoutes(routes, location.pathname)
  const routePathArray = mRoutes.map(item => item.route.path)

  const items: MenuProps['items'] = convertAntd(routes)

  const onMenuClick = info => {
    const { key, keyPath } = info
    const path = keyPath.reverse().join('/')
    navigate(path)

    window.location.reload()
  }

  return (
    <Layout style={{ height: '100vh', backgroundColor: 'white' }}>
      <Layout.Sider style={{ overflow: 'auto', height: '100%' }}>
        <Menu
          mode="inline"
          defaultOpenKeys={items.map(o => o.key) as any}
          selectedKeys={routePathArray}
          items={items}
          onClick={onMenuClick}
          theme="dark"
        />
      </Layout.Sider>

      <Layout.Content style={{ margin: 15 }}>
        <Outlet />
      </Layout.Content>
    </Layout>
  )
}

export default LayoutView
