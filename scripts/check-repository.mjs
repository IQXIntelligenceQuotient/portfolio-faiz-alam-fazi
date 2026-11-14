import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
const forbidden = files.filter(file =>
  /(?:^|\/)(?:node_modules|scratch|\.kiro|\.vscode|hostinger-deploy)(?:\/|$)/.test(file) ||
  /\.(?:zip|rar|7z|bundle|pem|key|p12|dump|sqlite3?)$/i.test(file) ||
  /(?:^|\/)\.env(?:\..*)?$/.test(file) && !file.endsWith('/.env.example') && file !== '.env.example' ||
  file.startsWith('Backend/uploads/') && file !== 'Backend/uploads/.gitkeep'
);
if (forbidden.length) {
  console.error('Remove private/runtime/archive files from Git tracking:\n' + forbidden.join('\n'));
  process.exit(1);
}
for (const file of files.filter(file => /\.(?:js|jsx|mjs|html|json|ya?ml)$/.test(file) && fs.existsSync(file))) {
  const text = fs.readFileSync(file, 'utf8');
  const secret = /-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----/.test(text) ||
    /(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})/.test(text) ||
    /(?:ADMIN_PASSWORD|JWT_SECRET_KEY)\s*=\s*process\.env\.[A-Z_]+\s*\|\|\s*['"][^'"]+['"]/.test(text);
  if (secret) { console.error('Potential hardcoded credential in ' + file); process.exit(1); }
}
console.log(`Repository exposure checks passed for ${files.length} tracked files.`);
