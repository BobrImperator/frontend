import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { initialize } from '../../../initializers/replace-promise';

import { run } from '@ember/runloop';

initialize();

module('Unit | Model | CurriculumInventoryAcademicLevel', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('curriculum-inventory-academic-level'));
    // let store = this.store();
    assert.ok(!!model);
  });
});
