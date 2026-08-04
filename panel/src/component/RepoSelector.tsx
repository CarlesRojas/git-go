import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from '@/component/ui/Combobox'
import { useRepos, useSetActiveRepo } from '@/hook/useGitQueries'
import { faFolder } from '@fortawesome/free-solid-svg-icons'
import { GitRepo } from '@git/repoService'
import { FC, useMemo } from 'react'

/**
 * Chooses which of the workspace's repositories Git Go shows, and only appears when there is more
 * than one of them to choose from.
 */
export const RepoSelector: FC = () => {
  const { data } = useRepos()
  const setActiveRepo = useSetActiveRepo()

  const repos = data?.repos ?? []
  const activeRepo = data?.activeRepo ?? null

  const items = useMemo(() => repos.map(repo => ({ value: repo.path, repo })), [repos])

  if (repos.length <= 1) return null

  const handleValueChange = (value: string | null) => {
    if (!value || value === activeRepo?.path || setActiveRepo.isPending) return

    setActiveRepo.mutate(value)
  }

  return (
    <Combobox items={items} value={activeRepo?.path ?? ''} onValueChange={handleValueChange}>
      <ComboboxTrigger icon={faFolder} className="w-fit max-w-48 min-w-0 shrink">
        <ComboboxValue>
          <span className="truncate">{activeRepo?.name ?? 'Repositories'}</span>
        </ComboboxValue>
      </ComboboxTrigger>

      <ComboboxContent>
        <ComboboxList className="pt-radius">
          {(item: { value: string; repo: GitRepo }) => (
            <ComboboxItem key={item.value} value={item.value}>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate">{item.repo.name}</span>

                {item.repo.relativePath && item.repo.relativePath !== item.repo.name && (
                  <span className="text-vsc-editor-fg/50 truncate text-[0.65rem]">{item.repo.relativePath}</span>
                )}
              </div>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
