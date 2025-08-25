const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Data file path
const DATA_FILE = path.join(__dirname, 'data.json');

// Initialize data file if it doesn't exist
async function initializeDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    const initialData = {
      drivers: [],
      containers: [],
      bins: [],
      bales: [],
      pickupRequests: []
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
    console.log('Data file initialized');
  }
}

// Read data from file
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return {
      drivers: [],
      containers: [],
      bins: [],
      bales: [],
      pickupRequests: []
    };
  }
}

// Write data to file
async function writeData(data) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing data:', error);
    return false;
  }
}

// Initialize on startup
initializeDataFile();

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Get all data
app.get('/api/data', async (req, res) => {
  try {
    const data = await readData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync all data
app.post('/api/sync', async (req, res) => {
  try {
    const success = await writeData(req.body);
    if (success) {
      res.json({ message: 'Data synced successfully' });
    } else {
      res.status(500).json({ error: 'Failed to save data' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Drivers
app.get('/api/drivers', async (req, res) => {
  try {
    const data = await readData();
    res.json(data.drivers || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/drivers', async (req, res) => {
  try {
    const data = await readData();
    data.drivers = data.drivers || [];
    data.drivers.push(req.body);
    await writeData(data);
    res.status(201).json(req.body);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/drivers/:id', async (req, res) => {
  try {
    const data = await readData();
    const index = data.drivers.findIndex(d => d.id === req.params.id);
    if (index !== -1) {
      data.drivers[index] = { ...data.drivers[index], ...req.body };
      await writeData(data);
      res.json(data.drivers[index]);
    } else {
      res.status(404).json({ error: 'Driver not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/drivers/:id', async (req, res) => {
  try {
    const data = await readData();
    data.drivers = data.drivers.filter(d => d.id !== req.params.id);
    await writeData(data);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Containers
app.get('/api/containers', async (req, res) => {
  try {
    const data = await readData();
    res.json(data.containers || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/containers', async (req, res) => {
  try {
    const data = await readData();
    data.containers = data.containers || [];
    data.containers.push(req.body);
    await writeData(data);
    res.status(201).json(req.body);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/containers/:id', async (req, res) => {
  try {
    const data = await readData();
    const index = data.containers.findIndex(c => c.id === req.params.id);
    if (index !== -1) {
      data.containers[index] = { ...data.containers[index], ...req.body };
      await writeData(data);
      res.json(data.containers[index]);
    } else {
      res.status(404).json({ error: 'Container not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/containers/:id', async (req, res) => {
  try {
    const data = await readData();
    data.containers = data.containers.filter(c => c.id !== req.params.id);
    await writeData(data);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Bins
app.get('/api/bins', async (req, res) => {
  try {
    const data = await readData();
    res.json(data.bins || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bins', async (req, res) => {
  try {
    const data = await readData();
    data.bins = data.bins || [];
    data.bins.push(req.body);
    await writeData(data);
    res.status(201).json(req.body);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/bins/:id', async (req, res) => {
  try {
    const data = await readData();
    const index = data.bins.findIndex(b => b.id === req.params.id);
    if (index !== -1) {
      data.bins[index] = { ...data.bins[index], ...req.body };
      await writeData(data);
      res.json(data.bins[index]);
    } else {
      res.status(404).json({ error: 'Bin not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/bins/:id', async (req, res) => {
  try {
    const data = await readData();
    data.bins = data.bins.filter(b => b.id !== req.params.id);
    await writeData(data);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Bales
app.get('/api/bales', async (req, res) => {
  try {
    const data = await readData();
    res.json(data.bales || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bales', async (req, res) => {
  try {
    const data = await readData();
    data.bales = data.bales || [];
    data.bales.push(req.body);
    await writeData(data);
    res.status(201).json(req.body);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/bales/:id', async (req, res) => {
  try {
    const data = await readData();
    const index = data.bales.findIndex(b => b.id === req.params.id);
    if (index !== -1) {
      data.bales[index] = { ...data.bales[index], ...req.body };
      await writeData(data);
      res.json(data.bales[index]);
    } else {
      res.status(404).json({ error: 'Bale not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/bales/:id', async (req, res) => {
  try {
    const data = await readData();
    data.bales = data.bales.filter(b => b.id !== req.params.id);
    await writeData(data);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Pickup Requests
app.get('/api/pickup-requests', async (req, res) => {
  try {
    const data = await readData();
    res.json(data.pickupRequests || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/pickup-requests', async (req, res) => {
  try {
    const data = await readData();
    data.pickupRequests = data.pickupRequests || [];
    data.pickupRequests.push(req.body);
    await writeData(data);
    res.status(201).json(req.body);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/pickup-requests/:id', async (req, res) => {
  try {
    const data = await readData();
    const index = data.pickupRequests.findIndex(p => p.id === req.params.id);
    if (index !== -1) {
      data.pickupRequests[index] = { ...data.pickupRequests[index], ...req.body };
      await writeData(data);
      res.json(data.pickupRequests[index]);
    } else {
      res.status(404).json({ error: 'Pickup request not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/pickup-requests/:id', async (req, res) => {
  try {
    const data = await readData();
    data.pickupRequests = data.pickupRequests.filter(p => p.id !== req.params.id);
    await writeData(data);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Data will be stored in: ${DATA_FILE}`);
});