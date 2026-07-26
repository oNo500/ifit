import { describe, expect, test } from 'bun:test'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { installCommandFor, listSkills, loadSkillsLedger } from '../src/core/skills'
import type { SkillEntry } from '../src/core/skills'

/**
 * A skills-bearing source fixture: skills.json is handwritten (it is generated
 * by iforge publish, not by this repo) alongside the skill directories that
 * custom/mirror entries own. official entries deliberately get no directory --
 * they live upstream and are the case that most needs an install hint.
 */
function fixtureSource(): string {
  const dir = mkdtempSync(join(tmpdir(), 'ifit-skills-src-'))
  const ledger: SkillEntry[] = [
    { name: 'commit-lite', source: 'custom' },
    {
      name: 'drawio',
      source: 'mirror',
      repo: 'jgraph/drawio-mcp',
      path: 'plugins/claude-code/skills/drawio',
      commit: 'abc123',
    },
    { name: 'find-skills', source: 'official', repo: 'vercel-labs/skills' },
  ]
  writeFileSync(join(dir, 'skills.json'), `${JSON.stringify(ledger, null, 2)}\n`)

  mkdirSync(join(dir, 'skills', 'commit-lite'), { recursive: true })
  writeFileSync(
    join(dir, 'skills', 'commit-lite', 'SKILL.md'),
    '---\nname: commit-lite\ndescription: Generates Conventional Commits messages.\n---\n\n# Commit Lite\n',
  )

  mkdirSync(join(dir, 'skills', 'drawio'), { recursive: true })
  writeFileSync(
    join(dir, 'skills', 'drawio', 'SKILL.md'),
    '---\nname: drawio\ndescription: >-\n  Use when the user asks to draw a diagram\n  or mentions drawio.\n---\n\n# Drawio\n',
  )

  return dir
}

describe('loadSkillsLedger', () => {
  test('returns null when the source has no skills.json', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ifit-skills-empty-'))
    try {
      expect(loadSkillsLedger(dir)).toBeNull()
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  test('parses the published ledger array', () => {
    const dir = fixtureSource()
    try {
      const ledger = loadSkillsLedger(dir)
      expect(ledger?.map((e) => e.name)).toEqual(['commit-lite', 'drawio', 'find-skills'])
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

describe('installCommandFor', () => {
  // The three forms are fixed by SKILLS.md: repo-held skills install from the
  // ifit repo by name, official ones install straight from upstream.
  test('custom installs from the ifit repo by name', () => {
    expect(installCommandFor({ name: 'commit-lite', source: 'custom' })).toBe(
      'pnpx skills add oNo500/ifit -s commit-lite',
    )
  })

  test('mirror installs from the ifit repo by name, not from upstream', () => {
    const entry: SkillEntry = { name: 'drawio', source: 'mirror', repo: 'jgraph/drawio-mcp' }
    expect(installCommandFor(entry)).toBe('pnpx skills add oNo500/ifit -s drawio')
  })

  test('official installs straight from its upstream repo', () => {
    const entry: SkillEntry = { name: 'find-skills', source: 'official', repo: 'vercel-labs/skills' }
    expect(installCommandFor(entry)).toBe('pnpx skills add vercel-labs/skills -s find-skills')
  })

  // `install` carries a hand-written provenance note per SKILLS.md; when present
  // it is the authoritative answer and must win over the derived form.
  test('an explicit install field overrides the derived command', () => {
    const entry: SkillEntry = { name: 'odd', source: 'official', repo: 'x/y', install: 'brew install odd' }
    expect(installCommandFor(entry)).toBe('brew install odd')
  })

  // An official entry is nothing but a repo pointer, so a missing repo leaves
  // no way to name an install target -- surface that instead of emitting a
  // command with a hole in it.
  test('official without a repo yields no command', () => {
    expect(installCommandFor({ name: 'broken', source: 'official' })).toBeNull()
  })
})

describe('listSkills', () => {
  test('reads descriptions from SKILL.md frontmatter and pairs each with an install command', () => {
    const dir = fixtureSource()
    try {
      const rows = listSkills(dir)
      expect(rows.map((r) => r.name)).toEqual(['commit-lite', 'drawio', 'find-skills'])

      const commitLite = rows[0]
      expect(commitLite?.description).toBe('Generates Conventional Commits messages.')
      expect(commitLite?.install).toBe('pnpx skills add oNo500/ifit -s commit-lite')
      expect(commitLite?.present).toBe(true)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  test('folds a YAML block-scalar description into one line', () => {
    const dir = fixtureSource()
    try {
      const drawio = listSkills(dir).find((r) => r.name === 'drawio')
      expect(drawio?.description).toBe('Use when the user asks to draw a diagram or mentions drawio.')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  // official skills live upstream, so the source repo holds no directory to
  // read a description from -- the row still has to appear, since it is
  // precisely the row a user needs an install command for.
  test('lists official skills with no local directory', () => {
    const dir = fixtureSource()
    try {
      const official = listSkills(dir).find((r) => r.name === 'find-skills')
      expect(official?.present).toBe(false)
      expect(official?.description).toBe('')
      expect(official?.install).toBe('pnpx skills add vercel-labs/skills -s find-skills')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  test('filters by case-insensitive substring across name and description', () => {
    const dir = fixtureSource()
    try {
      expect(listSkills(dir, { grep: 'CONVENTIONAL' }).map((r) => r.name)).toEqual(['commit-lite'])
      expect(listSkills(dir, { grep: 'draw' }).map((r) => r.name)).toEqual(['drawio'])
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  test('returns an empty list when the source has no ledger', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ifit-skills-none-'))
    try {
      expect(listSkills(dir)).toEqual([])
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
