export function normalizeChannelName(name: string): string {
  let normalized = name.toLowerCase()
  
  // Ensure it starts with #
  if (!normalized.startsWith('#')) {
    normalized = '#' + normalized
  }
  
  // Replace spaces with dashes only if there's a character before the space
  // This prevents "# " from becoming "#-"
  normalized = normalized.replace(/(\S)\s+/g, '$1-')
  
  return normalized
}

export function dateStartMs(dateValue: string): number {
  return new Date(`${dateValue}T00:00:00`).getTime()
}

export function dateEndMs(dateValue: string): number {
  return new Date(`${dateValue}T23:59:59.999`).getTime()
}

export function formatError(error: unknown): string {
  if (typeof error === 'string') {
    return error
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Unexpected error'
}
