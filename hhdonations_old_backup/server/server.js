const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hhdonations';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Schemas
const driverSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: String,
  phone: String,
  assignedBins: [String],
  status: { type: String, enum: ['Active', 'Inactive'] },
  totalPickups: Number
}, { timestamps: true });

const containerSchema = new mongoose.Schema({
  id: String,
  number: String,
  location: String,
  capacity: Number,
  currentWeight: Number,
  assignedBales: [String],
  status: { type: String, enum: ['Active', 'Full', 'In Transit', 'Inactive'] },
  lastEmptied: Date,
  photos: [String],
  documents: [String]
}, { timestamps: true });

const binSchema = new mongoose.Schema({
  id: String,
  number: String,
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  capacity: Number,
  currentLevel: Number,
  status: { type: String, enum: ['Active', 'Full', 'Needs Maintenance', 'Inactive'] },
  lastEmptied: Date,
  assignedDriver: String
}, { timestamps: true });

const baleSchema = new mongoose.Schema({
  id: String,
  baleNumber: String,
  weight: Number,
  material: String,
  location: String,
  dateCreated: Date,
  status: { type: String, enum: ['In Storage', 'Assigned', 'Shipped', 'Processed'] },
  assignedContainer: String,
  photos: [String],
  documents: [String]
}, { timestamps: true });

const pickupRequestSchema = new mongoose.Schema({
  id: String,
  name: String,
  phone: String,
  email: String,
  address: String,
  items: String,
  preferredDate: Date,
  preferredTime: String,
  status: { type: String, enum: ['Pending', 'Scheduled', 'Completed', 'Cancelled'] },
  notes: String,
  assignedDriver: String,
  completedDate: Date
}, { timestamps: true });

// Models
const Driver = mongoose.model('Driver', driverSchema);
const Container = mongoose.model('Container', containerSchema);
const Bin = mongoose.model('Bin', binSchema);
const Bale = mongoose.model('Bale', baleSchema);
const PickupRequest = mongoose.model('PickupRequest', pickupRequestSchema);

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Drivers
app.get('/api/drivers', async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/drivers', async (req, res) => {
  try {
    const driver = new Driver(req.body);
    await driver.save();
    res.status(201).json(driver);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/drivers/:id', async (req, res) => {
  try {
    const driver = await Driver.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(driver);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/drivers/:id', async (req, res) => {
  try {
    await Driver.findOneAndDelete({ id: req.params.id });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Containers
app.get('/api/containers', async (req, res) => {
  try {
    const containers = await Container.find();
    res.json(containers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/containers', async (req, res) => {
  try {
    const container = new Container(req.body);
    await container.save();
    res.status(201).json(container);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/containers/:id', async (req, res) => {
  try {
    const container = await Container.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(container);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/containers/:id', async (req, res) => {
  try {
    await Container.findOneAndDelete({ id: req.params.id });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Bins
app.get('/api/bins', async (req, res) => {
  try {
    const bins = await Bin.find();
    res.json(bins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bins', async (req, res) => {
  try {
    const bin = new Bin(req.body);
    await bin.save();
    res.status(201).json(bin);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/bins/:id', async (req, res) => {
  try {
    const bin = await Bin.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(bin);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/bins/:id', async (req, res) => {
  try {
    await Bin.findOneAndDelete({ id: req.params.id });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Bales
app.get('/api/bales', async (req, res) => {
  try {
    const bales = await Bale.find();
    res.json(bales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bales', async (req, res) => {
  try {
    const bale = new Bale(req.body);
    await bale.save();
    res.status(201).json(bale);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/bales/:id', async (req, res) => {
  try {
    const bale = await Bale.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(bale);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/bales/:id', async (req, res) => {
  try {
    await Bale.findOneAndDelete({ id: req.params.id });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Pickup Requests
app.get('/api/pickup-requests', async (req, res) => {
  try {
    const requests = await PickupRequest.find();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/pickup-requests', async (req, res) => {
  try {
    const request = new PickupRequest(req.body);
    await request.save();
    res.status(201).json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/pickup-requests/:id', async (req, res) => {
  try {
    const request = await PickupRequest.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/pickup-requests/:id', async (req, res) => {
  try {
    await PickupRequest.findOneAndDelete({ id: req.params.id });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Bulk sync endpoint for initial data migration
app.post('/api/sync', async (req, res) => {
  try {
    const { drivers, containers, bins, bales, pickupRequests } = req.body;
    
    // Clear existing data
    await Promise.all([
      Driver.deleteMany({}),
      Container.deleteMany({}),
      Bin.deleteMany({}),
      Bale.deleteMany({}),
      PickupRequest.deleteMany({})
    ]);
    
    // Insert new data
    const results = await Promise.all([
      drivers && drivers.length > 0 ? Driver.insertMany(drivers) : [],
      containers && containers.length > 0 ? Container.insertMany(containers) : [],
      bins && bins.length > 0 ? Bin.insertMany(bins) : [],
      bales && bales.length > 0 ? Bale.insertMany(bales) : [],
      pickupRequests && pickupRequests.length > 0 ? PickupRequest.insertMany(pickupRequests) : []
    ]);
    
    res.json({
      message: 'Data synced successfully',
      counts: {
        drivers: results[0].length,
        containers: results[1].length,
        bins: results[2].length,
        bales: results[3].length,
        pickupRequests: results[4].length
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});