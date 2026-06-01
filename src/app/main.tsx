import { startTransition } from 'react'
import { createRoot } from 'react-dom/client'

const root = createRoot(document.getElementById('root') as HTMLElement)

startTransition(() => {
  root.render(<h1>Hello, World!</h1>)
})
