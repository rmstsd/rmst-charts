import { Divider, Layout, Menu, MenuProps } from 'antd'
import { Outlet, useLocation, useNavigate, matchRoutes } from 'react-router-dom'
import { convertToAntdData, findPath, routes } from '@/main-router/router'

const LayoutView = () => {
  const headerItems: MenuProps['items'] = convertToAntdData(routes, false)

  const location = useLocation()
  const navigate = useNavigate()

  const mRoutes = matchRoutes(routes, location.pathname)
  const routePathArray = mRoutes.map(item => item.route.path)
  const [mainPath] = routePathArray

  const siderItems: MenuProps['items'] = convertToAntdData(
    routes.find(item => item.path === mainPath).children,
    true
  )

  const onHeaderMenuClick = info => {
    const { key } = info

    const path = findPath(routes.find(item => item.path === key))
    navigate(path)
  }

  const onErMenuClick = info => {
    const { key } = info
    navigate(mainPath + key)
  }

  const sideMenuKeys = mRoutes
    .map(item => item.pathname.split('/').slice(2).join('/'))
    .filter(Boolean)
    .map(item => '/' + item)

  const defaultOpenKeys = siderItems.map(item => item.key as string)

  return (
    <Layout style={{ height: '100%', backgroundColor: 'white' }}>
      <Layout.Header style={{ backgroundColor: 'transparent', display: 'flex', padding: 0 }}>
        <div style={{ width: 200 }}></div>
        <Menu
          mode="horizontal"
          selectedKeys={routePathArray}
          items={headerItems}
          onClick={onHeaderMenuClick}
          style={{ border: 'none', flexGrow: 1 }}
        />
      </Layout.Header>

      <Divider style={{ margin: 0 }} />
      <section style={{ flexGrow: 1, display: 'flex', backgroundColor: '#f9f9f9' }}>
        <aside
          style={{ flexShrink: 0, overflow: 'auto', width: 200, height: '100%', backgroundColor: '#fff' }}
        >
          <Menu
            mode="inline"
            defaultOpenKeys={defaultOpenKeys}
            selectedKeys={sideMenuKeys}
            items={siderItems}
            onClick={onErMenuClick}
            style={{ height: '100%' }}
          />
        </aside>

        <Layout.Content style={{ margin: 10, padding: 10, borderRadius: 5, backgroundColor: '#fff' }}>
          <Outlet />
        </Layout.Content>
      </section>
    </Layout>
  )
}

export default LayoutView

export const LayoutOutlet = () => <Outlet />
