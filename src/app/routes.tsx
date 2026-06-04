import { createBrowserRouter } from 'react-router'

import { Root } from './pages'

export const router = createBrowserRouter([
  {
    element: <Root />,
    path: '/',
    children: [
      {
        path: 'dashboard',
        lazy: (): Promise<typeof import('./pages/dashboard')> => import('./pages/dashboard')
      },
      {
        path: 'login',
        lazy: (): Promise<typeof import('./pages/login')> => import('./pages/login')
      }
    ]
  }
])
