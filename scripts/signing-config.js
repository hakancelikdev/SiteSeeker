module.exports = {
  // Default signing identity - can be overridden with APPLE_IDENTITY env var
  defaultIdentity: 'Developer ID Application: Hakan Çelik',
  
  // App bundle identifier
  appBundleId: 'com.hakancelikdev.siteseeker',
  
  // App version
  appVersion: '1.2.6',
  
  // Signing options
  signingOptions: {
    'hardened-runtime': true,
    'gatekeeper-assess': false,
    'signature-flags': 'runtime',
    platform: 'darwin'
  },
  
  // Entitlements paths
  entitlements: {
    mac: 'build/entitlements.mac.plist',
    mas: 'build/entitlements.mas.plist',
    masInherit: 'build/entitlements.mas.inherit.plist'
  },
  
  // Provisioning profile for Mac App Store builds
  provisioningProfile: 'build/embedded.provisionprofile',
  
  // Environment variables required for signing
  requiredEnvVars: [
    'APPLE_ID',
    'APPLE_ID_PASSWORD',
    'APPLE_TEAM_ID'
  ],
  
  // Optional environment variables
  optionalEnvVars: [
    'APPLE_IDENTITY',
    'CSC_LINK',
    'CSC_KEY_PASSWORD',
    'BUILD_TARGET'
  ]
}; 