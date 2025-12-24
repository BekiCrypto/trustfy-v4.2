const http = require('http');

function checkUrl(url, name) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`[${name}] Status: ${res.statusCode}`);
        if (res.statusCode >= 200 && res.statusCode < 400) {
          console.log(`[${name}] ✅ Connected successfully`);
          if (data.length > 0) {
             try {
                const json = JSON.parse(data);
                // Extra checks for specific endpoints
                if (name === 'Indexer Status') {
                    // Check lag
                    if (Array.isArray(json)) {
                        json.forEach(chain => {
                            if (chain.lagBlocks > 100) {
                                console.log(`[${name}] ⚠️  Chain ${chain.chainId} is lagging by ${chain.lagBlocks} blocks`);
                            } else {
                                console.log(`[${name}] ✅ Chain ${chain.chainId} is synced (lag: ${chain.lagBlocks})`);
                            }
                        });
                    }
                }
             } catch (e) {
                 // ignore json parse error
             }
          }
          resolve(true);
        } else {
          console.log(`[${name}] ⚠️  Connected but returned status ${res.statusCode}`);
          resolve(false);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`[${name}] ❌ Connection failed: ${e.message}`);
      resolve(false);
    });
    
    req.end();
  });
}

async function verify() {
  console.log('Starting System Verification...');
  console.log('========================================');
  
  // 1. Check Web Preview (Dev Server)
  const webOk = await checkUrl('http://localhost:5173', 'Web UI');
  
  // 2. Check API Health
  const apiOk = await checkUrl('http://localhost:4000/v1/health', 'API Health');
  
  // 3. Check Indexer Status
  const indexerOk = await checkUrl('http://localhost:4000/v1/indexer/status', 'Indexer Status');
  
  // 4. Check Escrows List (Public API)
  const escrowsOk = await checkUrl('http://localhost:4000/v1/escrows', 'Escrows List');
  
  console.log('========================================');
  if (webOk && apiOk && indexerOk && escrowsOk) {
    console.log('🎉 System Verification Passed: All services are reachable and responding.');
  } else {
    console.log('❌ System Verification Failed: Some services are not reachable.');
    process.exit(1);
  }
}

verify();
