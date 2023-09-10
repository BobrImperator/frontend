/* global window */

window.deprecationWorkflow = window.deprecationWorkflow || {};
window.deprecationWorkflow.config = {
  workflow: [
    { handler: 'silence', matchId: 'manager-capabilities.modifiers-3-13' }, //https://github.com/emberjs/ember-render-modifiers/issues/32
    { handler: 'silence', matchId: 'common.user-performs-non-learner-function' },
    { handler: 'silence', matchId: 'common.curriculum-inventory-report-is-finalized' },
    { handler: 'silence', matchId: 'common.async-computed' },
    { handler: 'silence', matchId: 'common.resolve-computed' },
    { handler: 'silence', matchId: 'common.school-cohorts' },
    { handler: 'silence', matchId: 'deprecated-run-loop-and-computed-dot-access' }, //https://github.com/elidupuis/ember-cli-deploy-archive/pull/16
    { handler: 'silence', matchId: 'ember-global' },
    { handler: 'silence', matchId: 'ember-modifier.use-destroyables' },
    { handler: 'silence', matchId: 'ember-modifier.no-args-property' },
    { handler: 'silence', matchId: 'ember-modifier.no-element-property' },
    { handler: 'silence', matchId: 'ember-modifier.use-modify' },
    { handler: 'silence', matchId: 'ember-modifier.function-based-options' },
    { handler: 'silence', matchId: 'ember-polyfills.deprecate-assign' },
    { handler: 'silence', matchId: 'common.dates-no-dates' },
  ],
};
