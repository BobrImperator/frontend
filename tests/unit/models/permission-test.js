import { moduleForModel, test } from 'ember-qunit';
import modelList from '../../helpers/model-list';

moduleForModel('permission', 'Unit | Model | permission ', {
  needs: modelList
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});
