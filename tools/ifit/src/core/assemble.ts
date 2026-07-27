import { join } from 'node:path'
import { loadCatalog, loadProfiles } from './contract'
import type { CatalogRule } from './contract'
import { expandProfileRules } from './profiles'
import { readTextIfExists, sha256 } from './io'
import { ruleTargetRelPath } from './manifest'
import { detectSourceRoot } from './source-root'

export interface AssemblyItem {
  rule: string
  sourcePath: string
  targetRelPath: string
  content: string
  hash: string
}

function requireCatalogRules(sourceRoot: string): Record<string, CatalogRule> {
  const { catalogRoot } = detectSourceRoot(sourceRoot)
  const catalog = loadCatalog(catalogRoot)
  if (catalog === null) {
    throw new Error(`${sourceRoot}: catalog.json missing, run 'iforge catalog' in the source`)
  }
  return catalog.rules
}

export function assembleRules(
  sourceRoot: string,
  rules: string[],
): { items: AssemblyItem[]; missing: string[]; violations: string[] } {
  const catalogRules = requireCatalogRules(sourceRoot)
  const { artifactBase } = detectSourceRoot(sourceRoot)
  const items: AssemblyItem[] = []
  const missing: string[] = []
  const violations: string[] = []
  for (const rule of [...rules].toSorted()) {
    const entry = catalogRules[rule]
    if (entry === undefined) {
      missing.push(rule)
      continue
    }
    const sourcePath = join(artifactBase, entry.path)
    const content = readTextIfExists(sourcePath)
    if (content === null) {
      violations.push(`${rule}: built artifact missing at ${entry.path} (run iforge build in the source)`)
      continue
    }
    items.push({ rule, sourcePath, targetRelPath: ruleTargetRelPath(rule), content, hash: sha256(content) })
  }
  return { items, missing, violations }
}

/**
 * Catalog-driven composition check, scoped to a single profile -- a
 * downstream consumer only cares whether the one profile it is about to
 * install is internally consistent, not whether every other profile in
 * profiles.json is well-formed (that is iforge's / the source's job).
 */
function validateProfileComposition(
  profileName: string,
  expandedRules: string[],
  catalogRules: Record<string, CatalogRule>,
): string[] {
  const violations: string[] = []
  for (const member of expandedRules) {
    const entry = catalogRules[member]
    if (entry === undefined) {
      violations.push(`profile ${profileName}: unknown rule '${member}'`)
      continue
    }
    for (const dep of entry.requires) {
      if (!expandedRules.includes(dep)) {
        violations.push(`profile ${profileName}: '${member}' requires '${dep}' which is not in the profile`)
      }
    }
  }
  if (!expandedRules.includes('constitution')) {
    violations.push(`profile ${profileName}: missing constitution`)
  }
  return violations
}

export function planAssembly(
  sourceRoot: string,
  profileName: string,
): { items: AssemblyItem[]; violations: string[] } {
  const file = loadProfiles(sourceRoot)
  const profile = file.profiles[profileName]
  if (profile === undefined) {
    throw new Error(
      `unknown profile '${profileName}' (available: ${Object.keys(file.profiles).toSorted().join(', ')})`,
    )
  }
  const { rules: expandedRules, unknownLayers } = expandProfileRules(file, profile)
  const catalogRules = requireCatalogRules(sourceRoot)
  const compositionViolations = [
    ...unknownLayers.map((layer) => `profile ${profileName}: unknown layer '${layer}'`),
    ...validateProfileComposition(profileName, expandedRules, catalogRules),
  ]
  const { items, violations: assemblyViolations } = assembleRules(sourceRoot, expandedRules)
  return { items, violations: [...compositionViolations, ...assemblyViolations] }
}
