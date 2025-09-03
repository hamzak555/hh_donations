const cron = require('node-cron');
const { sendPickupReminder } = require('./emailService');
const mongoose = require('mongoose');

// The PickupRequest model will be passed in from server.js
let PickupRequest;

class ReminderScheduler {
  constructor() {
    this.jobs = new Map();
  }
  
  setPickupRequestModel(model) {
    PickupRequest = model;
    this.initializeScheduler();
  }

  initializeScheduler() {
    // Run every day at 9:00 PM to check for tomorrow's pickups (12 hours before 9 AM pickup)
    cron.schedule('0 21 * * *', async () => {
      console.log('Running daily reminder check for tomorrow\'s pickups...');
      await this.sendDailyReminders();
    });

    // Also check every hour for any missed reminders
    cron.schedule('0 * * * *', async () => {
      console.log('Running hourly reminder check...');
      await this.checkPendingReminders();
    });

    console.log('Reminder scheduler initialized');
  }

  async sendDailyReminders() {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      // Find all pickup requests scheduled for tomorrow
      const pickupRequests = await PickupRequest.find({
        pickupDate: {
          $gte: tomorrow,
          $lt: dayAfterTomorrow
        },
        status: { $in: ['pending', 'confirmed'] },
        reminderSent: { $ne: true }
      });

      console.log(`Found ${pickupRequests.length} pickup requests for tomorrow`);

      for (const request of pickupRequests) {
        if (request.email) {
          const result = await sendPickupReminder(request);
          if (result.success) {
            // Mark reminder as sent
            await PickupRequest.findByIdAndUpdate(request._id, {
              reminderSent: true,
              reminderSentAt: new Date()
            });
            console.log(`Reminder sent to ${request.email} for pickup on ${request.pickupDate}`);
          } else {
            console.error(`Failed to send reminder to ${request.email}:`, result.error);
          }
        }
      }
    } catch (error) {
      console.error('Error in sendDailyReminders:', error);
    }
  }

  async checkPendingReminders() {
    try {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);

      // Find pickup requests that are coming up soon but haven't received reminders
      const pickupRequests = await PickupRequest.find({
        pickupDate: {
          $gt: now,
          $lte: tomorrow
        },
        status: { $in: ['pending', 'confirmed'] },
        reminderSent: { $ne: true }
      });

      for (const request of pickupRequests) {
        const hoursUntilPickup = (new Date(request.pickupDate) - now) / (1000 * 60 * 60);
        
        // Send reminder if pickup is within 24 hours
        if (hoursUntilPickup <= 24 && hoursUntilPickup > 0 && request.email) {
          const result = await sendPickupReminder(request);
          if (result.success) {
            await PickupRequest.findByIdAndUpdate(request._id, {
              reminderSent: true,
              reminderSentAt: new Date()
            });
            console.log(`Urgent reminder sent to ${request.email} for pickup in ${Math.round(hoursUntilPickup)} hours`);
          }
        }
      }
    } catch (error) {
      console.error('Error in checkPendingReminders:', error);
    }
  }

  // Schedule a specific reminder for a pickup request
  async scheduleReminder(pickupRequestId, date) {
    try {
      const reminderDate = new Date(date);
      reminderDate.setDate(reminderDate.getDate() - 1); // Day before pickup
      reminderDate.setHours(21, 0, 0, 0); // 9 PM (12 hours before 9 AM pickup)

      // If reminder date is in the past, don't schedule
      if (reminderDate <= new Date()) {
        console.log('Reminder date is in the past, skipping scheduling');
        return;
      }

      const jobId = `reminder_${pickupRequestId}`;
      
      // Cancel existing job if any
      if (this.jobs.has(jobId)) {
        this.jobs.get(jobId).stop();
      }

      // Create cron pattern for specific date/time
      const cronPattern = `${reminderDate.getMinutes()} ${reminderDate.getHours()} ${reminderDate.getDate()} ${reminderDate.getMonth() + 1} *`;
      
      const job = cron.schedule(cronPattern, async () => {
        const pickupRequest = await PickupRequest.findById(pickupRequestId);
        if (pickupRequest && pickupRequest.email && pickupRequest.status !== 'cancelled') {
          await sendPickupReminder(pickupRequest);
          await PickupRequest.findByIdAndUpdate(pickupRequestId, {
            reminderSent: true,
            reminderSentAt: new Date()
          });
        }
        this.jobs.delete(jobId);
      });

      this.jobs.set(jobId, job);
      console.log(`Scheduled reminder for pickup ${pickupRequestId} on ${reminderDate}`);
    } catch (error) {
      console.error('Error scheduling reminder:', error);
    }
  }

  // Cancel a scheduled reminder
  cancelReminder(pickupRequestId) {
    const jobId = `reminder_${pickupRequestId}`;
    if (this.jobs.has(jobId)) {
      this.jobs.get(jobId).stop();
      this.jobs.delete(jobId);
      console.log(`Cancelled reminder for pickup ${pickupRequestId}`);
    }
  }
}

// Create singleton instance
const reminderScheduler = new ReminderScheduler();

module.exports = reminderScheduler;