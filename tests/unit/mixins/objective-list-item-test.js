import EmberObject from '@ember/object';
import ObjectiveListItemMixin from 'ilios-common/mixins/objective-list-item';
import { module, test } from 'qunit';

module('Unit | Mixin | objective list item', function() {
  // Replace this with your real tests.
  test('it works', function(assert) {
    const ObjectiveListItemObject = EmberObject.extend(ObjectiveListItemMixin);
    const subject = ObjectiveListItemObject.create();
    assert.ok(subject);
  });
});
