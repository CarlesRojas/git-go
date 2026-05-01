import { ComponentProps } from 'react'
import { Toaster as Sonner } from 'sonner'
import 'sonner/dist/styles.css'

type ToasterProps = ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      icons={{
        error: null,
        info: null,
        success: null,
        warning: null,
        loading: null,
      }}
      className="pointer-events-auto!"
      toastOptions={{
        classNames: {
          toast:
            'rounded-main-outer! pointer-events-auto! p-0! poborder-vsc-editor-fg/15! bg-vsc-editor-bg/80! border! backdrop-blur-lg!',
          success: 'pointer-events-auto! border-vsc-git-added-fg/30! bg-vsc-editor-bg/80!',
          error: 'pointer-events-auto! border-vsc-git-deleted-fg/30! bg-vsc-editor-bg/80!',
          warning: 'pointer-events-auto! border-vsc-git-modified-fg/30! bg-vsc-editor-bg/80!',
          info: 'pointer-events-auto! border-vsc-editor-fg/15! bg-vsc-editor-bg/80!',
        },
        style: {
          maxWidth: '32rem !important',
          padding: '0.625rem !important',
          gap: '0.5rem !important',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
