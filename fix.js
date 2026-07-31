const fs = require('fs');

const files = [
  'artifacts/api-server/src/routes/admin.ts',
  'artifacts/api-server/src/routes/logs.ts',
  'artifacts/api-server/src/routes/student.ts',
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/return\s+(res\.(?:status|json)[^;]+;?)/g, '$1 return;');
  fs.writeFileSync(file, content);
});

let seed = fs.readFileSync('artifacts/api-server/src/seed.ts', 'utf8');
seed = seed.replace(/"Male"/g, '"male"');
fs.writeFileSync('artifacts/api-server/src/seed.ts', seed);
