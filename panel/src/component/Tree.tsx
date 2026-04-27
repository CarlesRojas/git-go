import { Button } from '@/component/ui/Button'
import { cn } from '@/util/cn'
import { faChevronRight, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitFileChange } from '@git/gitService'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { cva } from 'class-variance-authority'
import {
  ComponentPropsWithoutRef,
  ComponentType,
  DragEvent,
  HTMLAttributes,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react'

const treeVariants = cva(
  'group before:bg-accent/70 before:absolute before:left-0 before:-z-10 before:h-8 before:w-full before:rounded-lg before:opacity-0 hover:before:opacity-100',
)

const selectedTreeVariants = cva('before:bg-accent/70 text-accent-foreground before:opacity-100')

const dragOverVariants = cva('before:bg-primary/20 text-primary-foreground before:opacity-100')

interface TreeDataItem {
  id: string
  name: string
  icon?: ComponentType<{ className?: string }>
  selectedIcon?: ComponentType<{ className?: string }>
  openIcon?: ComponentType<{ className?: string }>
  children?: TreeDataItem[]
  actions?: ReactNode
  onClick?: () => void
  onOpenDiff?: () => void
  onOpenFile?: () => void
  draggable?: boolean
  droppable?: boolean
  disabled?: boolean
  className?: string
  fileChange?: GitFileChange
  filePath?: string
}

type TreeRenderItemParams = {
  item: TreeDataItem
  level: number
  isLeaf: boolean
  isSelected: boolean
  isOpen?: boolean
  hasChildren: boolean
}

type TreeProps = HTMLAttributes<HTMLDivElement> & {
  data: TreeDataItem[] | TreeDataItem
  initialSelectedItemId?: string
  onSelectChange?: (item: TreeDataItem | undefined) => void
  expandAll?: boolean
  defaultNodeIcon?: ComponentType<{ className?: string }>
  defaultLeafIcon?: ComponentType<{ className?: string }>
  onDocumentDrag?: (sourceItem: TreeDataItem, targetItem: TreeDataItem) => void
  renderItem?: (params: TreeRenderItemParams) => ReactNode
}

const TreeView = ({
  data,
  initialSelectedItemId,
  onSelectChange,
  expandAll,
  defaultLeafIcon,
  defaultNodeIcon,
  className,
  onDocumentDrag,
  renderItem,
  ...props
}: TreeProps) => {
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>(initialSelectedItemId)

  const [draggedItem, setDraggedItem] = useState<TreeDataItem | null>(null)

  const handleSelectChange = useCallback(
    (item: TreeDataItem | undefined) => {
      setSelectedItemId(item?.id)
      if (onSelectChange) {
        onSelectChange(item)
      }
    },
    [onSelectChange],
  )

  const handleDragStart = useCallback((item: TreeDataItem) => {
    setDraggedItem(item)
  }, [])

  const handleDrop = useCallback(
    (targetItem: TreeDataItem) => {
      if (draggedItem && onDocumentDrag && draggedItem.id !== targetItem.id) {
        onDocumentDrag(draggedItem, targetItem)
      }
      setDraggedItem(null)
    },
    [draggedItem, onDocumentDrag],
  )

  const expandedItemIds = useMemo(() => {
    const ids: string[] = []

    function walkTreeItems(items: TreeDataItem[] | TreeDataItem, targetId?: string) {
      if (Array.isArray(items)) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i]!
          if (expandAll && item.children) {
            ids.push(item.id)
          } else if (!expandAll && targetId) {
            ids.push(item.id)
            if (walkTreeItems(item, targetId)) {
              return true
            }
            ids.pop()
          }
          if (item.children) {
            walkTreeItems(item.children, targetId)
          }
        }
      } else if (!expandAll && targetId && items.id === targetId) {
        return true
      } else if (items.children) {
        if (expandAll) {
          ids.push(items.id)
        }
        return walkTreeItems(items.children, targetId)
      }
    }

    if (expandAll) {
      walkTreeItems(data)
    } else if (initialSelectedItemId) {
      walkTreeItems(data, initialSelectedItemId)
    }

    return ids
  }, [data, expandAll, initialSelectedItemId])

  return (
    <div className={cn('relative overflow-hidden py-3 pr-2', className)}>
      <TreeItem
        data={data}
        selectedItemId={selectedItemId}
        handleSelectChange={handleSelectChange}
        expandedItemIds={expandedItemIds}
        defaultLeafIcon={defaultLeafIcon}
        defaultNodeIcon={defaultNodeIcon}
        handleDragStart={handleDragStart}
        handleDrop={handleDrop}
        draggedItem={draggedItem}
        renderItem={renderItem}
        level={0}
        {...props}
      />

      <div
        className="h-0 w-full"
        onDrop={() => {
          handleDrop({ id: '', name: 'parent_div' })
        }}
      ></div>
    </div>
  )
}

