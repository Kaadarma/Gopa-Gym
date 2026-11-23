import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const run = (args) => execFileSync('git', args, { encoding: 'utf8' });

const files = run(['ls-files']).trim().split('\n').filter(Boolean);
const trackedEnv = files.filter((f) => /(^|\/)\.env/.test(f) && !/\.example$/.test(f));

const assignRe = /(password|passwd|pwd|secret|token|api[_-]?key|access[_-]?key|smtp[_-]?pass|private[_-]?key)[a-z0-9_]*\s*[:=]\s*(?:['"`]([^'"`]{4,})['"`]|([^\s,;)}\]"'`]{4,}))/i;
const placeholderRe = /^(?:change[-_ ]?me|your[-_ ]?|x{3,}|placeholder|demo|example|test|dummy|none|null|undefined|todo|local[-_ ]?dev|not[-_ ]?a[-_ ]?secret|\$\{|\{\{|<|process\.env|env\.|import\.meta|[\w$]+(?:\.[\w$]+)+|[-_a-z0-9]+-(?:key|token)$)/i;
const skipRe = /(\.(png|jpe?g|gif|webp|ico|woff2?|ttf|eot|pdf|zip|gz|map)$|^scripts\/check-secrets\.mjs$|^\.githooks\/pre-commit$)/i;

const hits = [];
trackedEnv.forEach((f) => hits.push(`file .env ter-track: ${f}`));

for (const file of files) {
  if (/\.example$/.test(file) || skipRe.test(file)) continue;
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  text.split(/\r?\n/).forEach((line, i) => {
    if (/^\s*(\/\/|\/\*|\*)/.test(line)) return;
    const m = assignRe.exec(line);
    if (!m) return;
    const value = m[2] || m[3];
    if (/\s/.test(value)) return;
    if (/^[\w$.]+\(/.test(value)) return;
    if (placeholderRe.test(value)) return;
    hits.push(`${file}:${i + 1}: ${line.trim()}`);
  });
}

if (hits.length) {
  console.error('Kemungkinan kredensial terdeteksi:');
  hits.forEach((h) => console.error(`  - ${h}`));
  process.exit(1);
}

console.log('check:secrets OK');
