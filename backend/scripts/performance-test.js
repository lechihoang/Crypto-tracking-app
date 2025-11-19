/**
 * Performance Testing Script
 * Measures response times for critical endpoints
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Test configuration
const tests = [
  {
    name: 'GET /api/crypto/markets',
    path: '/api/crypto/markets',
    method: 'GET',
    expectedMax: 500, // ms
  },
  {
    name: 'GET /api/crypto/trending',
    path: '/api/crypto/trending',
    method: 'GET',
    expectedMax: 500,
  },
  {
    name: 'GET /api/crypto/coins/bitcoin',
    path: '/api/crypto/coins/bitcoin',
    method: 'GET',
    expectedMax: 300,
  },
];

function makeRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        resolve({
          statusCode: res.statusCode,
          duration,
          dataSize: data.length,
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function runTest(test, iterations = 5) {
  console.log(`\n📊 Testing: ${test.name}`);
  console.log(`   Path: ${test.path}`);
  console.log(`   Expected max: ${test.expectedMax}ms`);
  console.log(`   Running ${iterations} iterations...`);

  const results = [];
  
  for (let i = 0; i < iterations; i++) {
    try {
      const result = await makeRequest(test.path, test.method);
      results.push(result);
      process.stdout.write('.');
    } catch (error) {
      console.error(`\n   ❌ Error: ${error.message}`);
      return null;
    }
  }

  console.log(''); // New line after dots

  // Calculate statistics
  const durations = results.map(r => r.duration);
  const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
  const min = Math.min(...durations);
  const max = Math.max(...durations);
  const median = durations.sort((a, b) => a - b)[Math.floor(durations.length / 2)];

  const passed = max <= test.expectedMax;
  const status = passed ? '✅ PASS' : '⚠️  SLOW';

  console.log(`   ${status}`);
  console.log(`   Min: ${min}ms | Avg: ${avg.toFixed(0)}ms | Median: ${median}ms | Max: ${max}ms`);
  
  if (!passed) {
    console.log(`   ⚠️  Max response time (${max}ms) exceeds expected (${test.expectedMax}ms)`);
  }

  return {
    test: test.name,
    passed,
    min,
    avg,
    median,
    max,
    expectedMax: test.expectedMax,
  };
}

async function main() {
  console.log('🚀 Backend Performance Test');
  console.log('=' .repeat(60));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Time: ${new Date().toISOString()}`);

  // Check if server is running
  try {
    await makeRequest('/api/crypto/markets');
  } catch (error) {
    console.error('\n❌ Server is not running or not accessible');
    console.error('   Please start the backend server first: npm run start:dev');
    process.exit(1);
  }

  const allResults = [];

  for (const test of tests) {
    const result = await runTest(test, 5);
    if (result) {
      allResults.push(result);
    }
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📈 Performance Summary');
  console.log('='.repeat(60));

  const passed = allResults.filter(r => r.passed).length;
  const total = allResults.length;

  console.log(`\nTests Passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('\n✅ All performance tests passed!');
    console.log('   No performance regression detected.');
  } else {
    console.log('\n⚠️  Some endpoints are slower than expected.');
    console.log('   This may indicate performance regression or network issues.');
  }

  console.log('\nDetailed Results:');
  console.log('-'.repeat(60));
  allResults.forEach(result => {
    const status = result.passed ? '✅' : '⚠️ ';
    console.log(`${status} ${result.test}`);
    console.log(`   Avg: ${result.avg.toFixed(0)}ms | Max: ${result.max}ms (expected: ${result.expectedMax}ms)`);
  });

  console.log('\n' + '='.repeat(60));
  
  process.exit(passed === total ? 0 : 1);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
