// Load environment variables from .env file
require('dotenv').config();

const { notarize } = require('@electron/notarize');

module.exports = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;  
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  // Check if environment variables are set
  if (!process.env.APPLE_ID || !process.env.APPLE_ID_PASSWORD || !process.env.APPLE_TEAM_ID) {
    console.log('⚠️  Notarization skipped: Missing environment variables');
    return;
  }

  console.log('🔐 Starting notarization process...');
  console.log('App path:', `${appOutDir}/${appName}.app`);

  try {
    await notarize({
      appBundleId: 'com.hakancelikdev.siteseeker',
      appPath: `${appOutDir}/${appName}.app`,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID,
    });
    
    console.log('✅ Notarization completed successfully!');
  } catch (error) {
    console.error('❌ Notarization failed:', error);
    throw error;
  }
}; 