type TreeItemProps = TreeProps & {
  selectedItemId?: string
  handleSelectChange: (item: TreeDataItem | undefined) => void
  expandedItemIds: string[]
  defaultNodeIcon?: ComponentType<{ className?: string }>
  defaultLeafIcon?: ComponentType<{ className?: string }>
  handleDragStart?: (item: TreeDataItem) => void
  handleDrop?: (item: TreeDataItem) => void
  draggedItem: TreeDataItem | null
  level?: number
}

const TreeItem = ({
  className,
  data,
  selectedItemId,
  handleSelectChange,
  expandedItemIds,
  defaultNodeIcon,
  defaultLeafIcon,
  handleDragStart,
  handleDrop,
  draggedItem,
  renderItem,
  level,
  onSelectChange,
  expandAll,
  initialSelectedItemId,
  onDocumentDrag,
  ...props
}: TreeItemProps) => {
  if (!Array.isArray(data)) {
    data = [data]
  }
  return (
    <div role="tree" className={className} {...props}>
      <ul>
        {data.map(item => (
          <li key={item.id}>
            {item.children ? (
              <TreeNode
                item={item}
                level={level ?? 0}
                selectedItemId={selectedItemId}
                expandedItemIds={expandedItemIds}
                handleSelectChange={handleSelectChange}
                defaultNodeIcon={defaultNodeIcon}
                defaultLeafIcon={defaultLeafIcon}
                handleDragStart={handleDragStart}
                handleDrop={handleDrop}
                draggedItem={draggedItem}
                renderItem={renderItem}
              />
            ) : (
              <TreeLeaf
                item={item}
                level={level ?? 0}
                selectedItemId={selectedItemId}
                handleSelectChange={handleSelectChange}
                defaultLeafIcon={defaultLeafIcon}
                handleDragStart={handleDragStart}
                handleDrop={handleDrop}
                draggedItem={draggedItem}
                renderItem={renderItem}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

const TreeNode = ({
  item,
  handleSelectChange,
  expandedItemIds,
  selectedItemId,
  defaultNodeIcon,
  defaultLeafIcon,
  handleDragStart,
  handleDrop,
  draggedItem,
  renderItem,
  level = 0,
}: {
  item: TreeDataItem
  handleSelectChange: (item: TreeDataItem | undefined) => void
  expandedItemIds: string[]
  selectedItemId?: string
  defaultNodeIcon?: ComponentType<{ className?: string }>
  defaultLeafIcon?: ComponentType<{ className?: string }>
  handleDragStart?: (item: TreeDataItem) => void
  handleDrop?: (item: TreeDataItem) => void
  draggedItem: TreeDataItem | null
  renderItem?: (params: TreeRenderItemParams) => ReactNode
  level?: number
}) => {
  const [value, setValue] = useState(expandedItemIds.includes(item.id) ? [item.id] : [])
  const [isDragOver, setIsDragOver] = useState(false)
  const hasChildren = !!item.children?.length
  const isSelected = selectedItemId === item.id
  const isOpen = value.includes(item.id)

  const onDragStart = (e: DragEvent<HTMLButtonElement>) => {
    if (!item.draggable) {
      e.preventDefault()
      return
    }
    e.dataTransfer?.setData('text/plain', item.id)
    handleDragStart?.(item)
  }

  const onDragOver = (e: DragEvent<HTMLButtonElement>) => {
    if (item.droppable !== false && draggedItem && draggedItem.id !== item.id) {
      e.preventDefault()
      setIsDragOver(true)
    }
  }

  const onDragLeave = () => {
    setIsDragOver(false)
  }

  const onDrop = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    handleDrop?.(item)
  }

  return (
    <AccordionPrimitive.Root type="multiple" value={value} onValueChange={s => setValue(s)}>
      <AccordionPrimitive.Item value={item.id}>
        <AccordionTrigger
          className={cn(
            treeVariants(),
            isSelected && selectedTreeVariants(),
            isDragOver && dragOverVariants(),
            item.className,
          )}
          onClick={() => {
            handleSelectChange(item)
            item.onClick?.()
          }}
          draggable={!!item.draggable}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          {renderItem ? (
            renderItem({
              item,
              level,
              isLeaf: false,
              isSelected,
              isOpen,
              hasChildren,
            })
          ) : (
            <>
              <TreeIcon item={item} isSelected={isSelected} isOpen={isOpen} default={defaultNodeIcon} />
              <span className="truncate text-xs leading-tight">{item.name}</span>
              <TreeActions isSelected={isSelected}>{item.actions}</TreeActions>
            </>
          )}
        </AccordionTrigger>
        <AccordionContent className="ml-4">
          <TreeItem
            data={item.children ? item.children : item}
            selectedItemId={selectedItemId}
            handleSelectChange={handleSelectChange}
            expandedItemIds={expandedItemIds}
            defaultLeafIcon={defaultLeafIcon}
            defaultNodeIcon={defaultNodeIcon}
            handleDragStart={handleDragStart}
            handleDrop={handleDrop}
            draggedItem={draggedItem}
            renderItem={renderItem}
            level={level + 1}
          />
        </AccordionContent>
      </AccordionPrimitive.Item>
    </AccordionPrimitive.Root>
  )
}

const TreeLeaf = ({
  className,
  item,
  level,
  selectedItemId,
  handleSelectChange,
  defaultLeafIcon,
  handleDragStart,
  handleDrop,
  draggedItem,
  renderItem,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  item: TreeDataItem
  level: number
  selectedItemId?: string
  handleSelectChange: (item: TreeDataItem | undefined) => void
  defaultLeafIcon?: ComponentType<{ className?: string }>
  handleDragStart?: (item: TreeDataItem) => void
  handleDrop?: (item: TreeDataItem) => void
  draggedItem: TreeDataItem | null
  renderItem?: (params: TreeRenderItemParams) => ReactNode
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const isSelected = selectedItemId === item.id

  const onDragStart = (e: DragEvent) => {
    if (!item.draggable || item.disabled) {
      e.preventDefault()
      return
    }
    e.dataTransfer.setData('text/plain', item.id)
    handleDragStart?.(item)
  }

  const onDragOver = (e: DragEvent) => {
    if (item.droppable !== false && !item.disabled && draggedItem && draggedItem.id !== item.id) {
      e.preventDefault()
      setIsDragOver(true)
    }
  }

  const onDragLeave = () => {
    setIsDragOver(false)
  }

  const onDrop = (e: DragEvent) => {
    if (item.disabled) return
    e.preventDefault()
    setIsDragOver(false)
    handleDrop?.(item)
  }

  return (
    <div
      className={cn(
        'flex h-5 max-h-5 min-h-5 w-fit cursor-pointer items-center pl-1 text-left',
        treeVariants(),
        className,
        isSelected && selectedTreeVariants(),
        isDragOver && dragOverVariants(),
        item.disabled && 'pointer-events-none cursor-not-allowed opacity-50',
        item.className,
      )}
      onClick={() => {
        if (item.disabled) return
        handleSelectChange(item)
        // Open git diff when clicking on a leaf node with file changes
        if (item.fileChange && item.onOpenDiff) {
          item.onOpenDiff()
        } else {
          item.onClick?.()
        }
      }}
      draggable={!!item.draggable && !item.disabled}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      {...props}
    >
      {renderItem ? (
        <>
          <div className="mr-1 h-3 w-3 shrink-0" />
          {renderItem({
            item,
            level,
            isLeaf: true,
            isSelected,
            hasChildren: false,
          })}
        </>
      ) : (
        <>
          <TreeIcon item={item} isSelected={isSelected} default={defaultLeafIcon} />

          <span className="line-clamp-1 w-fit truncate text-xs">
            {item.name}
            {item.fileChange &&
              !['A', 'D'].includes(item.fileChange.status) &&
              (item.fileChange.additions > 0 || item.fileChange.deletions > 0) && (
                <span className="text-(--vscode-editor-foreground) opacity-60">
                  {' '}
                  (
                  {item.fileChange.additions > 0 && (
                    <span className="text-(--vscode-gitDecoration-addedResourceForeground)">
                      +{item.fileChange.additions}
                    </span>
                  )}
                  {item.fileChange.additions && item.fileChange.deletions ? ' ' : ''}
                  {item.fileChange.deletions > 0 && (
                    <span className="text-(--vscode-gitDecoration-deletedResourceForeground)">
                      -{item.fileChange.deletions}
                    </span>
                  )}
                  )
                </span>
              )}
          </span>

          {item.fileChange && !!item.onOpenFile && (
            <Button
              variant="ghost"
              size="iconSmall"
              className="ml-2 opacity-0 transition-opacity duration-300 group-hover:opacity-80"
              onClick={e => {
                e.stopPropagation()
                item.onOpenFile?.()
              }}
              title="Open file directly"
            >
              <FontAwesomeIcon icon={faExternalLinkAlt} className="h-3 w-3" />
            </Button>
          )}

          <TreeActions isSelected={isSelected && !item.disabled}>{item.actions}</TreeActions>
        </>
      )}
    </div>
  )
}

const AccordionTrigger = ({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>) => (
  <AccordionPrimitive.Header>
    <AccordionPrimitive.Trigger
      className={cn('group/trigger flex h-5 max-h-5 min-h-5 w-full cursor-pointer items-center', className)}
      {...props}
    >
      <FontAwesomeIcon
        icon={faChevronRight}
        className="mr-2 h-3 w-3 shrink-0 text-(--vscode-editor-foreground)/50 transition-transform duration-300 group-data-[state=open]/trigger:rotate-90"
      />
      {children}
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
)

const AccordionContent = ({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>) => (
  <AccordionPrimitive.Content
    className={cn(
      'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-xs transition-all',
      className,
    )}
    {...props}
  >
    <div className="pt-0">{children}</div>
  </AccordionPrimitive.Content>
)

const TreeIcon = ({
  item,
  isOpen,
  isSelected,
  default: defaultIcon,
}: {
  item: TreeDataItem
  isOpen?: boolean
  isSelected?: boolean
  default?: ComponentType<{ className?: string }>
}) => {
  let Icon: ComponentType<{ className?: string }> | undefined = defaultIcon
  if (isSelected && item.selectedIcon) {
    Icon = item.selectedIcon
  } else if (isOpen && item.openIcon) {
    Icon = item.openIcon
  } else if (item.icon) {
    Icon = item.icon
  }
  return Icon ? <Icon className="mr-2 h-3 w-3 shrink-0" /> : <></>
}

const TreeActions = ({ children, isSelected }: { children: ReactNode; isSelected: boolean }) => {
  return <div className={cn(isSelected ? 'block' : 'hidden', 'absolute right-3 group-hover:block')}>{children}</div>
}

export {
  AccordionContent,
  AccordionTrigger,
  TreeItem,
  TreeLeaf,
  TreeNode,
  TreeView,
  type TreeDataItem,
  type TreeRenderItemParams,
}
