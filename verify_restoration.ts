import { coordinator } from './server/core/coordinator.js';
import { sniffer } from './server/core/mempool-sniffer.js';
import { GraphAnalyzer } from './server/core/graph-analyzer.js';
import assert from 'assert';

async function verify() {
  console.log('--- STARTING V2 ADVANCED SUITE VERIFICATION ---');

  // 1. Test Dijkstra Weighted Pathfinding
  console.log('[TEST] Verifying Graph Analyzer (Dijkstra Weighted)...');
  const analyzer = new GraphAnalyzer();
  // Path A -> B -> C (Cost 1 + 1 = 2)
  analyzer.ingest({ sourceId: 'A', targetId: 'B', weight: 1, sentiment: 0.1, sourceType: 'user', targetType: 'user', type: 'follow', timestamp: 0 });
  analyzer.ingest({ sourceId: 'B', targetId: 'C', weight: 1, sentiment: 0.1, sourceType: 'user', targetType: 'user', type: 'follow', timestamp: 0 });
  
  // Shortcut A -> C (Costly/Low engagement: Weight 0.1 -> Cost 1/0.1 = 10)
  analyzer.ingest({ sourceId: 'A', targetId: 'C', weight: 0.05, sentiment: -0.5, sourceType: 'user', targetType: 'user', type: 'follow', timestamp: 0 });
  
  const result = await analyzer.findInfluencePath('A', 'C');
  assert.deepStrictEqual(result.path, ['A', 'B', 'C'], 'Dijkstra should find path with lower cumulative cost');
  console.log('PASS: Dijkstra Weighted Pathfinding.');

  // 2. Test OS-Aware Payload Generation (s1)
  console.log('[TEST] Verifying OS-Aware Payloads (s1)...');
  coordinator.registerBeacon('L-NODE', '192.168.1.10', [], 'linux');
  coordinator.registerBeacon('W-NODE', '192.168.1.11', [], 'windows');

  const lTask: any = coordinator.assignTask('L-NODE', { id: 's1' });
  const wTask: any = coordinator.assignTask('W-NODE', { id: 's1' });

  assert.ok(lTask.status === 'assigned');
  // Check linux payload
  const lPending: any = coordinator.registerBeacon('L-NODE', '192.168.1.10', [], 'linux');
  assert.ok(lPending.tasks[0].payload.includes('systemd'), 'Linux payload should include systemd');

  assert.ok(wTask.status === 'assigned');
  // Check windows payload
  const wPending: any = coordinator.registerBeacon('W-NODE', '192.168.1.11', [], 'windows');
  assert.ok(wPending.tasks[0].payload.includes('powershell'), 'Windows payload should include powershell');
  console.log('PASS: OS-Aware Payloads.');

  // 3. Test POLICY-2 (Command Storm Prevention)
  console.log('[TEST] Verifying POLICY-2 (Rate Limiting)...');
  coordinator.registerBeacon('STORM-NODE', '192.168.1.50', [], 'linux');
  coordinator.assignTask('STORM-NODE', { id: 'cmd' });
  coordinator.assignTask('STORM-NODE', { id: 'cmd' });
  coordinator.assignTask('STORM-NODE', { id: 'cmd' });
  const failTask: any = coordinator.assignTask('STORM-NODE', { id: 'cmd' });
  
  assert.strictEqual(failTask.error, 'POLICY-2 violation: Rate limit exceeded');
  console.log('PASS: POLICY-2 Rate Limiting.');

  // 4. Test s3 (Dynamic Discovery)
  console.log('[TEST] Verifying Dynamic Discovery (s3)...');
  let discoveryDetected = false;
  sniffer.on('discovery', (d) => {
    if (d.id === 's3') {
      discoveryDetected = true;
      console.log(`PASS: s3 Dynamic Discovery Fired: ${d.address}`);
    }
  });

  // Trigger discovery via Factory hit
  // @ts-ignore
  sniffer.analyzeTransaction({
    hash: '0xFACTORY_HIT',
    to: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', // Uniswap V2
    from: '0xDEPLOYER',
    value: BigInt(0),
  } as any);
  assert.ok(discoveryDetected, 's3 should have fired for factory activity');

  console.log('--- ALL V2 VERIFICATION TESTS PASSED ---');
}

verify().catch(e => {
  console.error('VERIFICATION FAILED:', e);
  process.exit(1);
});
