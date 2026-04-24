import React from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/monaspace-neon/index.css'
import '@fontsource/jetbrains-mono/index.css'
import './index.css'
import { App } from './App'

const root = createRoot(document.getElementById('root')!)
root.render(<App />)
