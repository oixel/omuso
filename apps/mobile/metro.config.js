const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')
const path = require('path')

// Project roots
const projectRoot = __dirname
const monorepoRoot = path.resolve(projectRoot, '../..')

// Default config
const config = getDefaultConfig(projectRoot)

// Ensure that metro check the shared root
config.watchFolders = [monorepoRoot]

// Ensure that metro checks the node_modules of both roots
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
]

config.resolver.sourceExts = [
  'native.tsx',
  'native.ts',
  'native.js',
  'native.jsx',
  ...config.resolver.sourceExts,
]

// Ensure NativeWind is added
module.exports = withNativeWind(config, { input: './global.css' })
