import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { siteUrl, siteBase } from './deployment-config.mjs';

const frontend = fileURLToPath(new URL('../', import.meta.url));
const repo = path.resolve(frontend, '..');
const output = path.join(frontend, 'dist');
const dryRun = process.argv.includes('--dry-run');
const branch = 'frontend';
const marker = '.hostinger-build.json';
function git(args, env = {}) {
  const result = spawnSync('git', args, { cwd: repo, env: { ...process.env, ...env }, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`git ${args[0]} failed: ${result.stderr.trim()}`);
  return result.stdout.trim();
}
assert.equal(siteBase, '/', 'Hostinger public_html requires a domain-root build.');
assert.equal(git(['branch', '--show-current']), 'main', 'Publish from the source main branch.');
await fs.access(path.join(output, 'index.html'));
await fs.access(path.join(output, '.htaccess'));
const home = await fs.readFile(path.join(output, 'index.html'), 'utf8');
assert.match(home, /<h1[\s>]/);
assert.ok(home.includes(`href="${siteUrl}/"`), 'Wrong canonical URL: rebuild for the Hostinger domain.');

let parent;
if (!dryRun) {
  const remote = git(['ls-remote', '--heads', 'origin', `refs/heads/${branch}`]);
  if (remote) {
    git(['fetch', '--no-tags', 'origin', `refs/heads/${branch}`]);
    parent = git(['rev-parse', 'FETCH_HEAD']);
    // Never overwrite a manually maintained branch with generated files.
    const previous = JSON.parse(git(['show', `${parent}:${marker}`]));
    assert.equal(previous.publisher, 'hostinger-static-v1', 'The frontend branch is not managed by this publisher.');
  }
}
const sha = git(['rev-parse', 'HEAD']);
await fs.writeFile(path.join(output, marker), JSON.stringify({ publisher: 'hostinger-static-v1', sourceCommit: sha, siteUrl }, null, 2) + '\n');
const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'hostinger-index-'));
const index = path.join(temporary, 'index');
try {
  const env = { GIT_INDEX_FILE: index };
  git([`--work-tree=${output}`, 'add', '--force', '--all', '--', '.'], env);
  const tree = git(['write-tree'], env);
  const files = git(['ls-tree', '-r', '--name-only', tree]).split('\n');
  for (const file of files) assert.ok(!/(^|\/)(?:Backend|Frontend|src|node_modules|\.git|\.env(?:\..*)?)($|\/)/i.test(file), `Unexpected source/private file: ${file}`);
  assert.ok(files.includes('index.html') && files.includes('about/index.html') && files.includes('.htaccess'));
  console.log(`Verified publish tree: ${files.length} generated files at the branch root.`);
  if (dryRun) console.log('Dry run passed; no branch was changed or pushed.');
  else {
    const identity = { GIT_AUTHOR_NAME: 'github-actions[bot]', GIT_AUTHOR_EMAIL: '41898282+github-actions[bot]@users.noreply.github.com', GIT_COMMITTER_NAME: 'github-actions[bot]', GIT_COMMITTER_EMAIL: '41898282+github-actions[bot]@users.noreply.github.com' };
    const commit = git(['commit-tree', tree, ...(parent ? ['-p', parent] : []), '-m', `Build frontend from ${sha}`], identity);
    // Normal fast-forward push: never force-replace branch history.
    git(['push', 'origin', `${commit}:refs/heads/${branch}`]);
    console.log(`Published ${commit} to ${branch}. Connect/redeploy this branch in Hostinger.`);
  }
} finally {
  for (const file of [index, index + '.lock']) await fs.rm(file, { force: true });
  await fs.rmdir(temporary);
}
