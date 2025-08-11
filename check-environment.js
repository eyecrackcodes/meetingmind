// Environment Check Script for MeetingMind
// Run this with: node check-environment.js

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking MeetingMind Environment Configuration...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envLocalPath = path.join(__dirname, '.env.local');

let envFile = null;
if (fs.existsSync(envLocalPath)) {
  envFile = envLocalPath;
  console.log('✅ Found .env.local file');
} else if (fs.existsSync(envPath)) {
  envFile = envPath;
  console.log('✅ Found .env file');
} else {
  console.log('❌ No .env or .env.local file found!');
  console.log('   Create a .env.local file with your Supabase credentials');
  process.exit(1);
}

// Read and parse env file
const envContent = fs.readFileSync(envFile, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
});

// Check required variables
const requiredVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

const optionalVars = [
  'VITE_SUPABASE_SERVICE_ROLE_KEY'
];

console.log('\n📋 Required Environment Variables:');
let allRequiredPresent = true;

requiredVars.forEach(varName => {
  const value = envVars[varName];
  if (value && value.length > 0) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: MISSING`);
    allRequiredPresent = false;
  }
});

console.log('\n📋 Optional Environment Variables:');
optionalVars.forEach(varName => {
  const value = envVars[varName];
  if (value && value.length > 0) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`⚠️  ${varName}: Not set (needed for admin operations)`);
  }
});

// Validate URL format
if (envVars.VITE_SUPABASE_URL) {
  try {
    const url = new URL(envVars.VITE_SUPABASE_URL);
    if (url.hostname.includes('supabase.co')) {
      console.log('✅ Supabase URL format looks valid');
    } else {
      console.log('⚠️  Supabase URL format might be incorrect');
    }
  } catch (error) {
    console.log('❌ Invalid Supabase URL format');
    allRequiredPresent = false;
  }
}

console.log('\n🔧 Next Steps:');
if (!allRequiredPresent) {
  console.log('❌ Please fix the missing environment variables:');
  console.log('   1. Go to your Supabase project dashboard');
  console.log('   2. Go to Settings > API');
  console.log('   3. Copy the Project URL and anon/public key');
  console.log('   4. Add them to your .env.local file');
} else {
  console.log('✅ Environment looks good!');
  console.log('   If you\'re still having signup issues:');
  console.log('   1. Run apply-auth-fix.sql in your Supabase SQL Editor');
  console.log('   2. Make sure your database schema is up to date');
  console.log('   3. Check the browser console for specific errors');
}

console.log('\n📚 Helpful Files:');
console.log('   • apply-auth-fix.sql - Fix database trigger issues');
console.log('   • check-user-status.sql - Check user database status');
console.log('   • bootstrap-admin.sql - Create first admin user');
console.log('   • USER_APPROVAL_SETUP.md - Complete setup guide');
