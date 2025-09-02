const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

// Initialize Resend with API key
const apiKey = process.env.RESEND_API_KEY;
if (!apiKey || apiKey === 're_xxxxxxxxx') {
  console.warn('⚠️  Resend API key not configured properly. Email sending will be simulated.');
}

const resend = new Resend(apiKey);

// GitHub URL for logo
const logoGitHubURL = 'https://raw.githubusercontent.com/hamzak555/hh_donations/main/public/images/HH%20Logo%20Green.png';

// Read HTML templates
const pickupConfirmedTemplate = fs.readFileSync(
  path.join(__dirname, '../email-pickup-confirmed.html'),
  'utf-8'
);

const pickupReminderTemplate = fs.readFileSync(
  path.join(__dirname, '../email-pickup-reminder.html'),
  'utf-8'
);

// Helper function to format date
function formatDate(date) {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Helper function to replace placeholders in template
function processTemplate(template, data) {
  let processed = template;
  
  // Replace logo paths with GitHub URL
  processed = processed.replace(
    /https:\/\/raw\.githubusercontent\.com\/hamzak555\/hh_donations\/main\/public\/images\/HH%20Logo%20Green\.png/g,
    logoGitHubURL
  );
  
  // Replace date placeholder
  if (data.pickupDate) {
    const formattedDate = formatDate(data.pickupDate);
    // For confirmation email
    processed = processed.replace('Monday, September 3, 2025', formattedDate);
    // For reminder email  
    processed = processed.replace('Tomorrow - Monday, September 3, 2025', `Tomorrow - ${formattedDate}`);
  }
  
  // Replace address
  if (data.address) {
    processed = processed.replace('123 Test Street, Test City, TC 12345', data.address);
  }
  
  // Replace name if provided
  if (data.name) {
    processed = processed.replace('Dear Test User,', `Dear ${data.name},`);
  }
  
  // Add special instructions if provided
  if (data.specialInstructions) {
    const instructionHTML = `<br /><span style="color: #14532d;">📝</span> ${data.specialInstructions}`;
    // Find the address line and add instructions after it
    const addressPattern = /<span style="color: #14532d;">📍<\/span> ([^<]+)/;
    processed = processed.replace(addressPattern, (match, address) => {
      return `${match}${instructionHTML}`;
    });
  }
  
  return processed;
}

async function sendEmail(to, template, data) {
  try {
    let emailContent = {};
    
    if (template === 'pickupConfirmation') {
      emailContent.subject = 'Pickup Request Confirmed - H&H Donations';
      emailContent.html = processTemplate(pickupConfirmedTemplate, data);
    } else if (template === 'pickupReminder') {
      emailContent.subject = 'Reminder: Donation Pickup Tomorrow - H&H Donations';
      emailContent.html = processTemplate(pickupReminderTemplate, data);
    } else {
      throw new Error(`Unknown email template: ${template}`);
    }
    
    // Check if API key is configured
    if (!apiKey || apiKey === 're_xxxxxxxxx') {
      // Simulation mode - just log the email
      console.log('📧 SIMULATED EMAIL:');
      console.log('To:', to);
      console.log('Subject:', emailContent.subject);
      console.log('Template:', template);
      console.log('Data:', data);
      return { 
        success: true, 
        simulated: true,
        data: { 
          id: 'simulated_' + Date.now(),
          to,
          subject: emailContent.subject 
        } 
      };
    }
    
    const response = await resend.emails.send({
      from: 'HH Donations <noreply@hhdonations.com>', // Using your domain email
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    });

    console.log('Email sent successfully:', response);
    return { success: true, data: response };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

async function sendPickupConfirmation(pickupRequest) {
  return sendEmail(pickupRequest.email, 'pickupConfirmation', pickupRequest);
}

async function sendPickupReminder(pickupRequest) {
  return sendEmail(pickupRequest.email, 'pickupReminder', pickupRequest);
}

async function sendPickupCompleted(pickupRequest) {
  // For now, we'll use the confirmation template with a completion message
  // You can create a separate completion template later
  const completionData = {
    ...pickupRequest,
    subject: 'Thank You - Donation Pickup Completed',
    message: 'Thank you for your donation! Your items have been successfully picked up.'
  };
  return sendEmail(pickupRequest.email, 'pickupConfirmation', completionData);
}

module.exports = {
  sendEmail,
  sendPickupConfirmation,
  sendPickupReminder,
  sendPickupCompleted
};