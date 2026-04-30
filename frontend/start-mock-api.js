// Start Mock API Server
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Mock API Server...');

const mockApiPath = path.join(__dirname, 'mock-api.js');
const mockApi = spawn('node', [mockApiPath], { 
  stdio: 'inherit',
  shell: true 
});

mockApi.on('close', (code) => {
  console.log(`Mock API server exited with code ${code}`);
});

mockApi.on('error', (error) => {
  console.error('Failed to start Mock API server:', error);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Mock API server...');
  mockApi.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down Mock API server...');
  mockApi.kill('SIGTERM');
});
