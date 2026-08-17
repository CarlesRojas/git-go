import { TreeView } from '@/component/Tree'
import { Button } from '@/component/ui/Button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/component/ui/Sheet'
import { useCompare } from '@/context/CompareContext'
import { useComparison } from '@/hook/useGitQueries'
import { buildFileTree } from '@/util/buildFileTree'
import { faArrowRight, faCircleNotch, faRightLeft, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC, useMemo } from 'react'

/**
 * The diff between two commits or refs, shown beside the graph rather than over it: the two rows
 * it compares stay visible and marked while it is open.
 */
export const ComparePanel: FC = () => {
  const { comparison, swap, close } = useCompare()

  const { data, isLoading, isError, error } = useComparison(comparison?.from.ref ?? null, comparison?.to.ref ?? null)

  const totals = useMemo(() => {
    if (!data) return { additions: 0, deletions: 0 }
    return data.files.reduce(
      (sum, file) => ({ additions: sum.additions + file.additions, deletions: sum.deletions + file.deletions }),
      { additions: 0, deletions: 0 },
    )
  }, [data])

  // The refs are resolved to hashes before diffing, so a branch moving while the panel is open
  // cannot make the file list and the diffs it opens disagree.
  const fileTree = useMemo(
    () =>
      data ? buildFileTree(data.files, undefined, false, false, { fromRef: data.fromHash, toRef: data.toHash }) : null,
    [data],
  )

  return (
    <Sheet open={!!comparison} onOpenChange={open => !open && close()} modal={false}>
      <SheetContent side="right" showOverlay={false} onInteractOutside={event => event.preventDefault()}>
        <SheetHeader className="pr-9">
          <SheetTitle className="flex min-w-0 items-center gap-2">
            <span className="text-vsc-list-highlight-fg truncate font-bold" title={comparison?.from.label}>
              {comparison?.from.label}
            </span>

            <FontAwesomeIcon icon={faArrowRight} className="size-2.5 shrink-0 opacity-50" />

            <span className="text-vsc-list-highlight-fg truncate font-bold" title={comparison?.to.label}>
              {comparison?.to.label}
            </span>

            <Button
              variant="ghost"
              size="icon"
              className="ml-auto shrink-0"
              onClick={swap}
              title="Swap the direction of the comparison"
            >
              <FontAwesomeIcon icon={faRightLeft} className="size-3" />
              <span className="sr-only">Swap direction</span>
            </Button>
          </SheetTitle>
        </SheetHeader>

        <div className="flex min-h-0 flex-col gap-3 p-3">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-4 opacity-80">
              <FontAwesomeIcon icon={faCircleNotch} className="size-3 animate-spin" />
              <span className="text-xs">Comparing...</span>
            </div>
          )}

          {isError && (
            <div className="flex items-center gap-2 py-4">
              <FontAwesomeIcon icon={faTimesCircle} className="text-vsc-error-fg size-3 shrink-0" />
              <span className="text-vsc-error-fg text-xs">{error?.message ?? 'Could not compare these commits'}</span>
            </div>
          )}

          {data && (
            <>
              <div className="flex items-center gap-3 text-xs font-medium">
                <span className="text-vsc-git-added-fg">+{totals.additions}</span>

                <span className="text-vsc-git-deleted-fg">−{totals.deletions}</span>

                <span className="opacity-50">
                  {data.files.length} {data.files.length === 1 ? 'file' : 'files'}
                </span>
              </div>

              {data.files.length === 0 ? (
                <p className="py-2 text-xs opacity-50">These two commits have identical content.</p>
              ) : (
                fileTree && <TreeView data={fileTree} expandAll />
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
