#!/bin/bash

# Deploy Supabase Email Function Script
# Run this after setting SUPABASE_ACCESS_TOKEN environment variable

echo "🚀 Starting Supabase email function deployment..."

# Step 1: Link the project
echo "📎 Linking Supabase project..."
npx supabase link --project-ref kbdhzmlcomthrhxkifbf

# Step 2: Set the Resend API key secret
echo "🔐 Setting Resend API key secret..."
npx supabase secrets set RESEND_API_KEY=re_dsvo81GE_LbXEKPep42eRSsCKHwwh2Grr

# Step 3: Deploy the function
echo "📦 Deploying send-pickup-confirmation function..."
npx supabase functions deploy send-pickup-confirmation --no-verify-jwt

echo "✅ Deployment complete! Emails should now work in production."
echo "Test it by submitting a pickup request on the production site."