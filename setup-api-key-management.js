#!/usr/bin/env node

/**
 * Setup Script for User-Managed API Key System
 * Run this script to set up the database and initialize the system
 */

const fs = require('fs');
const path = require('path');

console.log('🔐 Setting up User-Managed API Key System...\n');

// Check if required files exist
const requiredFiles = [
  'api-key-management-schema.sql',
  'src/lib/apiKeyService.ts',
  'src/lib/aiService.ts',
  'src/components/UsageMonitoringDashboard.tsx',
  'src/components/EnhancedApiKeyManager.tsx',
  'src/components/AIStatusIndicator.tsx',
];

console.log('📋 Checking required files...');
let allFilesExist = true;

for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
}

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing. Please ensure all files are in place before running setup.');
  process.exit(1);
}

console.log('\n✅ All required files are present!');

// Check TypeScript types
console.log('\n🔍 Checking TypeScript dependencies...');
const packageJsonPath = 'package.json';
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = [
    '@supabase/supabase-js',
    'lucide-react',
    'react',
    'typescript'
  ];
  
  const missingDeps = requiredDeps.filter(dep => !dependencies[dep]);
  
  if (missingDeps.length > 0) {
    console.log(`⚠️  Missing dependencies: ${missingDeps.join(', ')}`);
    console.log('Run: npm install @supabase/supabase-js lucide-react');
  } else {
    console.log('✅ All required dependencies are installed');
  }
} else {
  console.log('⚠️  package.json not found - make sure you\'re in the project root');
}

// Generate setup checklist
console.log('\n📝 Setup Checklist:');
console.log(`
1. 🗄️  Database Setup:
   - Open your Supabase SQL editor
   - Run the contents of 'api-key-management-schema.sql'
   - Verify tables are created with: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%api%';

2. 🔧 Service Integration:
   - Import ApiKeyService and AIService in your main App component
   - Set current user when authenticated: apiKeyService.setCurrentUser(user)
   - Replace existing AI API calls with aiService.makeRequest()

3. 🎨 UI Integration:
   - Add API Key Manager to your navigation
   - Add Usage Dashboard to your navigation  
   - Add AIStatusIndicator to components that use AI
   - Update existing TemplateEditor with TemplateEditor_Enhanced

4. 🧪 Testing:
   - Test API key addition and validation
   - Verify rate limiting works
   - Check usage tracking in dashboard
   - Test graceful degradation

5. 🚀 Deployment:
   - Update environment variables if needed
   - Deploy database schema changes
   - Deploy application updates
   - Monitor usage and errors

6. 📚 Documentation:
   - Review API_KEY_MANAGEMENT_GUIDE.md
   - Update your user documentation
   - Train support team on new features
`);

// Create integration example
const integrationExample = `
// Example App.tsx integration
import { useEffect, useState } from 'react';
import ApiKeyService from './lib/apiKeyService';
import AIService from './lib/aiService';
import EnhancedApiKeyManager from './components/EnhancedApiKeyManager';
import UsageMonitoringDashboard from './components/UsageMonitoringDashboard';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showApiKeyManager, setShowApiKeyManager] = useState(false);
  const [showUsageDashboard, setShowUsageDashboard] = useState(false);

  const apiKeyService = ApiKeyService.getInstance();
  const aiService = AIService.getInstance();

  useEffect(() => {
    if (currentUser) {
      apiKeyService.setCurrentUser(currentUser);
    }
  }, [currentUser]);

  return (
    <div>
      {/* Your existing app content */}
      
      {/* Add to navigation */}
      {currentUser && (
        <div>
          <button onClick={() => setShowApiKeyManager(true)}>
            API Keys
          </button>
          <button onClick={() => setShowUsageDashboard(true)}>
            Usage Dashboard
          </button>
        </div>
      )}

      {/* Modal/Overlay Components */}
      {showApiKeyManager && (
        <EnhancedApiKeyManager 
          onClose={() => setShowApiKeyManager(false)} 
        />
      )}
      
      {showUsageDashboard && (
        <UsageMonitoringDashboard 
          onOpenApiKeyManager={() => setShowApiKeyManager(true)}
        />
      )}
    </div>
  );
}
`;

fs.writeFileSync('integration-example.tsx', integrationExample);
console.log('\n📄 Created integration-example.tsx with sample code');

console.log('\n🎉 Setup preparation complete!');
console.log('\n📖 Next steps:');
console.log('1. Read API_KEY_MANAGEMENT_GUIDE.md for detailed instructions');
console.log('2. Apply the database schema in Supabase');
console.log('3. Follow the integration steps in the guide');
console.log('4. Test the system thoroughly before deploying');

console.log('\n✨ Your application will soon have user-managed AI with full cost protection!');
