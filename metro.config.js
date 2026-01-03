const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix for web bundling issues with certain packages
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

// Fix Zustand import.meta issue on web by using CJS build
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Zustand's ESM build uses import.meta which doesn't work with Metro on web
  // Force it to use the CJS build by disabling package exports
  if (moduleName.startsWith('zustand')) {
    const ctx = { ...context, unstable_enablePackageExports: false };
    return ctx.resolveRequest(ctx, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
