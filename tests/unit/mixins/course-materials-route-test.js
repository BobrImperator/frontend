import EmberObject from '@ember/object';
import CourseMaterialsRouteMixin from 'ilios-common/mixins/course-materials-route';
import { module, test } from 'qunit';

module('Unit | Mixin | course-materials-route', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    const CourseMaterialsRouteObject = EmberObject.extend(CourseMaterialsRouteMixin);
    const subject = CourseMaterialsRouteObject.create();
    assert.ok(subject);
  });
});
