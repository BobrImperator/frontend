import EmberObject from '@ember/object';
import CourseVisualizationsRouteMixin from 'ilios-common/mixins/course-visualizations-route';
import { module, test } from 'qunit';

module('Unit | Mixin | course-visualizations-route', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    const CourseVisualizationsRouteObject = EmberObject.extend(CourseVisualizationsRouteMixin);
    const subject = CourseVisualizationsRouteObject.create();
    assert.ok(subject);
  });
});
