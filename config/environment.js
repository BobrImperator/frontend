'use strict';
const existsSync = require('exists-sync');
const dotenv = require('dotenv');
const path = require('path');
const dotEnvPath = path.join(__dirname, '../.env');
if (existsSync(dotEnvPath)) {
  dotenv.config({ path: dotEnvPath });
}

const API_VERSION = require('./api-version.js');

module.exports = function (environment) {

  let ENV = {
    modulePrefix: 'ilios',
    environment,
    rootURL: '/',
    locationType: 'auto',
    redirectAfterShibLogin: true,
    contentSecurityPolicy: {
      'default-src':  ["'none'"],
      'script-src':   ["'self'", "'unsafe-eval'", 'www.google-analytics.com'],
      'font-src':     ["'self'", 'fonts.gstatic.com'],
      'connect-src':  ["'self'", 'www.google-analytics.com'],
      'img-src':      ["'self'", 'data:', 'www.google-analytics.com', 'cdnjs.cloudflare.com/ajax/libs/browser-logos/'],
      'style-src':    ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
      'media-src':    ["'self'"],
      'manifest-src': ["'self'"],
    },
    flashMessageDefaults: {
      timeout: 3000,
      extendedTimeout: 1000,
      types: [ 'success', 'warning', 'info', 'alert' ]
    },
    'ember-simple-auth-token': {
      serverTokenEndpoint: '/auth/login',
      serverTokenRefreshEndpoint: '/auth/token',
      tokenPropertyName: 'jwt',
      authorizationHeaderName: 'X-JWT-Authorization',
      authorizationPrefix: 'Token ',
      refreshLeeway: 300
    },
    i18n: {
      defaultLocale: 'en'
    },
    serverVariables: {
      tagPrefix: 'iliosconfig',
      vars: ['api-host', 'api-name-space'],
      defaults: {
        'api-name-space': process.env.ILIOS_FRONTEND_API_NAMESPACE || 'api/v1',
        'api-host': process.env.ILIOS_FRONTEND_API_HOST || null,
      }
    },
    'ember-metrics': {
      includeAdapters: ['google-analytics']
    },
    moment: {
      // Full list of locales: https://github.com/moment/moment/tree/2.10.3/locale
      includeLocales: ['es', 'fr'],
      includeTimezone: 'all',
    },
    'ember-qunit-nice-errors': {
      completeExistingMessages: true,
      showFileInfo: true,
    },
    'ember-a11y-testing': {
      componentOptions: {
        turnAuditOff: process.env.SKIP_A11Y || false,
        visualNoiseLevel: 1,
      },
    },
    fontawesome: {
      enableExperimentalBuildTimeTransform: false,
      defaultPrefix: 'fas',
      icons: {
        'pro-light-svg-icons': [
          'clipboard-list',
        ],
        'free-solid-svg-icons': 'all',
        'free-brands-svg-icons': [
          'black-tie',
        ],
        // //icons which are used dynamically and cannot be detected at build time
        // 'free-solid-svg-icons': [
        //   'ban',
        //   'bold',
        //   'check',
        //   'clock',
        //   'cloud',
        //   'download',
        //   'ellipsis-h',
        //   'exclamation-circle',
        //   'external-link-square-alt',
        //   'file-audio',
        //   'file-pdf',
        //   'file-powerpoint',
        //   'file-video',
        //   'file',
        //   'info-circle',
        //   'italic',
        //   'link',
        //   'list-ol',
        //   'list-ul',
        //   'paragraph',
        //   'sort-alpha-down',
        //   'sort-alpha-up',
        //   'sort-numeric-down',
        //   'sort-numeric-up',
        //   'sort',
        //   'spinner',
        //   'star',
        //   'star-half-alt',
        //   'subscript',
        //   'superscript',
        // ],
      }
    },
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        String: true,
        Array: true,
        Function: false,
        Date: false,
      }
    },

    APP: {
      apiVersion: API_VERSION,
      // Here you can pass flags/options to your application instance
      // when it is created
    },
    //Hide a feature while it is in development
    IliosFeatures: {
      programYearVisualizations: false
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
    ENV.contentSecurityPolicy['script-src'].push("'unsafe-inline'");
    ENV.redirectAfterShibLogin = false;

    //Remove mirage in developemnt, we only use it in testing
    ENV['ember-cli-mirage'] = {
      enabled: false
    };

    ENV.IliosFeatures.programYearVisualizations = true;

    //put ember concurrency tasks into debug mode to make errors much easier to spot
    ENV.EmberENV.DEBUG_TASKS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.contentSecurityPolicy['script-src'].push("'unsafe-inline'");
    ENV.flashMessageDefaults.timeout = 100;
    ENV.flashMessageDefaults.extendedTimeout = 100;
    ENV.serverVariables.defaults['api-name-space'] = 'api';
    ENV.serverVariables.defaults['api-host'] = '';

    //silence warnings in tests when dates are not initialized
    ENV.moment.allowEmpty = true;
    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
  }

  if (environment === 'preview') {
    // here you can enable a preview-specific feature
    ENV.IliosFeatures.programYearVisualizations = true;
    ENV['ember-a11y-testing'].componentOptions.turnAuditOff = true;

    //Remove mirage
    ENV['ember-cli-mirage'] = {
      enabled: false
    };
  }

  //add our API host to the list of acceptable data sources
  ENV.contentSecurityPolicy['connect-src'].push(ENV.serverVariables.defaults['api-host']);


  return ENV;
};
