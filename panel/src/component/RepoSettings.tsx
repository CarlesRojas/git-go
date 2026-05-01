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
import { useAddRemoteDialog } from '@/hook/dialog/useAddRemoteDialog'
import { useOverrideGlobalGitUserDialog } from '@/hook/dialog/useOverrideGlobalGitUserDialog'
import { useRemoveLocalGitUserDialog } from '@/hook/dialog/useRemoveLocalGitUserDialog'
import { useRemoveRemoteDialog } from '@/hook/dialog/useRemoveRemoteDialog'
import { useGitRemotes, useGitUserConfig, useOpenSettings, useRepoName, useRepoState } from '@/hook/useGitQueries'
import { cn } from '@/util/cn'
import {
  faAdd,
  faCheckCircle,
  faCircleNotch,
  faCodeBranch,
  faCog,
  faEye,
  faEyeSlash,
  faInbox,
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
  const { data: remotes = [], isLoading: isLoadingRemotes } = useGitRemotes()

  const overrideGlobalGitUserDialog = useOverrideGlobalGitUserDialog()
  const removeLocalGitUserDialog = useRemoveLocalGitUserDialog()
  const addRemoteDialog = useAddRemoteDialog()
  const removeRemoteDialog = useRemoveRemoteDialog()
  const openSettingsMutation = useOpenSettings()

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
        type: 'info',
        icon: faInbox,
      })
    } catch (error) {
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
        type: 'info',
        icon: faTag,
      })
    } catch (error) {
      showToast({
        text: 'Failed to toggle tags visibility',
        type: 'error',
        icon: faTag,
      })
    }
  }

  const handleToggleRemotes = async (checked: boolean) => {
    try {
      setRepoState({ showRemotes: checked })
      showToast({
        text: checked ? 'Remote branches are now visible' : 'Remote branches are now hidden',
        type: 'info',
        icon: faCodeBranch,
      })
    } catch (error) {
      showToast({
        text: 'Failed to toggle remote branches visibility',
        type: 'error',
        icon: faCodeBranch,
      })
    }
  }

  const handleOpenSettings = () => {
    openSettingsMutation.mutate('@ext:pinya.git-go', {
      onError: error => {
        showToast({
          text: `Failed to open settings: ${error.message}`,
          type: 'error',
          icon: faCog,
        })
      },
    })
  }

  const handleToggleRemoteVisibility = async (remoteName: string) => {
    try {
      const isHidden = settings.hiddenRemotes && settings.hiddenRemotes.includes(remoteName)
      const newHiddenRemotes = isHidden
        ? settings.hiddenRemotes.filter(name => name !== remoteName)
        : [...(settings.hiddenRemotes || []), remoteName]

      setRepoState({ hiddenRemotes: newHiddenRemotes })

      showToast({
        text: isHidden ? `Remote "${remoteName}" is now visible` : `Remote "${remoteName}" is now hidden`,
        type: 'info',
        icon: isHidden ? faEye : faEyeSlash,
      })
    } catch (error) {
      showToast({
        text: 'Failed to toggle remote visibility',
        type: 'error',
        icon: faEye,
      })
    }
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

        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle className="text-vsc-list-highlight-fg flex items-center gap-2 font-bold">
              <FontAwesomeIcon icon={faCodeBranch} className="size-3" />
              {repoName}
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-3 p-3">
            <div className="flex items-center">
              <Checkbox id="showRemotes" checked={settings.showRemotes} onCheckedChange={handleToggleRemotes} />

              <Label htmlFor="showRemotes" className="cursor-pointer pl-2">
                Show Remote Branches
              </Label>
            </div>

            <div className="flex items-center">
              <Checkbox id="showStashes" checked={settings.showStashes} onCheckedChange={handleToggleStashes} />

              <Label htmlFor="showStashes" className="cursor-pointer pl-2">
                Show Stashes
              </Label>
            </div>

            <div className="flex items-center">
              <Checkbox id="showTags" checked={settings.showTags} onCheckedChange={handleToggleTags} />

              <Label htmlFor="showTags" className="cursor-pointer pl-2">
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

            <div className="flex flex-col gap-2">
              <SheetLabel>Git Remotes</SheetLabel>

              {isLoadingRemotes && (
                <div className="flex items-center justify-center py-2">
                  <FontAwesomeIcon icon={faCircleNotch} className="text-muted-foreground size-4 animate-spin" />
                </div>
              )}

              {remotes.map(remote => (
                <div key={remote.name} className="flex items-center justify-between gap-2">
                  <div className="flec grow flex-col">
                    <div className="font-semibold">{remote.name}</div>

                    <div
                      className="cursor-pointer truncate text-[0.7rem] opacity-50 hover:opacity-80"
                      onClick={() => copyText(remote.fetchUrl, 'Fetch URL')}
                      title={remote.fetchUrl}
                    >
                      Fetch: {remote.fetchUrl}
                    </div>

                    <div
                      className="cursor-pointer truncate text-[0.7rem] opacity-50 hover:opacity-80"
                      onClick={() => copyText(remote.pushUrl, 'Push URL')}
                      title={remote.pushUrl}
                    >
                      Push: {remote.pushUrl}
                    </div>
                  </div>

                  <Button variant="secondary" size="icon" onClick={() => handleToggleRemoteVisibility(remote.name)}>
                    <FontAwesomeIcon
                      icon={settings.hiddenRemotes && settings.hiddenRemotes.includes(remote.name) ? faEyeSlash : faEye}
                      className="size-3"
                    />
                  </Button>

                  <Button variant="destructive" size="icon" onClick={() => removeRemoteDialog.openDialog(remote.name)}>
                    <FontAwesomeIcon icon={faTrash} className="size-3" />
                  </Button>
                </div>
              ))}

              {remotes.length === 0 && <div className="py-2">No remotes configured</div>}

              <Button variant="secondary" className="w-fit" onClick={() => addRemoteDialog.openDialog()}>
                <FontAwesomeIcon icon={faAdd} className="size-3" />
                Add Remote
              </Button>
            </div>

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
      {addRemoteDialog.DialogComponent}
      {removeRemoteDialog.DialogComponent}
    </>
  )
}
