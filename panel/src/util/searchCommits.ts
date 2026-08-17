import type { GitBranch, GitCommit } from '@git/gitService'

export type SearchKind = 'plain' | 'author' | 'file' | 'hash'

export interface ParsedSearch {
  kind: SearchKind
  value: string
}

/** Split a term into its search kind and value: `author:`, `file:` and `hash:` prefix the plain search */
export const parseSearchTerm = (term: string): ParsedSearch => {
  const trimmed = term.trim()
  const prefixed = /^(author|file|hash):([\s\S]*)$/i.exec(trimmed)
  if (prefixed) return { kind: prefixed[1]!.toLowerCase() as SearchKind, value: prefixed[2]!.trim() }
  return { kind: 'plain', value: trimmed }
}

// Only case and accents are folded — every other character stays, so `feat/foo`, `v1.2.3`,
// and file paths are searchable literally
const cleanSearchTerm = (term: string): string => {
  return term
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

const matchesWords = (value: string, fields: string[]): boolean => {
  const searchWords = cleanSearchTerm(value)
    .split(/\s+/)
    .filter(word => word.length > 0)

  if (searchWords.length === 0) return true

  return searchWords.every(word => fields.some(field => field.includes(word)))
}

/**
 * Whether a loaded row matches the term on the data the client can see (message, author, hash,
 * refs, tags, branch pills). `file:` terms always report false here — only the git-side search
 * can look at a commit's files.
 */
export const matchesSearch = (commit: GitCommit, branches: GitBranch[], searchTerm: string): boolean => {
  const { kind, value } = parseSearchTerm(searchTerm)
  if (!value) return true

  if (kind === 'file') return false

  if (kind === 'hash') return commit.hash.toLowerCase().startsWith(value.toLowerCase())

  if (kind === 'author') return matchesWords(value, [cleanSearchTerm(commit.author), cleanSearchTerm(commit.email)])

  const fields = [
    cleanSearchTerm(commit.message),
    commit.body ? cleanSearchTerm(commit.body) : '',
    cleanSearchTerm(commit.author),
    cleanSearchTerm(commit.email),
    commit.hash.toLowerCase(),
    commit.refs ? cleanSearchTerm(commit.refs) : '',
    ...commit.tags.map(tag => cleanSearchTerm(tag)),
    ...branches.filter(b => b.hash === commit.hash).map(b => cleanSearchTerm(b.cleanName)),
  ]

  return matchesWords(value, fields)
}
