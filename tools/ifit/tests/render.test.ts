import { describe, expect, test } from 'bun:test'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { upstreamUrl } from '../src/cli/index'
import { fitToWidth, renderFooter } from '../src/cli/render'

describe('fitToWidth', () => {
  test('leaves a string that already fits untouched', () => {
    expect(fitToWidth('short', 20)).toBe('short')
  })

  test('truncates with an ellipsis so the result never exceeds the budget', () => {
    const out = fitToWidth('abcdefghij', 6)
    expect(out).toBe('abcde…')
    expect(out.length).toBeLessThanOrEqual(6)
  })

  // CJK glyphs occupy two terminal columns, so a naive length check would let a
  // Chinese description overflow the line it was measured against.
  test('measures CJK characters as two columns', () => {
    expect(fitToWidth('中文描述文本', 6)).toBe('中文…')
  })

  test('returns the input when the budget cannot fit even an ellipsis', () => {
    expect(fitToWidth('abc', 0)).toBe('abc')
  })
})

describe('renderFooter', () => {
  test('renders a stats line and one line per follow-up command', () => {
    const out = renderFooter({
      stats: '16 rules · 10 skills',
      commands: [
        { command: 'ifit show <name>', hint: '看单条 rule 详情' },
        { command: 'ifit cat <name>', hint: '取产物原文' },
      ],
    })
    expect(out).toContain('16 rules · 10 skills')
    expect(out).toContain('ifit show <name>')
    expect(out).toContain('ifit cat <name>')
  })

  // Hints line up in a column regardless of command length, so a long command
  // (ifit init --profile ...) does not shove its neighbour's hint out of line.
  test('aligns hints into a column across uneven command lengths', () => {
    const out = renderFooter({
      commands: [
        { command: 'ifit list', hint: 'A' },
        { command: 'ifit init --profile <p> <dir>', hint: 'B' },
      ],
    })
    const [first, second] = out.split('\n').filter((l) => l.includes('ifit'))
    expect(first?.indexOf('A')).toBe(second?.indexOf('B') ?? -1)
  })

  test('omits the stats line when there are no stats to report', () => {
    const out = renderFooter({ commands: ['ifit list'] })
    expect(out).not.toContain('·')
    expect(out).toContain('ifit list')
  })

  // The footer is an affordance, not content -- an empty command list must not
  // emit a bare separator with nothing under it.
  test('renders nothing when there are no commands', () => {
    expect(renderFooter({ commands: [] })).toBe('')
  })
})

describe('upstreamUrl', () => {
  test('prefers refUrl, the ledger authoritative doc page', () => {
    expect(upstreamUrl({ refUrl: 'https://ai-sdk.dev/docs', repo: 'vercel/ai' })).toBe('https://ai-sdk.dev/docs')
  })

  test('falls back to the repo as a fetchable GitHub URL', () => {
    expect(upstreamUrl({ repo: 'shadcn-ui/ui' })).toBe('https://github.com/shadcn-ui/ui')
  })

  // custom skills are published from this repo, so there is no upstream to
  // point a reader at -- the listing must omit the URL line rather than
  // inventing one.
  test('yields nothing when the entry names no origin at all', () => {
    expect(upstreamUrl({})).toBeUndefined()
  })
})

describe('cat stdout purity', () => {
  // `ifit cat x > x.md` must produce the artifact byte-for-byte, so the footer
  // has to go to stderr. A regression here silently corrupts every redirect.
  test('cat writes only the artifact to stdout, footer to stderr', async () => {
    const source = mkdtempSync(join(tmpdir(), 'ifit-cat-src-'))
    mkdirSync(join(source, 'rules'), { recursive: true })
    const body = '# Alpha\n\nbody line\n'
    writeFileSync(join(source, 'rules', 'alpha.md'), body)
    writeFileSync(
      join(source, 'catalog.json'),
      JSON.stringify({
        generatedAt: '2026-07-18T00:00:00Z',
        tags: {},
        rules: { alpha: { description: 'a', tags: [], requires: [], path: 'rules/alpha.md', profiles: [] } },
      }),
    )
    writeFileSync(join(source, 'profiles.json'), JSON.stringify({}))

    const proc = Bun.spawn(['bun', 'run', join(import.meta.dir, '..', 'src', 'index.ts'), 'cat', '--source', source, 'alpha'], {
      cwd: join(import.meta.dir, '..'),
      stdout: 'pipe',
      stderr: 'pipe',
    })
    const [stdout, stderr] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text()])
    await proc.exited

    expect(stdout).toBe(body)
    expect(stderr).toContain('ifit show alpha')
  })
})
