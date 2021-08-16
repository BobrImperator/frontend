import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/course-visualize-objectives';

module('Integration | Component | course-visualize-objectives', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    const course = this.server.create('course', { year: 2021, school });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    this.set('course', courseModel);

    await render(hbs`<CourseVisualizeObjectives @model={{this.course}} />`);
    assert.equal(component.title, 'course 0 2021');
  });

  test('course year is shown as range if applicable by configuration', async function (assert) {
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    const school = this.server.create('school');
    const course = this.server.create('course', { year: 2021, school });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    this.set('course', courseModel);

    await render(hbs`<CourseVisualizeObjectives @model={{this.course}} />`);

    assert.equal(component.title, 'course 0 2021 - 2022');
  });

  test('breadcrumb', async function (assert) {
    const school = this.server.create('school');
    const course = this.server.create('course', { year: 2021, school });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    this.set('course', courseModel);

    await render(hbs`<CourseVisualizeObjectives @model={{this.course}} />`);

    assert.equal(component.breadcrumb.crumbs.length, 3);
    assert.equal(component.breadcrumb.crumbs[0].text, 'course 0');
    assert.equal(component.breadcrumb.crumbs[0].link, '/courses/1');
    assert.equal(component.breadcrumb.crumbs[1].text, 'Other Visualizations');
    assert.equal(component.breadcrumb.crumbs[1].link, '/data/courses/1');
    assert.equal(component.breadcrumb.crumbs[2].text, 'Objectives');
  });
});
