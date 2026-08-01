import { GitRemote } from '@git/gitService'

export const resolveDefaultRemote = (remotes: GitRemote[], preferredRemote: string): string | undefined =>
  remotes.find(remote => remote.name === preferredRemote)?.name ?? remotes[0]?.name
