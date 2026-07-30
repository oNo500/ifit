import { join } from 'node:path'
import { loadCatalog, loadProfiles } from './contract'
import type { Catalog, CatalogRule, Profiles } from './contract'
import { expandProfileRules } from './profiles'
import { readTextIfExists, sha256 } from './io'
import type { IfitContext } from './init'
import { computeDrift, loadDownstreamLock, localHashFor } from './manifest'
import type { DownstreamLock, DriftState } from './manifest'
import { listSkills } from './skills'
import type { SkillRow } from './skills'
import { resolveSource } from './source'
import { detectSourceRoot } from './source-root'

export type InstallState = DriftState | 'uninstalled' | 'broken'

export interface ListRow {
  name: string
  description: string
  preference: boolean
  state?: InstallState // 未初始化目标无 state；broken=catalog 指向的产物缺失
}

export interface ListResult {
  ok: boolean
  message?: string
  rows: ListRow[]
  skills?: SkillRow[] // 仅在请求 skill 时出现；rule 与 skill 两本账互不相干
  exitCode: number
}

/**
 * Single source of truth for a rule's install-state annotation, shared by
 * `list` (every catalog row) and `show` (one row). broken (source-side
 * artifact missing) takes priority regardless of lock presence; otherwise
 * an uninitialized target (lock === null) yields undefined -- no state to report.
 */
export function installStateFor(opts: {
  name: string
  target: string
  sourceContent: string | null
  lock: DownstreamLock | null
  profiles: Profiles
}): InstallState | undefined {
  const { name, target, sourceContent, lock, profiles } = opts
  const artifactPresent = sourceContent !== null

  if (lock === null) return artifactPresent ? undefined : 'broken'
  if (!artifactPresent) return 'broken'

  if (Object.hasOwn(lock.rules, name)) {
    const localHash = localHashFor(target, name)
    const baselineHash = lock.rules[name]
    const sourceHash = sha256(sourceContent)
    return baselineHash === undefined ? 'missing' : computeDrift(localHash, baselineHash, sourceHash)
  }
  if ((lock.excluded ?? []).includes(name)) return 'excluded'
  const seedProfile = lock.profile === '-' ? undefined : profiles.profiles[lock.profile]
  if (seedProfile !== undefined && expandProfileRules(profiles, seedProfile).rules.includes(name)) {
    return 'available'
  }
  return 'uninstalled'
}

// 大小写不敏感：name/description/正文统一 toLowerCase 后子串匹配（调用方传入已 toLowerCase 的 grep）
function matchesGrep(name: string, rule: CatalogRule, content: string | null, grepLower: string): boolean {
  if (name.toLowerCase().includes(grepLower) || rule.description.toLowerCase().includes(grepLower)) return true
  return content !== null && content.toLowerCase().includes(grepLower)
}

/**
 * Shared grep filter + row-building loop for list -- install state is
 * computed via a caller-supplied callback.
 */
function buildFilteredRows(opts: {
  artifactBase: string
  catalogRules: Catalog['rules']
  grepLower?: string
  computeState: (name: string, rule: CatalogRule, sourceContent: string | null) => ListRow['state']
}): ListRow[] {
  const { artifactBase, catalogRules, grepLower, computeState } = opts
  const rows: ListRow[] = []
  for (const [name, rule] of Object.entries(catalogRules).toSorted(([a], [b]) => a.localeCompare(b))) {

    const sourceContent = readTextIfExists(join(artifactBase, rule.path))
    if (grepLower !== undefined && !matchesGrep(name, rule, sourceContent, grepLower)) continue

    const state = computeState(name, rule, sourceContent)
    rows.push({ name, description: rule.description, preference: rule.preference, state })
  }
  return rows
}

export async function listReport(
  ctx: IfitContext,
  opts: { source?: string; target: string; grep?: string; kind?: 'rules' | 'skills' | 'all' },
): Promise<ListResult> {
  let source: Awaited<ReturnType<typeof resolveSource>>
  try {
    source = await resolveSource({
      explicit: opts.source,
      envRoot: ctx.env.IFIT_ROOT,
      homeDefault: join(ctx.home, 'code/infra-agent/ifit'),
      cacheDir: ctx.cacheDir,
      download: ctx.download,
      run: ctx.run,
    })
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : String(error), rows: [], exitCode: 1 }
  }

  const { catalogRoot, artifactBase } = detectSourceRoot(source.root)
  const kind = opts.kind ?? 'rules'

  // skills are ledger-driven and independent of catalog.json, so a skills-only
  // listing must not be blocked by the catalog-missing error below.
  if (kind === 'skills') {
    const skills = listSkills(source.root, { grep: opts.grep, artifactBase })
    return { ok: true, rows: [], skills, exitCode: 0 }
  }

  const catalog = loadCatalog(catalogRoot)
  if (catalog === null) {
    return {
      ok: false,
      message: `${source.root}: catalog.json missing, run 'iforge catalog' in the source`,
      rows: [],
      exitCode: 1,
    }
  }

  const grepLower = opts.grep?.toLowerCase()

  const lock = loadDownstreamLock(opts.target)
  const profiles = loadProfiles(source.root)

  const rows = buildFilteredRows({
    artifactBase,
    catalogRules: catalog.rules,
    grepLower,
    computeState: (name, _rule, sourceContent) => installStateFor({ name, target: opts.target, sourceContent, lock, profiles }),
  })

  if (kind === 'all') {
    return { ok: true, rows, skills: listSkills(source.root, { grep: opts.grep, artifactBase }), exitCode: 0 }
  }
  return { ok: true, rows, exitCode: 0 }
}
