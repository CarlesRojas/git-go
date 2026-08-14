import { AbortOperationButton } from '@/component/AbortOperationButton'
import { BranchSelector } from '@/component/BranchSelector'
import { DragOverlay } from '@/component/DragOverlay'
import { GitActionLoadingToast } from '@/component/GitActionLoadingToast'
import { Graph } from '@/component/Graph'
import { RefetchButton } from '@/component/RefreshButton'
import { RepoSelector } from '@/component/RepoSelector'
import { SearchInput } from '@/component/SearchInput'
import { UndoButton } from '@/component/UndoButton'
import { WorktreeMenu } from '@/component/WorktreeMenu'
import { DragProvider } from '@/context/DragContext'
import { SettingsProvider } from '@/context/SettingsContext'
import { ToastProvider } from '@/context/ToastContext'
import { Button } from '@/component/ui/Button'
import { useOpenSettings, useRepos } from '@/hook/useGitQueries'
import { cn } from '@/util/cn'
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitBranch } from '@git/gitService'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FC, useRef, useState } from 'react'
import { useEventListener } from 'usehooks-ts'
import { RepoSettings } from './component/RepoSettings'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
})

/** Shown when neither the workspace folders nor their subfolders hold a repository */
const NoRepoFound: FC = () => {
  const openSettings = useOpenSettings()

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
      <FontAwesomeIcon icon={faFolderOpen} className="text-vsc-editor-fg/30 size-8" />

      <p className="text-vsc-editor-fg/70 text-sm">No git repository in this folder or its subfolders.</p>

      <p className="text-vsc-editor-fg/40 max-w-md text-xs">
        Open a folder with a repository, or look further down into this one by raising
        <span className="text-vsc-editor-fg/60"> git-go.repo.scanDepth</span>.
      </p>

      <Button variant="secondary" onClick={() => openSettings.mutate('git-go.repo.scanDepth')}>
        Open Settings
      </Button>
    </div>
  )
}

/**
 * The graph of a single repository. Mounted per repository, so switching to another one starts from
 * its own branch selection rather than carrying over the previous repository's.
 */
const RepoPanel: FC = () => {
  const [selectedBranches, setSelectedBranches] = useState<GitBranch[]>([])
  const [searchTerm, setSearchTerm] = useState<string>('')

  return (
    <>
      <div
        className={cn([
          // Position & Layout
          'flex h-9 max-h-9 min-h-9 w-full items-center justify-between gap-2',
          // Colors & Background
          'bg-vsc-editor-bg',
          // Borders
          'border-vsc-editor-fg/15 border-b',
          // Spacing
          'px-2',
        ])}
      >
        <div className="flex min-w-0 items-center gap-2">
          <RepoSelector />

          <BranchSelector onBranchesChange={setSelectedBranches} />

          <WorktreeMenu />
        </div>

        <div className="flex items-center gap-2">
          <AbortOperationButton />

          <UndoButton />

          <SearchInput value={searchTerm} onChange={setSearchTerm} />

          <RefetchButton />

          <RepoSettings />
        </div>
      </div>

      <main className="graph-h relative flex flex-col overflow-y-auto" data-drag-scroll-container>
        <Graph selectedBranches={selectedBranches} searchTerm={searchTerm} />
      </main>

      <DragOverlay />
    </>
  )
}

const Panel: FC = () => {
  const documentRef = useRef<Document>(document)

  const { data: repoData, isLoading: isLoadingRepos } = useRepos()

  const onGitChange = (event: MessageEvent) => {
    if (event.data.type === 'gitChanged') queryClient.invalidateQueries({ queryKey: ['git'] })
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'f') {
      event.preventDefault()
      const searchInput = document.querySelector<HTMLInputElement>('input[data-type="search"]')
      searchInput?.focus()
    }
  }

  useEventListener('message', onGitChange)
  useEventListener('keydown', handleKeyDown, documentRef)

  const activeRepo = repoData?.activeRepo ?? null

  return (
    <div
      className={cn([
        // Layout & Structure
        'flex max-h-screen min-h-screen max-w-screen min-w-screen flex-col',
        // Typography
        'text-vsc-editor-fg font-medium',
        // Colors & Background
        // 'bg-vsc-editor-bg',
        // Selection States
        'selection:bg-vsc-editor-fg/10!',
      ])}
      style={{
        fontFamily:
          '"Monaspace Neon", "JetBrains Mono", "JetBrainsMono Nerd Font", "Monaco", "Menlo", "Ubuntu Mono", "Consolas", "source-code-pro", monospace',
      }}
    >
      <GitActionLoadingToast />

      {isLoadingRepos ? null : activeRepo ? <RepoPanel key={activeRepo.path} /> : <NoRepoFound />}
    </div>
  )
}

export const App: FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <ToastProvider>
          <DragProvider>
            <Panel />
          </DragProvider>
        </ToastProvider>
      </SettingsProvider>
    </QueryClientProvider>
  )
}
