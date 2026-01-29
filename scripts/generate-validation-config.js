#!/usr/bin/env node
/**
 * Generates server/valid-ids.json from the TypeScript config files.
 * This file is used by the server to validate API requests.
 *
 * Run: node scripts/generate-validation-config.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Simple parser to extract arrays from TypeScript files
function extractLocationIds(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const ids = [];

  // Match { id: '...' } or { id: "..." } patterns
  const regex = /{\s*id:\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    ids.push(match[1]);
  }

  return ids;
}

// Extract exploration IDs from explorations.ts
function extractExplorationIds(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const ids = [];

  // Match id: '...' in the EXPLORATIONS array
  const regex = /id:\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    ids.push(match[1]);
  }

  return ids;
}

// Main
const configDir = path.join(ROOT_DIR, 'src', 'config');
const outputPath = path.join(ROOT_DIR, 'server', 'valid-ids.json');

const validIds = {
  explorations: {},
};

// Get exploration IDs
const explorationIds = extractExplorationIds(path.join(configDir, 'explorations.ts'));

// Map exploration IDs to their location files
const locationFiles = {
  'world': 'world-countries.ts',
  'us-states': 'us-states.ts',
  'texas-state-parks': 'texas-state-parks.ts',
};

for (const expId of explorationIds) {
  const locFile = locationFiles[expId];
  if (locFile) {
    const locPath = path.join(configDir, locFile);
    if (fs.existsSync(locPath)) {
      validIds.explorations[expId] = extractLocationIds(locPath);
    }
  }
}

// Write output
fs.writeFileSync(outputPath, JSON.stringify(validIds, null, 2), 'utf-8');

console.log(`Generated ${outputPath}`);
console.log(`Explorations: ${Object.keys(validIds.explorations).join(', ')}`);
for (const [expId, locIds] of Object.entries(validIds.explorations)) {
  console.log(`  ${expId}: ${locIds.length} locations`);
}
