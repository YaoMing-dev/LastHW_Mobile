// Patch @expo/ngrok to use system ngrok v3 instead of bundled v2
const fs = require('fs');
const path = require('path');

const ngrokDir = path.join(__dirname, '..', 'node_modules', '@expo', 'ngrok', 'src');

if (!fs.existsSync(path.join(ngrokDir, 'process.js'))) {
  console.log('[patch-ngrok] @expo/ngrok not found, skipping');
  process.exit(0);
}

// 1. Patch process.js - use system ngrok binary
let processJs = fs.readFileSync(path.join(ngrokDir, 'process.js'), 'utf8');
if (!processJs.includes('const bin = "ngrok"')) {
  processJs = processJs.replace(
    'const bin = require("@expo/ngrok-bin");',
    '// Patched: use system ngrok v3 instead of bundled v2\nconst bin = "ngrok";'
  );
  fs.writeFileSync(path.join(ngrokDir, 'process.js'), processJs, 'utf8');
  console.log('[patch-ngrok] Patched process.js -> system ngrok v3');
}

// 2. Patch client.js - strip v2-only fields from tunnel config
let clientJs = fs.readFileSync(path.join(ngrokDir, 'client.js'), 'utf8');
if (!clientJs.includes('// ngrok v3 API')) {
  clientJs = clientJs.replace(
    `startTunnel(options = {}) {\n    return this.request("post", "api/tunnels", options);\n  }`,
    `startTunnel(options = {}) {\n    // ngrok v3 API only accepts specific fields; strip v2-only fields\n    const { proto, addr, name, bind_tls, schemes, host_header, inspect } = options;\n    const cleaned = { proto, addr, name };\n    if (bind_tls !== undefined) cleaned.bind_tls = bind_tls;\n    if (schemes !== undefined) cleaned.schemes = schemes;\n    if (host_header !== undefined) cleaned.host_header = host_header;\n    if (inspect !== undefined) cleaned.inspect = inspect;\n    return this.request("post", "api/tunnels", cleaned);\n  }`
  );
  fs.writeFileSync(path.join(ngrokDir, 'client.js'), clientJs, 'utf8');
  console.log('[patch-ngrok] Patched client.js -> v3 tunnel config');
}

// 3. Patch utils.js - v3 config path
let utilsJs = fs.readFileSync(path.join(ngrokDir, 'utils.js'), 'utf8');
if (!utilsJs.includes('ngrok v3')) {
  utilsJs = utilsJs.replace(
    `function defaultConfigPath() {\n  return join(homedir(), ".ngrok2", "ngrok.yml");\n}`,
    `function defaultConfigPath() {\n  // ngrok v3 uses AppData/Local/ngrok on Windows, ~/.config/ngrok on unix\n  const { platform, env } = require("process");\n  if (platform === "win32") {\n    return join(env.LOCALAPPDATA || join(homedir(), "AppData", "Local"), "ngrok", "ngrok.yml");\n  }\n  return join(homedir(), ".config", "ngrok", "ngrok.yml");\n}`
  );
  fs.writeFileSync(path.join(ngrokDir, 'utils.js'), utilsJs, 'utf8');
  console.log('[patch-ngrok] Patched utils.js -> v3 config path');
}

console.log('[patch-ngrok] Done');
