import { App } from '@/App'
import '@/index.css'
import { IS_WINDOWS } from '@/util/platform'
import '@fontsource/jetbrains-mono/index.css'
import '@fontsource/monaspace-neon/index.css'
import { createRoot } from 'react-dom/client'
import 'sonner/dist/styles.css'

if (IS_WINDOWS) document.documentElement.setAttribute('data-no-backdrop-blur', '')

const root = createRoot(document.getElementById('root')!)
root.render(<App />)
