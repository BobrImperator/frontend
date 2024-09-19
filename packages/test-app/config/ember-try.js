'use strict';

const { embroiderSafe, embroiderOptimized } = require('@embroider/test-setup');

module.exports = function () {
  return {
    usePnpm: true,
    scenarios: [
      {
        name: 'ember-default',
      },
      embroiderSafe(),
      embroiderOptimized(),
    ],
  };
};
