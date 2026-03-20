interface MessageFiltersProps {
  searchText: string
  fromDate: string
  toDate: string
  onSearchChange: (value: string) => void
  onFromDateChange: (value: string) => void
  onToDateChange: (value: string) => void
  onApply: () => void
  onSearchKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void
}

export default function MessageFilters({
  searchText,
  fromDate,
  toDate,
  onSearchChange,
  onFromDateChange,
  onToDateChange,
  onApply,
  onSearchKeyDown,
}: MessageFiltersProps) {
  return (
    <div className="grid w-full grid-cols-1 gap-2 sm:w-auto sm:grid-cols-[minmax(180px,1fr)_auto_auto_auto]">
      <input
        type="search"
        value={searchText}
        onChange={(event) => onSearchChange(event.target.value)}
        onKeyDown={onSearchKeyDown}
        placeholder="search"
        className="rounded-md border border-overlay bg-surface px-3 py-2 text-sm placeholder:text-muted focus:border-rose focus:outline-none"
      />
      <input
        type="date"
        value={fromDate}
        onChange={(event) => onFromDateChange(event.target.value)}
        className="rounded-md border border-overlay bg-surface px-3 py-2 text-sm focus:border-rose focus:outline-none [color-scheme:var(--theme-color-scheme)]"
      />
      <input
        type="date"
        value={toDate}
        onChange={(event) => onToDateChange(event.target.value)}
        className="rounded-md border border-overlay bg-surface px-3 py-2 text-sm focus:border-rose focus:outline-none [color-scheme:var(--theme-color-scheme)]"
      />
      <button
        type="button"
        className="rounded-md border border-rose/70 bg-overlay px-3 py-2 text-sm font-semibold tracking-wide transition hover:bg-highlight-med"
        onClick={onApply}
      >
        apply
      </button>
    </div>
  )
}
