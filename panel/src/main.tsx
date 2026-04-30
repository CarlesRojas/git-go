import { App } from '@/App'
import '@/index.css'
import '@fontsource/jetbrains-mono/index.css'
import '@fontsource/monaspace-neon/index.css'
import { createRoot } from 'react-dom/client'
import 'sonner/dist/styles.css'

const root = createRoot(document.getElementById('root')!)
root.render(<App />)
