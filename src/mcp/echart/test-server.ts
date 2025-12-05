#!/usr/bin/env node

/**
 * Test script for EChart MCP Server (stdio mode)
 * 
 * This script demonstrates how to test the MCP server in standalone mode
 * without the browser environment.
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the compiled server
const serverPath = join(__dirname, '../dist/mcp/echart/echart-server.js');

console.log('🚀 Starting EChart MCP Server test...\n');

// Spawn the server process
const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'inherit']
});

let responseBuffer = '';

// Send JSON-RPC request
function sendRequest(method: string, params: any = {}) {
  const request = {
    jsonrpc: '2.0',
    id: Date.now(),
    method,
    params
  };
  
  const message = JSON.stringify(request) + '\n';
  console.log('📤 Sending:', JSON.stringify(request, null, 2));
  server.stdin.write(message);
}

// Handle server output
server.stdout.on('data', (data) => {
  responseBuffer += data.toString();
  
  // Try to parse complete JSON-RPC messages
  const lines = responseBuffer.split('\n');
  responseBuffer = lines.pop() || ''; // Keep incomplete line
  
  lines.forEach(line => {
    if (line.trim()) {
      try {
        const response = JSON.parse(line);
        console.log('📥 Response:', JSON.stringify(response, null, 2));
        console.log('');
      } catch (e) {
        console.log('Raw output:', line);
      }
    }
  });
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`\n✅ Server process exited with code ${code}`);
  process.exit(code || 0);
});

// Test sequence
setTimeout(() => {
  console.log('\n📋 Test 1: List available tools\n');
  sendRequest('tools/list');
}, 500);

setTimeout(() => {
  console.log('\n📋 Test 2: Generate line chart\n');
  sendRequest('tools/call', {
    name: 'generate_line_chart',
    arguments: {
      title: 'Test Line Chart',
      xAxisData: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      series: [
        {
          name: 'Sales',
          data: [120, 200, 150, 80, 70]
        }
      ]
    }
  });
}, 1500);

setTimeout(() => {
  console.log('\n📋 Test 3: Generate pie chart\n');
  sendRequest('tools/call', {
    name: 'generate_pie_chart',
    arguments: {
      title: 'Test Pie Chart',
      data: [
        { name: 'Category A', value: 30 },
        { name: 'Category B', value: 50 },
        { name: 'Category C', value: 20 }
      ]
    }
  });
}, 2500);

// Cleanup after tests
setTimeout(() => {
  console.log('\n🏁 Tests complete, shutting down...\n');
  server.kill();
}, 3500);
