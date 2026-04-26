import type { GitFileChange } from '../../../src/gitService'
import { TreeDataItem } from '../components/Tree'

const STATUS_LABELS: Record<string, string> = {
  A: 'Added',
  M: 'Modified',
  D: 'Deleted',
  R: 'Renamed',
  C: 'Copied',
  T: 'Type changed',
}

export function buildFileTree(files: GitFileChange[]): TreeDataItem[] {
  const root: Record<string, any> = {}

  for (const file of files) {
    const parts = file.path.split('/')
    let current = root

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]!
      const isFile = i === parts.length - 1

      if (!current[part]) {
        current[part] = isFile ? { __file: file } : { __children: {} }
      }

      if (!isFile) {
        if (!current[part].__children) current[part].__children = {}
        current = current[part].__children
      }
    }
  }

  function toTreeItems(node: Record<string, any>, parentPath: string = ''): TreeDataItem[] {
    const items: TreeDataItem[] = []

    const entries = Object.entries(node).sort(([aKey, aVal], [bKey, bVal]) => {
      const aIsFolder = !aVal.__file
      const bIsFolder = !bVal.__file
      if (aIsFolder !== bIsFolder) return aIsFolder ? -1 : 1
      return aKey.localeCompare(bKey)
    })

    for (const [name, value] of entries) {
      const fullPath = parentPath ? `${parentPath}/${name}` : name

      if (value.__file) {
        const file = value.__file as GitFileChange
        items.push({
          id: fullPath,
          name: file.oldPath ? `${name} ← ${file.oldPath.split('/').pop()}` : name,
          className: statusClass(file.status),
        })
      } else {
        items.push({
          id: fullPath,
          name,
          children: collapseTree(toTreeItems(value.__children, fullPath)),
        })
      }
    }

    return items
  }

  function collapseTree(items: TreeDataItem[]): TreeDataItem[] {
    return items.map(item => {
      if (!item.children) return item

      // Recursively collapse children first
      let children = collapseTree(item.children)

      // If this folder has exactly one child and that child is also a folder, merge them
      while (children.length === 1 && children[0]!.children) {
        const child = children[0]!
        item = {
          ...item,
          id: child.id,
          name: `${item.name}/${child.name}`,
          children: child.children,
        }
        children = collapseTree(item.children!)
      }

      return { ...item, children }
    })
  }

  return collapseTree(toTreeItems(root))
}

function statusClass(status: string): string {
  switch (status) {
    case 'A':
      return 'text-green-500'
    case 'D':
      return 'text-red-500'
    case 'M':
      return 'text-yellow-500'
    case 'R':
      return 'text-blue-500'
    default:
      return ''
  }
}
