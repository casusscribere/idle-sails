// Minimal dependency-free static server for the docs/ site.
// Binds process.env.PORT (assigned by the preview harness) so it never
// hardcodes a port.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = new URL('./docs/', import.meta.url);
const port = process.env.PORT || 3210;
const TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.geojson': 'application/json',
  '.bin': 'application/octet-stream'
};

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const fp = new URL('.' + p, root);
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); res.end('404'); return; }
    res.writeHead(200, {
      'content-type': TYPES[path.extname(fp.pathname)] || 'application/octet-stream',
      'access-control-allow-origin': '*'
    });
    res.end(data);
  });
}).listen(port, () => console.log('serving docs/ on port', port));
