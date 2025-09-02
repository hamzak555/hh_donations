const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const { sendPickupConfirmation, sendPickupCompleted } = require('./services/emailService');
const reminderScheduler = require('./services/reminderScheduler');

const app = express();
const PORT = process.env.PORT || 5001;

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
  pickupDate: Date, // Actual scheduled pickup date
  preferredTime: String,
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'] },
  notes: String,
  specialInstructions: String,
  assignedDriver: String,
  completedDate: Date,
  // Email tracking fields
  confirmationSent: { type: Boolean, default: false },
  confirmationSentAt: Date,
  reminderSent: { type: Boolean, default: false },
  reminderSentAt: Date,
  completionEmailSent: { type: Boolean, default: false },
  completionEmailSentAt: Date,
  emailPreferences: {
    sendConfirmation: { type: Boolean, default: true },
    sendReminder: { type: Boolean, default: true },
    sendCompletion: { type: Boolean, default: true }
  }
}, { timestamps: true });

// Models
const Driver = mongoose.model('Driver', driverSchema);
const Container = mongoose.model('Container', containerSchema);
const Bin = mongoose.model('Bin', binSchema);
const Bale = mongoose.model('Bale', baleSchema);
const PickupRequest = mongoose.model('PickupRequest', pickupRequestSchema);

// Initialize reminder scheduler with PickupRequest model
reminderScheduler.setPickupRequestModel(PickupRequest);

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
    
    // Set pickupDate if not provided
    if (!request.pickupDate && request.preferredDate) {
      request.pickupDate = request.preferredDate;
    }
    
    await request.save();
    
    // Send confirmation email if email is provided and preferences allow
    if (request.email && request.emailPreferences?.sendConfirmation !== false) {
      const emailResult = await sendPickupConfirmation(request);
      if (emailResult.success) {
        request.confirmationSent = true;
        request.confirmationSentAt = new Date();
        await request.save();
        console.log(`Confirmation email sent to ${request.email}`);
      } else {
        console.error(`Failed to send confirmation email to ${request.email}:`, emailResult.error);
      }
      
      // Schedule reminder if preferences allow
      if (request.emailPreferences?.sendReminder !== false && request.pickupDate) {
        reminderScheduler.scheduleReminder(request._id, request.pickupDate);
      }
    }
    
    res.status(201).json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/pickup-requests/:id', async (req, res) => {
  try {
    const oldRequest = await PickupRequest.findOne({ id: req.params.id });
    const request = await PickupRequest.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    
    // Check if status changed to completed
    if (oldRequest && oldRequest.status !== 'completed' && request.status === 'completed') {
      // Send completion email
      if (request.email && request.emailPreferences?.sendCompletion !== false && !request.completionEmailSent) {
        const emailResult = await sendPickupCompleted(request);
        if (emailResult.success) {
          request.completionEmailSent = true;
          request.completionEmailSentAt = new Date();
          request.completedDate = new Date();
          await request.save();
          console.log(`Completion email sent to ${request.email}`);
        }
      }
    }
    
    // Check if pickup date changed and reschedule reminder
    if (oldRequest && oldRequest.pickupDate !== request.pickupDate && request.pickupDate) {
      reminderScheduler.cancelReminder(request._id);
      if (request.email && request.emailPreferences?.sendReminder !== false && request.status !== 'completed' && request.status !== 'cancelled') {
        reminderScheduler.scheduleReminder(request._id, request.pickupDate);
      }
    }
    
    // Cancel reminder if status changed to cancelled
    if (oldRequest && oldRequest.status !== 'cancelled' && request.status === 'cancelled') {
      reminderScheduler.cancelReminder(request._id);
    }
    
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

// Send pickup confirmation and update status
app.post('/api/send-pickup-confirmation', async (req, res) => {
  try {
    const { requestId, email, name, address, pickupDate, specialInstructions } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const { sendPickupConfirmation } = require('./services/emailService');
    const { updatePickupRequestEmailStatus, updatePickupRequestByEmail } = require('./services/supabaseService');
    
    const emailData = {
      email,
      name: name || 'Customer',
      address: address || 'Address not provided',
      pickupDate: pickupDate || new Date().toISOString(),
      specialInstructions: specialInstructions || ''
    };
    
    const result = await sendPickupConfirmation(emailData);
    
    if (result.success) {
      // Update the status in Supabase
      const emailStatusUpdate = {
        confirmationSent: true,
        confirmationSentAt: new Date().toISOString()
      };
      
      // Always update by email since it's more reliable
      const updateResult = await updatePickupRequestByEmail(email, emailStatusUpdate);
      
      // If update by email failed, try by requestId as fallback
      if (!updateResult && requestId) {
        await updatePickupRequestEmailStatus(requestId, emailStatusUpdate);
      }
      
      // Also try to update MongoDB if available
      if (PickupRequest) {
        try {
          await PickupRequest.findOneAndUpdate(
            { id: requestId },
            emailStatusUpdate
          );
        } catch (dbError) {
          console.log('Could not update MongoDB:', dbError.message);
        }
      }
      
      res.json({ 
        success: true, 
        message: `Confirmation email sent successfully to ${email}`,
        data: result.data 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: result.error 
      });
    }
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send confirmation email endpoint (for manual sending)
app.post('/api/send-confirmation-email', async (req, res) => {
  try {
    const { email, name, address, pickupDate, specialInstructions } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const { sendPickupConfirmation } = require('./services/emailService');
    
    const emailData = {
      email,
      name: name || 'Customer',
      address: address || 'Address not provided',
      pickupDate: pickupDate || new Date().toISOString(),
      specialInstructions: specialInstructions || ''
    };
    
    const result = await sendPickupConfirmation(emailData);
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: `Confirmation email sent successfully to ${email}`,
        data: result.data 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: result.error 
      });
    }
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test email endpoint
app.post('/api/test-email', async (req, res) => {
  try {
    const { email, type = 'confirmation' } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const testData = {
      name: 'Test User',
      email: email,
      phone: '555-1234',
      address: '123 Test Street, Test City, TC 12345',
      items: 'Clothes, Toys, Books',
      pickupDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      specialInstructions: 'Please ring the doorbell twice'
    };
    
    let result;
    const { sendPickupConfirmation, sendPickupReminder, sendPickupCompleted } = require('./services/emailService');
    
    switch(type) {
      case 'reminder':
        result = await sendPickupReminder(testData);
        break;
      case 'completed':
        result = await sendPickupCompleted(testData);
        break;
      case 'confirmation':
      default:
        result = await sendPickupConfirmation(testData);
        break;
    }
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: `Test ${type} email sent successfully to ${email}`,
        data: result.data 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error 
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});