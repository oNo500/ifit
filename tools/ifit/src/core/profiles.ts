import { loadProfiles as loadProfilesFromMeta } from './contract'
import type { Profile, Profiles } from './contract'

export interface ProfileInfo {
  name: string
  description: string
  layers: string[]
  rules: string[]
}

/** 展开 profile：层序拼接 + 直引 rules，按首次出现去重；未知层名单独报出 */
export function expandProfileRules(
  file: Profiles,
  profile: Profile,
): { rules: string[]; unknownLayers: string[] } {
  const rules: string[] = []
  const seen = new Set<string>()
  const unknownLayers: string[] = []
  const push = (rule: string) => {
    if (!seen.has(rule)) {
      seen.add(rule)
      rules.push(rule)
    }
  }
  for (const layerName of profile.layers ?? []) {
    const layer = (file.layers ?? {})[layerName]
    if (layer === undefined) {
      unknownLayers.push(layerName)
      continue
    }
    layer.rules.forEach(push)
  }
  ;(profile.rules ?? []).forEach(push)
  return { rules, unknownLayers }
}

export function listProfiles(sourceRoot: string): ProfileInfo[] {
  const file = loadProfilesFromMeta(sourceRoot)
  return Object.entries(file.profiles)
    .map(([name, profile]) => ({
      name,
      description: profile.description ?? '',
      layers: profile.layers ?? [],
      rules: expandProfileRules(file, profile).rules,
    }))
    .toSorted((a, b) => a.name.localeCompare(b.name))
}
