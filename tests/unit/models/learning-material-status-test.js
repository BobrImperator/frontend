import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { initialize } from '../../../initializers/replace-promise';

import { run } from '@ember/runloop';

initialize();

module('Unit | Model | LearningMaterialStatus', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('learning-material-status'));
    // let store = this.store();
    assert.ok(!!model);
  });
});
