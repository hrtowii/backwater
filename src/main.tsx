import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { ThemeProvider } from './contexts/ThemeContext'
import './styles.css'

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultStaleTime: 5000,
  scrollRestoration: true,
})


declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root')

if (window.location.pathname === '/') {
  window.history.replaceState({}, '', '/splash')
}

if (!rootElement) {
  throw new Error('Failed to find the root element')
}

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}
