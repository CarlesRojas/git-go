import { Button } from '@/component/ui/Button'
import { Checkbox } from '@/component/ui/Checkbox'
import { Label } from '@/component/ui/Label'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetLabel,
  SheetSeparator,
  SheetTitle,
  SheetTrigger,
} from '@/component/ui/Sheet'
import { useSettings } from '@/context/SettingsContext'
import { useToast } from '@/context/ToastContext'
import { useOverrideGlobalGitUserDialog } from '@/hook/dialog/useOverrideGlobalGitUserDialog'
import { useRemoteConfigDialog } from '@/hook/dialog/useRemoteConfigDialog'
import { useRemoveLocalGitUserDialog } from '@/hook/dialog/useRemoveLocalGitUserDialog'
import { useGitUserConfig, useRepoName, useRepoState } from '@/hook/useGitQueries'
import { cn } from '@/util/cn'
import {
  faCheckCircle,
  faCircleNotch,
  faCodeBranch,
  faCog,
  faInbox,
  faNetworkWired,
  faTag,
  faTrash,
  faUser,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC } from 'react'
import { useCopyToClipboard } from 'usehooks-ts'

export const RepoSettings: FC = () => {
  const { settings } = useSettings()
  const { data: repoName } = useRepoName()
  const { setRepoState } = useRepoState()
  const { showToast } = useToast()
  const { data: gitUserConfig } = useGitUserConfig()

  const overrideGlobalGitUserDialog = useOverrideGlobalGitUserDialog()
  const removeLocalGitUserDialog = useRemoveLocalGitUserDialog()
  const remoteConfigDialog = useRemoteConfigDialog()

  const [, copy] = useCopyToClipboard()
  const copyText = (text: string, label: string) => {
    copy(text)
    showToast({ text: `${label} copied to clipboard`, icon: faCheckCircle, type: 'info' })
  }

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

          <div className="flex flex-col gap-3 p-3">
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

            <SheetSeparator />

            <div className="flex flex-col gap-2">
              <SheetLabel>Current Git User</SheetLabel>

              {gitUserConfig && (
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium">
                    <span
                      className={cn('cursor-pointer transition-opacity hover:opacity-75')}
                      onClick={() => copyText(gitUserConfig.userName, 'Git Username')}
                    >
                      {gitUserConfig.userName}
                    </span>{' '}
                    <span
                      className={cn('cursor-pointer transition-opacity hover:opacity-75')}
                      onClick={() => copyText(gitUserConfig.userEmail, 'Git Email')}
                    >
                      ({gitUserConfig.userEmail})
                    </span>
                  </p>

                  {gitUserConfig && (
                    <div
                      className={cn(
                        'rounded-main border-vsc-editor-fg/20 bg-vsc-editor-fg/10 h-fit px-1.5 py-0.5 text-xs',
                        // gitUserConfig.isLocal && 'bg-vsc-list-highlight-fg/10 text-vsc-list-highlight-fg',
                      )}
                    >
                      {gitUserConfig.isLocal ? 'Local' : 'Global'}
                    </div>
                  )}
                </div>
              )}

              {gitUserConfig && (
                <div className="flex w-full gap-2">
                  <Button
                    className="w-fit"
                    variant="secondary"
                    onClick={() => overrideGlobalGitUserDialog.openDialog()}
                  >
                    <FontAwesomeIcon icon={faUser} className="size-3" />
                    Change
                  </Button>

                  {gitUserConfig.isLocal && (
                    <Button
                      className="w-fit"
                      variant="destructive"
                      onClick={() => removeLocalGitUserDialog.openDialog()}
                    >
                      <FontAwesomeIcon icon={faTrash} className="size-3" />
                      Remove Override
                    </Button>
                  )}
                </div>
              )}

              {!gitUserConfig && (
                <div className="flex items-center justify-center py-2">
                  <FontAwesomeIcon icon={faCircleNotch} className="text-muted-foreground size-4 animate-spin" />
                </div>
              )}
            </div>

            <SheetSeparator />

            <Button variant="secondary" className="w-fit" onClick={() => remoteConfigDialog.openDialog()}>
              <FontAwesomeIcon icon={faNetworkWired} className="size-3" />
              Remote Configuration
            </Button>

            <SheetSeparator />

            <Button variant="ghost" className="w-fit px-0" onClick={handleOpenSettings}>
              <FontAwesomeIcon icon={faCog} className="size-3" />
              Extension Global Settings
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {overrideGlobalGitUserDialog.DialogComponent}
      {removeLocalGitUserDialog.DialogComponent}
      {remoteConfigDialog.DialogComponent}
    </>
  )
}
