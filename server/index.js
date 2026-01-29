import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- Validation config ---
const VALID_IDS_PATH = path.join(__dirname, 'valid-ids.json');
let validIds = { explorations: {} };

function loadValidIds() {
  try {
    if (fs.existsSync(VALID_IDS_PATH)) {
      validIds = JSON.parse(fs.readFileSync(VALID_IDS_PATH, 'utf-8'));
    } else {
      console.warn('Warning: valid-ids.json not found. Run "node scripts/generate-validation-config.js" to generate it.');
    }
  } catch (err) {
    console.error('Error loading validation config:', err.message);
  }
}

function isValidExploration(explorationId) {
  return explorationId in validIds.explorations;
}

function isValidLocation(explorationId, locationId) {
  const locations = validIds.explorations[explorationId];
  return locations && locations.includes(locationId);
}

// Load validation config on startup
loadValidIds();

// --- Data file management ---

const DEFAULT_DATA_DIR = path.join(ROOT_DIR, 'data');
const DEFAULT_DATA_FILE = path.join(DEFAULT_DATA_DIR, 'exploration-data.json');
const SETTINGS_FILE = path.join(ROOT_DIR, '.exploration-settings.json');

function getSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch {
    // ignore parse errors
  }
  return { dataFilePath: DEFAULT_DATA_FILE };
}

function saveSettings(settings) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
}

function getDataFilePath() {
  const settings = getSettings();
  return settings.dataFilePath || DEFAULT_DATA_FILE;
}

function ensureDataFile(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    const defaultData = { explorations: {} };
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
    console.log(`Created new data file at: ${filePath}`);
  }
}

function readData() {
  const filePath = getDataFilePath();
  ensureDataFile(filePath);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function writeData(data) {
  const filePath = getDataFilePath();
  ensureDataFile(filePath);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// --- API Routes ---

// Get all exploration data
app.get('/api/data', (_req, res) => {
  try {
    const data = readData();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Save all exploration data (import)
app.put('/api/data', (req, res) => {
  try {
    const importData = req.body;

    // Validate structure
    if (!importData || typeof importData !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid data format: expected an object',
      });
    }

    if (!importData.explorations || typeof importData.explorations !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid data format: missing "explorations" object',
      });
    }

    // Validate explorations and locations, collect warnings for invalid entries
    const warnings = [];
    const cleanedData = { explorations: {} };

    for (const [expId, locations] of Object.entries(importData.explorations)) {
      if (!isValidExploration(expId)) {
        warnings.push(`Skipped invalid exploration: "${expId}"`);
        continue;
      }

      cleanedData.explorations[expId] = {};

      for (const [locId, locData] of Object.entries(locations)) {
        if (!isValidLocation(expId, locId)) {
          warnings.push(`Skipped invalid location: "${locId}" in "${expId}"`);
          continue;
        }
        cleanedData.explorations[expId][locId] = locData;
      }
    }

    writeData(cleanedData);
    res.json({
      success: true,
      warnings: warnings.length > 0 ? warnings : undefined,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Toggle a location's visited status
app.post('/api/data/:explorationId/:locationId/toggle', (req, res) => {
  try {
    const { explorationId, locationId } = req.params;

    // Validate exploration and location IDs
    if (!isValidExploration(explorationId)) {
      return res.status(400).json({
        success: false,
        error: `Invalid exploration: "${explorationId}"`,
      });
    }
    if (!isValidLocation(explorationId, locationId)) {
      return res.status(400).json({
        success: false,
        error: `Invalid location: "${locationId}" for exploration "${explorationId}"`,
      });
    }

    const data = readData();

    if (!data.explorations[explorationId]) {
      data.explorations[explorationId] = {};
    }

    const current = data.explorations[explorationId][locationId];
    if (current && current.visited) {
      // Unmark - remove the entry
      delete data.explorations[explorationId][locationId];
    } else {
      // Mark as visited
      data.explorations[explorationId][locationId] = {
        visited: true,
        ...(current || {}),
      };
    }

    writeData(data);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update location details (visit count, dates, notes)
app.put('/api/data/:explorationId/:locationId', (req, res) => {
  try {
    const { explorationId, locationId } = req.params;

    // Validate exploration and location IDs
    if (!isValidExploration(explorationId)) {
      return res.status(400).json({
        success: false,
        error: `Invalid exploration: "${explorationId}"`,
      });
    }
    if (!isValidLocation(explorationId, locationId)) {
      return res.status(400).json({
        success: false,
        error: `Invalid location: "${locationId}" for exploration "${explorationId}"`,
      });
    }

    const data = readData();

    if (!data.explorations[explorationId]) {
      data.explorations[explorationId] = {};
    }

    data.explorations[explorationId][locationId] = {
      ...data.explorations[explorationId][locationId],
      ...req.body,
      visited: true,
    };

    writeData(data);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get settings
app.get('/api/settings', (_req, res) => {
  try {
    const settings = getSettings();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update settings
app.put('/api/settings', (req, res) => {
  try {
    const newSettings = req.body;

    // If the data file path changed, migrate data
    const oldSettings = getSettings();
    if (
      newSettings.dataFilePath &&
      newSettings.dataFilePath !== oldSettings.dataFilePath
    ) {
      const oldPath = oldSettings.dataFilePath || DEFAULT_DATA_FILE;
      const newPath = newSettings.dataFilePath;

      // Ensure the new path's directory exists
      const newDir = path.dirname(newPath);
      if (!fs.existsSync(newDir)) {
        fs.mkdirSync(newDir, { recursive: true });
      }

      // Copy existing data to new location if old file exists and new doesn't
      if (fs.existsSync(oldPath) && !fs.existsSync(newPath)) {
        fs.copyFileSync(oldPath, newPath);
        console.log(`Migrated data from ${oldPath} to ${newPath}`);
      }
    }

    saveSettings(newSettings);
    res.json({ success: true, data: newSettings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Serve static files in production ---
const distPath = path.join(ROOT_DIR, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('{*path}', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// --- Open browser helper ---
function openBrowser(url) {
  const platform = process.platform;
  let cmd;
  if (platform === 'darwin') cmd = `open "${url}"`;
  else if (platform === 'win32') cmd = `start "" "${url}"`;
  else cmd = `xdg-open "${url}"`;
  exec(cmd, (err) => {
    if (err) console.log('Could not open browser automatically. Please open:', url);
  });
}

// --- Start server ---
app.listen(PORT, () => {
  const dataPath = getDataFilePath();
  ensureDataFile(dataPath);
  const url = `http://localhost:${PORT}`;
  console.log(`Exploration Tracker server running on ${url}`);
  console.log(`Data file: ${dataPath}`);

  // Auto-open browser when launched via start script (OPEN_BROWSER=1)
  if (process.env.OPEN_BROWSER === '1') {
    openBrowser(url);
  }
});
