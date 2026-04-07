import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const packageJson = JSON.parse(await readFile(path.join(repoRoot, 'package.json'), 'utf8'));
const currentVersion = packageJson.version;
const versions = Array.from(
  new Set(
    (process.env.DOCS_VERSIONS ?? currentVersion)
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
      .concat(currentVersion)
  )
).sort(compareVersionsDesc);

const repoName = process.env.DOCS_REPO_NAME ?? 'fuggetlenfe-angular-wrapper';
const basePath = process.env.DOCS_BASE_PATH ?? `/${repoName}`;
const docsDir = path.join(repoRoot, 'docs');
const siteDir = path.join(repoRoot, 'site');

await rm(siteDir, { recursive: true, force: true });
await mkdir(siteDir, { recursive: true });
await writeFile(path.join(siteDir, 'index.html'), `<meta http-equiv="refresh" content="0; url=${basePath}/latest/" />\n`);

for (const version of versions) {
  const targetDir = version === currentVersion ? path.join(siteDir, 'latest') : path.join(siteDir, `v${version}`);
  await cp(docsDir, targetDir, { recursive: true });
  await injectVersionShell(path.join(targetDir, 'index.html'), { basePath, currentVersion, selectedVersion: version, versions });

  if (version === currentVersion) {
    const versionedDir = path.join(siteDir, `v${version}`);
    await cp(docsDir, versionedDir, { recursive: true });
    await injectVersionShell(path.join(versionedDir, 'index.html'), { basePath, currentVersion, selectedVersion: version, versions });
  }
}

console.log(`Built docs site into ${siteDir}`);

async function injectVersionShell(filePath, { basePath, currentVersion, selectedVersion, versions }) {
  const source = await readFile(filePath, 'utf8');
  const options = versions
    .map((version) => {
      const value = version === currentVersion ? `${basePath}/latest/` : `${basePath}/v${version}/`;
      const selected = version === selectedVersion ? ' selected' : '';
      return `<option value="${value}"${selected}>v${version}</option>`;
    })
    .join('');

  const overlay = `
<style>
  .docs-release-shell {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 9999;
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.6rem 0.8rem;
    border: 1px solid rgba(36, 25, 19, 0.16);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 14px 32px rgba(36, 25, 19, 0.12);
    backdrop-filter: blur(12px);
    font-family: "IBM Plex Sans", "Segoe UI", Arial, sans-serif;
  }
  .docs-release-shell__badge {
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #9b4210;
  }
  .docs-release-shell__select {
    border: 1px solid rgba(36, 25, 19, 0.14);
    border-radius: 999px;
    background: white;
    padding: 0.35rem 0.65rem;
    font: inherit;
  }
</style>
<div class="docs-release-shell" aria-label="Documentation release selector">
  <span class="docs-release-shell__badge">Latest v${currentVersion}</span>
  <select class="docs-release-shell__select" onchange="if (this.value) window.location.href=this.value;">
    ${options}
  </select>
</div>`;

  await writeFile(filePath, source.replace('</body>', `${overlay}\n</body>`));
}

function compareVersionsDesc(left, right) {
  const leftParts = left.split('.').map(Number);
  const rightParts = right.split('.').map(Number);

  for (let index = 0; index < Math.max(leftParts.length, rightParts.length); index += 1) {
    const diff = (rightParts[index] ?? 0) - (leftParts[index] ?? 0);
    if (diff !== 0) {
      return diff;
    }
  }

  return 0;
}
