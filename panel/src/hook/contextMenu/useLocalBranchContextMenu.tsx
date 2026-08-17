import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/component/ui/ContextMenu'
import { useToast } from '@/context/ToastContext'
import { useBranchDeleteDialog } from '@/hook/dialog/useBranchDeleteDialog'
import { useBranchMergeIntoCurrentDialog } from '@/hook/dialog/useBranchMergeDialog'
import { useBranchPushDialog } from '@/hook/dialog/useBranchPushDialog'
import { useRebaseCurrentBranchIntoBranch } from '@/hook/dialog/useBranchRebaseDialog'
import { useBranchRenameDialog } from '@/hook/dialog/useBranchRenameDialog'
import { useWorktreeCreateDialog } from '@/hook/dialog/useWorktreeCreateDialog'
import { useWorktreeOpenDialog } from '@/hook/dialog/useWorktreeOpenDialog'
import { useGitHubLinks } from '@/hook/useGitHubLinks'
import { useCheckoutLocalBranch, useGitRemotes } from '@/hook/useGitQueries'
import { useCompareEntry } from '@/context/CompareContext'
import { branchSide } from '@/util/compare'
import { gitHubPullRequestUrl, gitHubTreeUrl, openOnGitHub } from '@/util/github'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import {
  faCheck,
  faClone,
  faCodeBranch,
  faCodeCompare,
  faCodeMerge,
  faFolderTree,
  faPen,
  faTrash,
  faUpload,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitBranch } from '@git/gitService'
import { memo, ReactNode } from 'react'
import { useCopyToClipboard } from 'usehooks-ts'

interface UseLocalBranchContextMenuProps {
  branch?: GitBranch
}

const EMPTY_BRANCH: GitBranch = {
  name: '',
  cleanName: '',
  current: false,
  remote: false,
  hash: '',
}

