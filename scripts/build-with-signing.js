// Load environment variables from .env file
require('dotenv').config();

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

async function buildWithSigning() {
  const buildType = process.argv[2] || 'universal';
  const shouldSign = process.argv.includes('--sign');
  const isMas = buildType === 'mas' || buildType === 'mas-dev';
  
  console.log(`🚀 Starting build process for: ${buildType}`);
  
  try {
    // Clean previous builds
    console.log('🧹 Cleaning previous builds...');
    execSync('npm run clean', { stdio: 'inherit' });
    
    // Build the app
    console.log(`📦 Building app for ${buildType}...`);
    const buildCommand = isMas 
      ? `npm run build:${buildType}`
      : `npm run build:${buildType}`;
    
    execSync(buildCommand, { stdio: 'inherit' });
    
    if (shouldSign) {
      console.log('🔐 Starting code signing process...');
      
      // Find the built app
      const distPath = path.join(__dirname, '../dist');
      const files = fs.readdirSync(distPath);
      const appFile = files.find(file => file.endsWith('.app'));
      
      if (!appFile) {
        throw new Error('No .app file found in dist directory');
      }
      
      const appPath = path.join(distPath, appFile);
      console.log(`Found app at: ${appPath}`);
      
      // Sign the app
      const signCommand = isMas 
        ? `BUILD_TARGET=mas node scripts/sign.js "${appPath}"`
        : `node scripts/sign.js "${appPath}"`;
      
      execSync(signCommand, { stdio: 'inherit' });
      
      console.log('✅ Build and signing completed successfully!');
    } else {
      console.log('✅ Build completed successfully!');
    }
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

buildWithSigning(); 