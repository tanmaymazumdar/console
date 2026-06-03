import { startTransition } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router/dom'

import { router } from './routes'
import { store } from './store'

import './styles/main.scss'

const root = createRoot(document.getElementById('root') as HTMLElement)

startTransition(() => {
  root.render(
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  )
})
