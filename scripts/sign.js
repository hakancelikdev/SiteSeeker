// Load environment variables from .env file
require('dotenv').config();

const osxSign = require('electron-osx-sign');
const path = require('path');
const config = require('./signing-config');

async function signApp() {
  const appPath = process.argv[2];
  
  if (!appPath) {
    console.error('Usage: node scripts/sign.js <path-to-app>');
    process.exit(1);
  }

  // Check for required environment variables
  const missingEnvVars = config.requiredEnvVars.filter(envVar => !process.env[envVar]);
  if (missingEnvVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
    console.error('Please set these environment variables before signing.');
    process.exit(1);
  }

  const isMas = process.env.BUILD_TARGET === 'mas';
  const entitlementsPath = isMas ? config.entitlements.mas : config.entitlements.mac;
  const entitlementsInheritPath = isMas ? config.entitlements.masInherit : config.entitlements.mac;

  const signOptions = {
    app: appPath,
    identity: process.env.APPLE_IDENTITY || config.defaultIdentity,
    entitlements: path.join(__dirname, '..', entitlementsPath),
    'entitlements-inherit': path.join(__dirname, '..', entitlementsInheritPath),
    ...config.signingOptions,
    version: config.appVersion
  };

  // Add certificate file if provided
  if (process.env.CSC_LINK) {
    signOptions.cert = process.env.CSC_LINK;
    if (process.env.CSC_KEY_PASSWORD) {
      signOptions.certPassword = process.env.CSC_KEY_PASSWORD;
    }
  }

  // Add provisioning profile if building for Mac App Store
  if (isMas) {
    signOptions.provisioningProfile = path.join(__dirname, '..', config.provisioningProfile);
  }

  try {
    console.log('🔐 Starting code signing process...');
    console.log('App path:', appPath);
    console.log('Identity:', signOptions.identity);
    console.log('Build target:', isMas ? 'Mac App Store' : 'Direct Distribution');
    console.log('Entitlements:', entitlementsPath);
    
    await osxSign(signOptions);
    
    console.log('✅ Code signing completed successfully!');
  } catch (error) {
    console.error('❌ Code signing failed:', error);
    process.exit(1);
  }
}

signApp(); 