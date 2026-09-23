import { useEffect, useRef, useState } from 'react'
import {
  Bell,
  ChevronDown,
  CircleUserRound,
  CloudSun,
  Download,
  Upload,
} from 'lucide-react'
import { BrandMark } from './components/BrandMark'
import {
  GearVault,
  type Filters,
  type SortOption,
} from './features/inventory/GearVault'
import { ItemDialog } from './features/inventory/ItemDialog'
import { ItemInspector } from './features/inventory/ItemInspector'
import { seedInventory } from './features/inventory/seedItems'
import { ActiveLoadout } from './features/loadouts/ActiveLoadout'
import {
  createLocalStorageAdapter,
  deserializeInventory,
  mergeInventory,
  serializeInventory,
} from './lib/storage/inventoryStorage'
import type { GearItem, LoadoutEntry, PersistedInventory } from './types/gear'

const storage = createLocalStorageAdapter()
type SaveState = 'loading' | 'idle' | 'saving' | 'saved' | 'error'

export default function App() {
  const [inventory, setInventory] = useState<PersistedInventory | null>(null)
  const [saveState, setSaveState] = useState<SaveState>('loading')
  const [importMode, setImportMode] = useState<'merge' | 'overwrite'>('merge')
  const [importReport, setImportReport] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<Filters>({
    category: '',
    tag: '',
    status: '',
  })
  const [sort, setSort] = useState<SortOption>('name')
  const [dialogItem, setDialogItem] = useState<GearItem | null | undefined>(
    undefined,
  )
  const [activeLoadoutId, setActiveLoadoutId] = useState('')
  const [mobileTab, setMobileTab] = useState<'vault' | 'loadout'>('vault')
  const [announcement, setAnnouncement] = useState('')
  const [undo, setUndo] = useState<{
    label: string
    restore: (inventory: PersistedInventory) => PersistedInventory
  } | null>(null)
  const addButtonRefs = useRef(new Map<string, HTMLButtonElement>())
  const dirty = useRef(false)

  useEffect(() => {
    let active = true
    storage
      .load()
      .then((stored) => {
        if (!active) return
        const next = stored ?? seedInventory
        setInventory(next)
        setActiveLoadoutId(next.loadouts[0]?.id ?? '')
        setSelectedId(next.gearItems[0]?.id ?? '')
        setSaveState('idle')
      })
      .catch(() => {
        if (!active) return
        setInventory(seedInventory)
        setActiveLoadoutId(seedInventory.loadouts[0]?.id ?? '')
        setSelectedId(seedInventory.gearItems[0]?.id ?? '')
        setSaveState('error')
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!inventory || !dirty.current) return
    setSaveState('saving')
    const timeout = window.setTimeout(() => {
      storage
        .save(inventory)
        .then(() => {
          dirty.current = false
          setSaveState('saved')
        })
        .catch(() => setSaveState('error'))
    }, 450)
    return () => window.clearTimeout(timeout)
  }, [inventory])

  const updateInventory = (
    update: (current: PersistedInventory) => PersistedInventory,
  ) => {
    dirty.current = true
    setInventory((current) => (current ? update(current) : current))
  }

  const handleExport = () => {
    if (!inventory) return
    const url = URL.createObjectURL(
      new Blob([serializeInventory(inventory)], { type: 'application/json' }),
    )
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'packdb-inventory.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async (file: File | undefined) => {
    if (!file || !inventory) return
    const incoming = deserializeInventory(await file.text())
    if (!incoming) {
      setImportReport(
        'Import rejected: the file is malformed or uses an unsupported schema.',
      )
      return
    }
    const result =
      importMode === 'merge'
        ? mergeInventory(inventory, incoming)
        : { inventory: incoming, rejected: [] }
    updateInventory(() => result.inventory)
    setSelectedId(result.inventory.gearItems[0]?.id ?? '')
    setImportReport(
      result.rejected.length
        ? `Imported with ${result.rejected.length} rejected record(s): ${result.rejected.join('; ')}`
        : `Import complete (${importMode}).`,
    )
  }

  if (!inventory)
    return (
      <div className="app-loading" role="status">
        Loading your pack…
      </div>
    )

  const { gearItems: items, categories, userSettings, loadouts } = inventory
  const activeLoadout = loadouts.find(({ id }) => id === activeLoadoutId) ??
    loadouts[0] ?? {
      id: 'default',
      name: 'New loadout',
      entries: [],
    }
  const categoryLabels = Object.fromEntries(
    categories.map((category) => [category.id, category.label]),
  )
  const itemsById = new Map(items.map((item) => [item.id, item]))
  const packedItemIds = new Set(
    activeLoadout.entries.map((entry) => entry.gearItemId),
  )
  const filteredItems = items
    .filter((item) => {
      const matchesQuery =
        `${item.name} ${item.brand} ${item.tags?.join(' ') ?? ''} ${categoryLabels[item.categoryId] ?? ''}`
          .toLowerCase()
          .includes(query.toLowerCase())
      return (
        matchesQuery &&
        (!filters.category || item.categoryId === filters.category) &&
        (!filters.tag || item.tags?.includes(filters.tag)) &&
        (!filters.status ||
          (filters.status === 'packed') === packedItemIds.has(item.id))
      )
    })
    .sort((a, b) =>
      sort === 'weight'
        ? a.weightGrams - b.weightGrams
        : sort === 'category'
          ? (categoryLabels[a.categoryId] ?? '').localeCompare(
              categoryLabels[b.categoryId] ?? '',
            )
          : sort === 'modified'
            ? (b.modifiedAt ?? '').localeCompare(a.modifiedAt ?? '')
            : a.name.localeCompare(b.name),
    )
  const selected = items.find((item) => item.id === selectedId) ?? items[0]
  const addToLoadout = (id: string) => {
    const item = itemsById.get(id)
    if (!item) return
    updateInventory((current) => ({
      ...current,
      loadouts: current.loadouts.map((loadout) =>
        loadout.id !== activeLoadout.id
          ? loadout
          : loadout.entries.some((entry) => entry.gearItemId === id)
            ? {
                ...loadout,
                entries: loadout.entries.map((entry) =>
                  entry.gearItemId === id
                    ? { ...entry, quantity: entry.quantity + 1 }
                    : entry,
                ),
              }
            : {
                ...loadout,
                entries: [
                  ...loadout.entries,
                  {
                    id: `${loadout.id}-${id}-${Date.now()}`,
                    gearItemId: id,
                    quantity: 1,
                    packed: true,
                    carryClassification: 'carried',
                  },
                ],
              },
      ),
    }))
    const duplicate = activeLoadout.entries.some(
      (entry) => entry.gearItemId === id,
    )
    setAnnouncement(
      duplicate
        ? `${item.name} quantity increased.`
        : `${item.name} added to ${activeLoadout.name}.`,
    )
    window.setTimeout(() => addButtonRefs.current.get(id)?.focus(), 0)
  }

  const updateEntry = (id: string, patch: Partial<LoadoutEntry>) => {
    updateInventory((current) => ({
      ...current,
      loadouts: current.loadouts.map((loadout) =>
        loadout.id === activeLoadout.id
          ? {
              ...loadout,
              entries: loadout.entries.map((entry) =>
                entry.id === id ? { ...entry, ...patch } : entry,
              ),
            }
          : loadout,
      ),
    }))
    setAnnouncement('Loadout entry updated.')
  }

  const removeEntry = (entryId: string) => {
    const entry = activeLoadout.entries.find(({ id }) => id === entryId)
    if (!entry) return
    const item = itemsById.get(entry.gearItemId)
    updateInventory((current) => ({
      ...current,
      loadouts: current.loadouts.map((loadout) =>
        loadout.id === activeLoadout.id
          ? {
              ...loadout,
              entries: loadout.entries.filter(({ id }) => id !== entryId),
            }
          : loadout,
      ),
    }))
    setUndo({
      label: `${item?.name ?? 'Item'} removed.`,
      restore: (current) => ({
        ...current,
        loadouts: current.loadouts.map((loadout) =>
          loadout.id === activeLoadout.id
            ? { ...loadout, entries: [...loadout.entries, entry] }
            : loadout,
        ),
      }),
    })
    setAnnouncement(
      `${item?.name ?? 'Item'} removed from ${activeLoadout.name}. Undo available.`,
    )
    window.setTimeout(
      () => addButtonRefs.current.get(entry.gearItemId)?.focus(),
      0,
    )
  }

  const createTrip = () => {
    const name = window.prompt('Name this trip', 'New backpacking trip')?.trim()
    if (!name) return
    const id = `trip-${Date.now()}`
    updateInventory((current) => ({
      ...current,
      loadouts: [...current.loadouts, { id, name, entries: [] }],
    }))
    setActiveLoadoutId(id)
    setAnnouncement(`${name} created.`)
  }
  const renameTrip = () => {
    const name = window.prompt('Rename trip', activeLoadout.name)?.trim()
    if (!name) return
    updateInventory((current) => ({
      ...current,
      loadouts: current.loadouts.map((trip) =>
        trip.id === activeLoadout.id ? { ...trip, name } : trip,
      ),
    }))
    setAnnouncement(`Trip renamed to ${name}.`)
  }
  const duplicateTrip = () => {
    const id = `trip-${Date.now()}`
    const copy = {
      ...activeLoadout,
      id,
      name: `${activeLoadout.name} copy`,
      entries: activeLoadout.entries.map((entry, index) => ({
        ...entry,
        id: `${id}-${entry.gearItemId}-${index}`,
      })),
    }
    updateInventory((current) => ({
      ...current,
      loadouts: [...current.loadouts, copy],
    }))
    setActiveLoadoutId(id)
    setAnnouncement(`${copy.name} created.`)
  }
  const deleteTrip = () => {
    if (
      loadouts.length < 2 ||
      !window.confirm(`Delete “${activeLoadout.name}”?`)
    )
      return
    const index = loadouts.findIndex(({ id }) => id === activeLoadout.id)
    const nextId = loadouts[index ? index - 1 : 1].id
    updateInventory((current) => ({
      ...current,
      loadouts: current.loadouts.filter(({ id }) => id !== activeLoadout.id),
    }))
    setActiveLoadoutId(nextId)
    setAnnouncement(`${activeLoadout.name} deleted.`)
  }
  const saveItem = (item: GearItem) => {
    updateInventory((current) => ({
      ...current,
      gearItems: current.gearItems.some(({ id }) => id === item.id)
        ? current.gearItems.map((existing) =>
            existing.id === item.id ? item : existing,
          )
        : [...current.gearItems, item],
    }))
    setSelectedId(item.id)
    setDialogItem(undefined)
  }
  const duplicateItem = (item: GearItem) => {
    const copy = {
      ...item,
      id: `gear-${Date.now()}`,
      name: `${item.name} copy`,
      modifiedAt: new Date().toISOString(),
    }
    updateInventory((current) => ({
      ...current,
      gearItems: [...current.gearItems, copy],
    }))
    setSelectedId(copy.id)
  }
  const deleteItem = (item: GearItem) => {
    const affected = loadouts.filter((loadout) =>
      loadout.entries.some((entry) => entry.gearItemId === item.id),
    ).length
    if (
      affected &&
      !window.confirm(
        `Delete “${item.name}”? It will also be removed from ${affected} loadout${affected === 1 ? '' : 's'}.`,
      )
    )
      return
    updateInventory((current) => ({
      ...current,
      gearItems: current.gearItems.filter(({ id }) => id !== item.id),
      loadouts: current.loadouts.map((loadout) => ({
        ...loadout,
        entries: loadout.entries.filter(
          (entry) => entry.gearItemId !== item.id,
        ),
      })),
    }))
    setSelectedId(items.find(({ id }) => id !== item.id)?.id ?? '')
  }

  return (
    <div id="top" className="app-shell">
      <header className="hud">
        <BrandMark />
        <nav aria-label="Primary navigation">
          <a className="active" href="#vault-title">
            Vault
          </a>
          <a href="#loadout-title">Loadouts</a>
        </nav>
        <div className="hud__right">
          <span
            className={`save-status save-status--${saveState}`}
            role="status"
          >
            {saveState === 'saving'
              ? 'Saving…'
              : saveState === 'error'
                ? 'Save error'
                : saveState === 'saved'
                  ? 'Saved'
                  : 'Local'}
          </span>
          <button className="hud-action" onClick={handleExport}>
            <Download size={15} /> Export
          </button>
          <label className="hud-action">
            <Upload size={15} /> Import
            <input
              className="sr-only"
              type="file"
              accept="application/json,.json"
              onChange={(event) => void handleImport(event.target.files?.[0])}
            />
          </label>
          <select
            aria-label="Import behavior"
            value={importMode}
            onChange={(event) =>
              setImportMode(event.target.value as 'merge' | 'overwrite')
            }
          >
            <option value="merge">Merge import</option>
            <option value="overwrite">Overwrite all</option>
          </select>
          <span className="weather">
            <CloudSun size={17} /> 54°F · Olympic NP
          </span>
          <button className="icon-button ghost" aria-label="Notifications">
            <Bell size={18} />
          </button>
          <button className="profile" aria-label="Open profile">
            <CircleUserRound size={22} />
            <span>Alex</span>
            <ChevronDown size={14} />
          </button>
        </div>
      </header>
      {importReport && (
        <div className="import-report" role="alert">
          {importReport}
          <button
            onClick={() => setImportReport('')}
            aria-label="Dismiss import report"
          >
            ×
          </button>
        </div>
      )}
      <div className="mobile-tabs" role="tablist" aria-label="Workspace view">
        <button
          role="tab"
          aria-selected={mobileTab === 'vault'}
          onClick={() => setMobileTab('vault')}
        >
          Vault
        </button>
        <button
          role="tab"
          aria-selected={mobileTab === 'loadout'}
          onClick={() => setMobileTab('loadout')}
        >
          Loadout
        </button>
      </div>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
      <main className="workspace">
        <div
          className={`workspace-region workspace-region--vault ${mobileTab !== 'vault' ? 'mobile-hidden' : ''}`}
        >
          <GearVault
            items={filteredItems}
            totalItems={items.length}
            selectedId={selectedId}
            query={query}
            onQueryChange={setQuery}
            onSelect={setSelectedId}
            onAddToLoadout={addToLoadout}
            registerAddButton={(id, element) => {
              if (element) addButtonRefs.current.set(id, element)
              else addButtonRefs.current.delete(id)
            }}
            onAdd={() => setDialogItem(null)}
            onEdit={setDialogItem}
            onDuplicate={duplicateItem}
            onDelete={deleteItem}
            packedItemIds={packedItemIds}
            categoryLabels={categoryLabels}
            categories={categories}
            displayWeightUnit={userSettings.displayWeightUnit}
            filters={filters}
            onFiltersChange={setFilters}
            sort={sort}
            onSortChange={setSort}
          />
        </div>
        <div
          className={`workspace-region workspace-region--loadout ${mobileTab !== 'loadout' ? 'mobile-hidden' : ''}`}
        >
          <ActiveLoadout
            itemsById={itemsById}
            loadouts={loadouts}
            activeLoadoutId={activeLoadout.id}
            capacity={userSettings.carryCapacityGrams}
            categoryLabels={categoryLabels}
            displayWeightUnit={userSettings.displayWeightUnit}
            undoLabel={undo?.label}
            onSwitch={(id) => {
              setActiveLoadoutId(id)
              setAnnouncement(
                `Switched to ${loadouts.find((trip) => trip.id === id)?.name}.`,
              )
            }}
            onCreate={createTrip}
            onRename={renameTrip}
            onDuplicate={duplicateTrip}
            onDelete={deleteTrip}
            onAddGear={() => {
              setMobileTab('vault')
              window.setTimeout(
                () =>
                  document
                    .querySelector<HTMLInputElement>('.search input')
                    ?.focus(),
                0,
              )
            }}
            onDropItem={addToLoadout}
            onUpdateEntry={updateEntry}
            onRemove={removeEntry}
            onUndo={() => {
              if (!undo) return
              updateInventory(undo.restore)
              setAnnouncement('Removal undone.')
              setUndo(null)
            }}
          />
        </div>
        {selected && (
          <ItemInspector
            item={selected}
            categoryLabel={
              categoryLabels[selected.categoryId] ?? 'Uncategorized'
            }
            displayWeightUnit={userSettings.displayWeightUnit}
            isInLoadout={packedItemIds.has(selected.id)}
          />
        )}
      </main>
      <ItemDialog
        open={dialogItem !== undefined}
        item={dialogItem ?? undefined}
        categories={categories}
        onClose={() => setDialogItem(undefined)}
        onSave={saveItem}
      />
      <footer>
        <span>Pack lighter. Go farther.</span>
        <span>PackDB / Field build 0.1</span>
      </footer>
    </div>
  )
}
