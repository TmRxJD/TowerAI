import type { TowerAiActionRequest } from './contracts'

export type TowerAiPolicyViolation = {
  kind: 'admin-only'
  request: TowerAiActionRequest
  reason: string
}

export type TowerAiDestructiveStep = {
  request: TowerAiActionRequest
  reason: string
}

function normalizeText(value: unknown): string {
  return String(value ?? '').trim().toLowerCase()
}

function hasKeyword(value: string, keywords: string[]): boolean {
  return keywords.some(keyword => value.includes(keyword))
}

export function isTowerAiAdminOnlyRequest(request: TowerAiActionRequest): TowerAiPolicyViolation | null {
  const action = normalizeText(request.action)
  if (!action) return null

  if (action === 'site.navigate') {
    const route = normalizeText(request.args['route'])
    if (route.startsWith('/admin')) {
      return {
        kind: 'admin-only',
        request,
        reason: `Navigation to admin route is blocked: ${route}`,
      }
    }
  }

  if (action === 'store.read' || action === 'store.write') {
    const store = normalizeText(request.args['store'])
    const path = normalizeText(request.args['path'])
    if (store.includes('admin') || path.includes('admin')) {
      return {
        kind: 'admin-only',
        request,
        reason: `Admin store access is blocked (${store}${path ? `.${path}` : ''})`,
      }
    }
  }

  if (action === 'idb.read' || action === 'idb.write') {
    const collection = normalizeText(request.args['collection'])
    if (collection === 'admin' || collection.includes('admin')) {
      return {
        kind: 'admin-only',
        request,
        reason: `Admin collection access is blocked: ${collection}`,
      }
    }
  }

  if (action === 'ui.catalog' || action === 'ui.query' || action === 'ui.input' || action === 'ui.click') {
    const selector = normalizeText(request.args['selector'])
    const rootSelector = normalizeText(request.args['rootSelector'])
    if (selector.includes('admin') || rootSelector.includes('admin')) {
      return {
        kind: 'admin-only',
        request,
        reason: `Admin UI selector access is blocked: ${selector || rootSelector}`,
      }
    }
  }

  return null
}

export function getTowerAiDestructiveStepReason(request: TowerAiActionRequest): string | null {
  const action = normalizeText(request.action)
  const argsText = JSON.stringify(request.args || {}).toLowerCase()

  if (action === 'store.write') {
    const path = normalizeText(request.args['path'])
    const destructivePath = hasKeyword(path, ['delete', 'remove', 'clear', 'reset', 'purge', 'wipe', 'overwrite'])
    const cloudTogglePath = hasKeyword(path, ['autosavetocloud', 'autoloadfromcloud'])
    const trackerAddPath = hasKeyword(path, ['laborder', 'trackedlabs', 'records', 'runs', 'add', 'create', 'insert', 'push'])
    if (destructivePath) return `Destructive store mutation on ${path}`
    if (cloudTogglePath) return `Cloud save/load toggle on ${path}`
    if (trackerAddPath) return `Tracker collection mutation on ${path}`
  }

  if (action === 'idb.write') {
    const collection = normalizeText(request.args['collection'])
    const id = normalizeText(request.args['id'])
    if (hasKeyword(collection, ['runs', 'labs', 'tracker', 'relics', 'vault', 'cards', 'lifetime'])) {
      if (hasKeyword(argsText, ['add', 'create', 'insert', 'new'])) {
        return `Potential tracker record creation (${collection}/${id})`
      }
    }
    if (hasKeyword(argsText, ['delete', 'remove', 'clear', 'reset', 'purge', 'wipe', 'overwrite'])) {
      return `Potentially destructive IndexedDB write (${collection}/${id})`
    }
  }

  if (action === 'calc.run') {
    const operation = normalizeText(request.args['operation'])
    if (hasKeyword(operation, ['delete', 'remove', 'clear', 'reset', 'purge', 'wipe', 'overwrite', 'create', 'add'])) {
      return `Potentially destructive calculator operation: ${operation}`
    }
  }

  if (action === 'ui.input' || action === 'ui.click') {
    const selector = normalizeText(request.args['selector'])
    const combined = `${selector} ${argsText}`

    if (hasKeyword(combined, ['delete', 'remove', 'reset', 'clear', 'wipe', 'purge', 'overwrite'])) {
      return `Potentially destructive UI mutation (${selector || 'unknown-selector'})`
    }

    if (hasKeyword(combined, ['autosavetocloud', 'autoloadfromcloud', 'cloud sync', 'cloud-save', 'cloudsave'])) {
      return `Cloud save/load toggle through UI (${selector || 'unknown-selector'})`
    }

    if (hasKeyword(combined, ['add run', 'new run', 'create run', 'add lab', 'new lab', 'add record', 'create record'])) {
      return `Potential tracker record creation via UI (${selector || 'unknown-selector'})`
    }
  }

  return null
}

export function collectTowerAiDestructiveSteps(steps: TowerAiActionRequest[]): TowerAiDestructiveStep[] {
  const out: TowerAiDestructiveStep[] = []
  for (const request of steps) {
    const reason = getTowerAiDestructiveStepReason(request)
    if (!reason) continue
    out.push({ request, reason })
  }
  return out
}

export function summarizeTowerAiRequest(request: TowerAiActionRequest): string {
  const action = String(request.action || '').trim()
  if (action === 'site.navigate') {
    const route = String(request.args['route'] || '').trim()
    return `${action}(${route || 'unknown-route'})`
  }

  if (action === 'store.write' || action === 'store.read') {
    const store = String(request.args['store'] || '').trim()
    const path = String(request.args['path'] || '').trim()
    return `${action}(${store}${path ? `.${path}` : ''})`
  }

  if (action === 'idb.write' || action === 'idb.read') {
    const collection = String(request.args['collection'] || '').trim()
    const id = String(request.args['id'] || '').trim()
    return `${action}(${collection}/${id})`
  }

  if (action === 'calc.run') {
    const calculatorId = String(request.args['calculatorId'] || '').trim()
    const operation = String(request.args['operation'] || '').trim()
    return `${action}(${calculatorId}/${operation})`
  }

  if (action === 'ui.catalog' || action === 'ui.query' || action === 'ui.input' || action === 'ui.click') {
    const selector = String(request.args['selector'] || '').trim()
    const rootSelector = String(request.args['rootSelector'] || '').trim()
    return `${action}(${selector || rootSelector || 'unknown-selector'})`
  }

  return action || 'unknown-action'
}

export function isTowerAiConfirmationMessage(input: string): boolean {
  const normalized = normalizeText(input)
  if (!normalized) return false
  return /^(confirm|yes|y|proceed|do it|go ahead|approve)$/i.test(normalized)
}

export function isTowerAiCancelMessage(input: string): boolean {
  const normalized = normalizeText(input)
  if (!normalized) return false
  return /^(cancel|no|n|stop|never mind|dont|don't)$/i.test(normalized)
}
