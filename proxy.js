const http = require('http');

const PORT = 9999;
const TARGET_IP = '192.168.0.157';
const TARGET_PORT = 9898;

http.createServer((req, res) => {
  const options = {
    hostname: TARGET_IP,
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers
  };
  
  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  req.pipe(proxyReq, { end: true });
  
  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err);
    res.writeHead(500);
    res.end('Proxy error');
  });
}).listen(PORT, '127.0.0.1', () => {
  console.log(`Proxy listening on 127.0.0.1:${PORT}`);
});
