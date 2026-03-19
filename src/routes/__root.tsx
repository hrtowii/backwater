import { Link, Outlet, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => {
    return (
      <div>
        <p>This is the notFoundComponent configured on root route</p>
        <Link to="/splash">Start Over</Link>
      </div>
    )
  },
})

function RootComponent() {
  return <Outlet />
}
