import { startTransition } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'

import { router } from './routes'

import './styles/main.scss'

const root = createRoot(document.getElementById('root') as HTMLElement)

startTransition(() => {
  root.render(<RouterProvider router={router} />)
})
