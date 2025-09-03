#!/bin/bash

# Deploy Contact Form Email Function to Supabase
# Make sure you're logged in first with: npx supabase login

echo "🚀 Starting deployment of contact form email function..."

# Navigate to project directory
cd /Users/hamzakhalid/Desktop/HHDonations

# Check if logged in
echo "📋 Checking Supabase login status..."
npx supabase whoami

if [ $? -ne 0 ]; then
    echo "❌ Not logged in to Supabase. Please run: npx supabase login"
    exit 1
fi

# Link the project
echo "🔗 Linking Supabase project..."
npx supabase link --project-ref kbdhzmlcomthrhxkifbf

if [ $? -ne 0 ]; then
    echo "❌ Failed to link project. You may need to enter your database password."
    echo "   Run manually: npx supabase link --project-ref kbdhzmlcomthrhxkifbf"
    exit 1
fi

# Deploy the function
echo "📦 Deploying send-contact-email function..."
npx supabase functions deploy send-contact-email

if [ $? -eq 0 ]; then
    echo "✅ Function deployed successfully!"
    echo ""
    echo "📧 The contact form will now send emails to: info@hhdonations.com"
    echo "🔑 Using Resend API key: RESEND_API_KEY_HH_FORM (already configured)"
    echo ""
    echo "🧪 To test:"
    echo "   1. Go to http://localhost:3000/contact"
    echo "   2. Fill out the form"
    echo "   3. Submit and check info@hhdonations.com inbox"
else
    echo "❌ Deployment failed. Please check the error messages above."
    exit 1
fi