'use strict';
/* eslint camelcase: 0 */

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const broccoliAssetRevDefaults = require('broccoli-asset-rev/lib/default-options');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = async function (defaults) {
  const { maybeEmbroider } = require('@embroider/test-setup');
  const env = EmberApp.env() || 'development';
  const isTestBuild = env === 'test';

  const config = {
    fingerprint: {
      extensions: broccoliAssetRevDefaults.extensions.concat([
        'webmanifest',
        'svg',
      ]),
    },
    emberData: {
      compatWith: '5.2',
    },

    hinting: isTestBuild,
    babel: {
      plugins: [
        require.resolve('ember-concurrency/async-arrow-task-transform'),
      ],
    },
    'ember-cli-image-transformer': {
      images: [
        {
          inputFilename: 'lib/images/sunburst.svg',
          outputFileName: 'sunburst-white-background',
          background: { r: 255, g: 255, b: 255, alpha: 1 },
          convertTo: 'png',
          sizes: [48, 96, 180, 192],
        },
        {
          inputFilename: 'lib/images/sunburst.svg',
          outputFileName: 'sunburst-transparent',
          convertTo: 'png',
          sizes: [16, 32, 48, 96, 150, 512],
        },
      ],
    },
    'ember-cli-qunit': {
      useLintTree: false,
    },
    autoImport: {
      insertScriptsAt: 'auto-import-scripts',
      watchDependencies: ['ilios-common'],
    },
    'ember-fetch': {
      preferNative: true,
    },
    'ember-simple-auth': {
      useSessionSetupMethod: true, //can be removed in ESA v5.x
    },
    minifyCSS: {
      enabled: false,
    },
    sassOptions: {
      silenceDeprecations: ['mixed-decls'],
    },
  };

  const app = new EmberApp(defaults, config);

  const { setConfig } = await import('@warp-drive/build-config');
  setConfig(app, __dirname, {
    ___legacy_support: true,
  });

  return maybeEmbroider(app, {
    staticAddonTestSupportTrees: true,
    staticAddonTrees: true,
    staticHelpers: true,
    staticComponents: true,
    splitAtRoutes: [
      // /admin[a-z-]*/,
      'assign-students',
      // /course[a-z-]*/,
      // /curriculum[a-z-]*/,
      'dashboard.activities',
      'dashboard.calendar',
      'dashboard.materials',
      'events',
      'four-oh-four',
      // /instructor[a-z-]*/,
      // /learner[a-z-]*/,
      'login',
      'logout',
      'myprofile',
      'pending-user-updates',
      'print-course',
      // /program[a-z-]*/,
      // /report[a-z-]*/,
      // /school[a-z-]*/,
      'search',
      // /session[a-z-]*/,
      // /user[a-z-]*/,
      'verification-preview',
      'weeklyevents',
    ],
  });
};
