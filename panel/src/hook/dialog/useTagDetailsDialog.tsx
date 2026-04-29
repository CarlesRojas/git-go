import { Button } from '@/component/ui/Button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { useToast } from '@/context/ToastContext'
import { useGetTagDetails } from '@/hook/useGitQueries'
import { cn } from '@/util/cn'
import { faCheckCircle, faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitCommit } from '@git/gitService'
import { useState } from 'react'
import { useCopyToClipboard } from 'usehooks-ts'

export const useTagDetailsDialog = () => {
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [commit, setCommit] = useState<GitCommit | null>(null)
  const [tagName, setTagName] = useState<string>('')
  const { data: tagDetails } = useGetTagDetails(tagName, !!tagName)
  const [, copy] = useCopyToClipboard()
  const { showToast } = useToast()

  const copyText = (text: string, label: string) => {
    copy(text)
    showToast({ text: `${label} copied to clipboard`, icon: faCheckCircle, type: 'info' })
  }

  const openDialog = (commitData: GitCommit, tag: string) => {
    setCommit(commitData)
    setTagName(tag)
    setShowDetailsDialog(true)
  }

  const DialogComponent = (
    <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
      <DialogContent data-disable-commit-highlight>
        <DialogHeader>
          <DialogTitle>
            View <strong>{tagName}</strong> tag details
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {tagDetails && commit ? (
            <>
              <p className="text-xs font-medium">
                <span className="opacity-50">Tag Hash: </span>
                <code
                  className={cn('cursor-pointer px-1 transition-opacity hover:opacity-75')}
                  onClick={() => copyText(tagDetails.hash, 'Tag Hash')}
                >
                  {tagDetails.hash}
                </code>
              </p>

              <p className="text-xs font-medium">
                <span className="opacity-50">Commit Hash: </span>
                <code
                  className={cn('cursor-pointer px-1 transition-opacity hover:opacity-75')}
                  onClick={() => copyText(commit.hash, 'Commit Hash')}
                >
                  {commit.hash}
                </code>
              </p>

              <p className="text-xs font-medium">
                <span className="opacity-50">Tagger: </span>
                <span
                  className={cn('cursor-pointer transition-opacity hover:opacity-75')}
                  onClick={() => copyText(tagDetails.taggerName, 'Tagger')}
                >
                  {tagDetails.taggerName}
                </span>{' '}
                <span
                  className={cn('cursor-pointer transition-opacity hover:opacity-75')}
                  onClick={() => copyText(tagDetails.taggerEmail, 'Email')}
                >
                  ({tagDetails.taggerEmail})
                </span>
              </p>

              <p className="text-xs font-medium">
                <span className="opacity-50">Date: </span>
                <time dateTime={tagDetails.taggerDate.split('T')[0]}>
                  {new Date(tagDetails.taggerDate).toLocaleDateString('en-CA', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </time>{' '}
                <time dateTime={tagDetails.taggerDate.split('T')[1]?.split('+')[0] || tagDetails.taggerDate}>
                  {new Date(tagDetails.taggerDate).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })}
                </time>
              </p>

              <p className="text-xs font-medium">
                <span className="opacity-50">Message: </span>
                <span
                  className={cn('cursor-pointer transition-opacity hover:opacity-75')}
                  onClick={() => copyText(tagDetails.message, 'Message')}
                >
                  {tagDetails.message}
                </span>
              </p>
            </>
          ) : (
            <div className="flex justify-center py-4">
              <FontAwesomeIcon icon={faCircleNotch} className="size-4 animate-spin opacity-50" />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return {
    openDialog,
    DialogComponent,
  }
}
