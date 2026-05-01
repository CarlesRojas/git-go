import { Button } from '@/component/ui/Button'
import { Checkbox } from '@/component/ui/Checkbox'
import { Label } from '@/component/ui/Label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/component/ui/Sheet'
import { useSettings } from '@/context/SettingsContext'
import { useToast } from '@/context/ToastContext'
import { useGitUserDialog } from '@/hook/dialog/useGitUserDialog'
import { useRemoteConfigDialog } from '@/hook/dialog/useRemoteConfigDialog'
import { useRepoName, useRepoState } from '@/hook/useGitQueries'
import { faCodeBranch, faCog, faInbox, faNetworkWired, faTag, faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC } from 'react'

export const RepoSettings: FC = () => {
  const { settings } = useSettings()
  const { data: repoName } = useRepoName()
  const { setRepoState } = useRepoState()
  const { showToast } = useToast()

  const gitUserDialog = useGitUserDialog()
  const remoteConfigDialog = useRemoteConfigDialog()

  const handleToggleStashes = async (checked: boolean) => {
    try {
      setRepoState({ showStashes: checked })
      showToast({
        text: checked ? 'Stashes are now visible' : 'Stashes are now hidden',
        type: 'success',
        icon: faInbox,
      })
    } catch (error) {
      console.error('Failed to toggle stashes visibility:', error)
      showToast({
        text: 'Failed to toggle stashes visibility',
        type: 'error',
        icon: faInbox,
      })
    }
  }

  const handleToggleTags = async (checked: boolean) => {
    try {
      setRepoState({ showTags: checked })
      showToast({
        text: checked ? 'Tags are now visible' : 'Tags are now hidden',
        type: 'success',
        icon: faTag,
      })
    } catch (error) {
      console.error('Failed to toggle tags visibility:', error)
      showToast({
        text: 'Failed to toggle tags visibility',
        type: 'error',
        icon: faTag,
      })
    }
  }

  const handleOpenSettings = () => {
    const vscode = window.acquireVsCodeApi()
    vscode.postMessage({ type: 'openSettings', query: 'git-go' })
  }

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="secondary" size="icon">
            <FontAwesomeIcon icon={faCog} className="size-3" />
            <span className="sr-only">Repository Settings</span>
          </Button>
        </SheetTrigger>

        <SheetContent side="right" className="w-80">
          <SheetHeader>
            <SheetTitle className="text-vsc-list-highlight-fg flex items-center gap-2 font-bold">
              <FontAwesomeIcon icon={faCodeBranch} className="size-3" />
              {repoName}
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-6 p-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center">
                <Checkbox id="showStashes" checked={settings.showStashes} onCheckedChange={handleToggleStashes} />

                <Label htmlFor="showStashes" className="cursor-pointer pl-2 text-sm">
                  Show Stashes
                </Label>
              </div>

              <div className="flex items-center">
                <Checkbox id="showTags" checked={settings.showTags} onCheckedChange={handleToggleTags} />

                <Label htmlFor="showTags" className="cursor-pointer pl-2 text-sm">
                  Show Tags
                </Label>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button variant="secondary" className="w-fit" onClick={() => gitUserDialog.openDialog()}>
                <FontAwesomeIcon icon={faUser} className="size-3" />
                Git User Settings
              </Button>

              <Button variant="secondary" className="w-fit" onClick={() => remoteConfigDialog.openDialog()}>
                <FontAwesomeIcon icon={faNetworkWired} className="size-3" />
                Remote Configuration
              </Button>
            </div>

            <Button variant="secondary" className="justify-start gap-2" onClick={handleOpenSettings}>
              <FontAwesomeIcon icon={faCog} className="size-3" />
              Extension Global Settings
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {gitUserDialog.DialogComponent}
      {remoteConfigDialog.DialogComponent}
    </>
  )
}