export const useLocalBranchContextMenu = ({ branch }: UseLocalBranchContextMenuProps) => {
  const { showToast } = useToast()
  const checkoutMutation = useCheckoutLocalBranch()
  const { data: remotes = [] } = useGitRemotes()
  const [, copy] = useCopyToClipboard()

  const renameDialog = useBranchRenameDialog({ branch: branch ?? EMPTY_BRANCH })
  const deleteDialog = useBranchDeleteDialog({ branch: branch ?? EMPTY_BRANCH })
  const pushDialog = useBranchPushDialog({ branch: branch ?? EMPTY_BRANCH })
  const mergeDialog = useBranchMergeIntoCurrentDialog({ branch: branch ?? EMPTY_BRANCH })
  const rebaseDialog = useRebaseCurrentBranchIntoBranch({ branch: branch ?? EMPTY_BRANCH })
  const worktreeCreateDialog = useWorktreeCreateDialog({ branch })
  const worktreeOpenDialog = useWorktreeOpenDialog()

  const handleOpenWorktree = () => {
    if (!branch?.worktreePath) return
    worktreeOpenDialog.openDialog({ worktreePath: branch.worktreePath, branchName: branch.cleanName })
  }

  const handleCheckout = () => {
    if (!branch) return

    if (branch.remote) {
      showToast({ text: 'Cannot checkout remote branches directly', type: 'error', icon: faCodeBranch })
      return
    }

    if (branch.worktreePath) {
      handleOpenWorktree()
      return
    }

    checkoutMutation.mutate(
      { branchName: branch.cleanName },
      {
        onSuccess: () => {
          showToast({ text: `Checked out to branch '${branch.cleanName}'`, icon: faCodeBranch })
        },
        onError: error => {
          showToast({ text: error.message, type: 'error', icon: faCodeBranch })
        },
      },
    )
  }

  // The branch's tip commit is what takes part in the comparison
  const compareEntry = useCompareEntry(branch ? branchSide(branch) : null)

  const gitHub = useGitHubLinks()

  // GitHub only knows the branch under the name it was pushed as, so both links go through its
  // upstream: a branch that was never pushed — or was pushed to another remote — has nothing on
  // GitHub to open, and nothing to open a pull request from either
  const upstreamBranch = branch?.upstreamRemote === gitHub.repo?.remote ? branch?.upstreamBranch : undefined
  const gitHubBranchUrl =
    gitHub.refs && gitHub.repo && upstreamBranch ? gitHubTreeUrl(gitHub.repo, upstreamBranch) : null
  const gitHubPullUrl =
    gitHub.pullRequests && gitHub.repo && upstreamBranch && upstreamBranch !== gitHub.repo.defaultBranch
      ? gitHubPullRequestUrl(gitHub.repo, upstreamBranch, gitHub.repo.defaultBranch)
      : null

  const handleCopyBranchName = async () => {
    try {
      if (!branch) throw new Error('No branch to copy')
      await copy(branch.cleanName)
      showToast({ text: `Copied '${branch.cleanName}' to clipboard`, icon: faClone })
    } catch (error) {
      showToast({ text: 'Failed to copy branch name', type: 'error', icon: faClone })
    }
  }

  const LocalBranchContextMenuWrapper = memo(
    ({ children, enabled = true }: { children: ReactNode; enabled?: boolean }) => {
      if (!branch || !enabled) return <>{children}</>

      return (
        <ContextMenu>
          <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>

          <ContextMenuContent
            onClick={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
            onMouseUp={e => e.stopPropagation()}
            onMouseEnter={e => e.stopPropagation()}
            onMouseLeave={e => e.stopPropagation()}
            data-disable-commit-highlight
          >
            <ContextMenuLabel>Local Branch actions</ContextMenuLabel>

            {!branch.current && !branch.worktreePath && (
              <ContextMenuItem onClick={handleCheckout}>
                <FontAwesomeIcon icon={faCheck} className="size-3" />
                Checkout
              </ContextMenuItem>
            )}

            {!branch.current && !!branch.worktreePath && (
              <ContextMenuItem onClick={handleOpenWorktree}>
                <FontAwesomeIcon icon={faFolderTree} className="size-3" />
                Open Worktree
              </ContextMenuItem>
            )}

            {!branch.current && !branch.worktreePath && (
              <ContextMenuItem onClick={worktreeCreateDialog.openDialog}>
                <FontAwesomeIcon icon={faFolderTree} className="size-3" />
                Create Worktree
              </ContextMenuItem>
            )}

            <ContextMenuItem onClick={renameDialog.openDialog}>
              <FontAwesomeIcon icon={faPen} className="size-3" />
              Rename
            </ContextMenuItem>

            {remotes.length > 0 && (
              <ContextMenuItem onClick={pushDialog.openDialog}>
                <FontAwesomeIcon icon={faUpload} className="size-3" />
                Push
              </ContextMenuItem>
            )}

            {!branch.current && (
              <>
                <ContextMenuItem onClick={mergeDialog.openDialog}>
                  <FontAwesomeIcon icon={faCodeMerge} className="size-3" />
                  Merge into Current
                </ContextMenuItem>

                <ContextMenuItem onClick={rebaseDialog.openDialog}>
                  <FontAwesomeIcon icon={faCodeBranch} className="size-3" />
                  Rebase Current Branch Here
                </ContextMenuItem>
              </>
            )}

            {compareEntry && (
              <ContextMenuItem onClick={compareEntry.onSelect}>
                <FontAwesomeIcon icon={faCodeCompare} className="size-3" />
                {compareEntry.label}
              </ContextMenuItem>
            )}

            {/* Last before the separator: the destructive entry ends every one of these menus */}
            {!branch.current && (
              <ContextMenuItem onClick={deleteDialog.openDialog} variant="destructive">
                <FontAwesomeIcon icon={faTrash} className="size-3" />
                Delete
              </ContextMenuItem>
            )}

            {/* Its own section, and no section at all when the settings leave it nothing to show */}
            {(gitHubBranchUrl || gitHubPullUrl) && (
              <>
                <ContextMenuSeparator />

                <ContextMenuLabel>GitHub</ContextMenuLabel>

                {gitHubPullUrl && (
                  <ContextMenuItem onClick={() => openOnGitHub(gitHubPullUrl)}>
                    <FontAwesomeIcon icon={faGithub} className="size-3" />
                    Create Pull Request
                  </ContextMenuItem>
                )}

                {gitHubBranchUrl && (
                  <ContextMenuItem onClick={() => openOnGitHub(gitHubBranchUrl)}>
                    <FontAwesomeIcon icon={faGithub} className="size-3" />
                    Open on GitHub
                  </ContextMenuItem>
                )}
              </>
            )}

            <ContextMenuSeparator />

            <ContextMenuItem onClick={handleCopyBranchName}>
              <FontAwesomeIcon icon={faClone} className="size-3" />
              Copy Branch Name
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      )
    },
  )

  LocalBranchContextMenuWrapper.displayName = 'LocalBranchContextMenuWrapper'

  const localBranchContextMenuWrapper = (children: ReactNode, enabled = true) => (
    <LocalBranchContextMenuWrapper enabled={enabled}>{children}</LocalBranchContextMenuWrapper>
  )

  return {
    localBranchContextMenuWrapper,
    dialogs: (
      <>
        {renameDialog.DialogComponent}
        {deleteDialog.DialogComponent}
        {pushDialog.DialogComponent}
        {mergeDialog.DialogComponent}
        {rebaseDialog.DialogComponent}
        {worktreeCreateDialog.DialogComponent}
        {worktreeOpenDialog.DialogComponent}
      </>
    ),
  }
}
