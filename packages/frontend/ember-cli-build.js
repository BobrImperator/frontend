'use strict';
/* eslint camelcase: 0 */

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const broccoliAssetRevDefaults = require('broccoli-asset-rev/lib/default-options');
const { Webpack } = require('@embroider/webpack');
const { RetryChunkLoadPlugin } = require('webpack-retry-chunk-load-plugin');
const TerserPlugin = require('terser-webpack-plugin');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = function (defaults) {
  const env = EmberApp.env() || 'development';
  const isTestBuild = env === 'test';

  const app = new EmberApp(defaults, {
    fingerprint: {
      extensions: broccoliAssetRevDefaults.extensions.concat(['webmanifest', 'svg']),
    },
    sourcemaps: {
      enabled: true,
    },
    emberData: {
      compatWith: '5.2',
    },

    hinting: isTestBuild,
    babel: {
      plugins: [
        require.resolve('ember-auto-import/babel-plugin'),
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
  });

  if (process.env.BUILD_WITH_EMBROIDER) {
    return require('@embroider/compat').compatBuild(app, Webpack, {
      staticAddonTestSupportTrees: true,
      staticAddonTrees: true,
      staticHelpers: true,
      staticComponents: true,
      splitAtRoutes: [
        //temporarily disabled route splitting for https://github.com/ilios/ilios/issues/4508
        /admin[a-z-]*/,
        'assign-students',
        /course[a-z-]*/,
        /curriculum[a-z-]*/,
        'dashboard.activities',
        'dashboard.calendar',
        'dashboard.materials',
        // 'error', don't ever split the error route, it will break error handling
        'events',
        'four-oh-four',
        /instructor[a-z-]*/,
        /learner[a-z-]*/,
        'login',
        'logout',
        'myprofile',
        'pending-user-updates',
        'print-course',
        /program[a-z-]*/,
        /report[a-z-]*/,
        /school[a-z-]*/,
        'search',
        /session[a-z-]*/,
        /user[a-z-]*/,
        'verification-preview',
        'weeklyevents',
      ],
      packagerOptions: {
        webpackConfig: {
          plugins: [new RetryChunkLoadPlugin() /*, new BundleAnalyzerPlugin()*/],
          optimization: {
            minimize: true,
            minimizer: [
              new TerserPlugin({
                terserOptions: {
                  compress: {
                    passes: 6, // slow, but worth it
                    inline: 5,
                    reduce_funcs: false,
                  },
                },
              }),
            ],
          },
        },
      },
    });
  } else {
    return app.toTree();
  }
};
