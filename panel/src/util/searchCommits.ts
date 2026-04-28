import type { GitBranch, GitCommit } from '@git/gitService'

const cleanSearchTerm = (term: string): string => {
  return (
    term
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      // .replace(/[-_.,;:!?@#$%^&*()+=\[\]{}|\\/<>]/g, ' ')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .trim()
      .toLowerCase()
  )
}

export const matchesSearch = (commit: GitCommit, branches: GitBranch[], searchTerm: string): boolean => {
  if (!searchTerm.trim()) return true

  const searchWords = cleanSearchTerm(searchTerm)
    .split(/\s+/)
    .filter(word => word.length > 0)

  if (searchWords.length === 0) return true

  const fields = [
    cleanSearchTerm(commit.message),
    cleanSearchTerm(commit.author),
    cleanSearchTerm(commit.email),
    commit.hash.toLowerCase(),
    commit.refs ? cleanSearchTerm(commit.refs) : '',
    ...commit.tags.map(tag => cleanSearchTerm(tag)),
    ...branches.filter(b => b.hash === commit.hash).map(b => cleanSearchTerm(b.cleanName)),
  ]

  return searchWords.every(word => fields.some(field => field.includes(word)))
}
