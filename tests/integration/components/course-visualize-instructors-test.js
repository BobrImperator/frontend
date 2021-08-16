import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/course-visualize-instructors';

module('Integration | Component | course-visualize-instructors', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    const course = this.server.create('course', { year: 2021, school });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    this.set('course', courseModel);

    await render(hbs`<CourseVisualizeInstructors @model={{this.course}} />`);
    assert.equal(component.title, 'course 0 2021');
  });

  test('filter works', async function (assert) {
    const school = this.server.create('school');
    const course = this.server.create('course', { year: 2021, school });
    const session = this.server.create('session', { course });
    const instructor1 = this.server.create('user', { firstName: 'foo' });
    const instructor2 = this.server.create('user', { firstName: 'bar' });
    this.server.create('offering', {
      session,
      startDate: new Date('2021/03/01'),
      endDate: new Date('2021/04/01'),
      instructors: [instructor1, instructor2],
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    this.set('course', courseModel);

    await render(hbs`<CourseVisualizeInstructors @model={{this.course}} />`);
    assert.equal(component.title, 'course 0 2021');
    assert.equal(component.chart.bars.length, 2);
    assert.equal(component.chart.labels.length, 2);
    await component.filter.set('foo');
    assert.equal(component.chart.bars.length, 1);
    assert.equal(component.chart.labels.length, 1);
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

    await render(hbs`<CourseVisualizeInstructors @model={{this.course}} />`);

    assert.equal(component.title, 'course 0 2021 - 2022');
  });

  test('breadcrumb', async function (assert) {
    const school = this.server.create('school');
    const course = this.server.create('course', { year: 2021, school });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    this.set('course', courseModel);

    await render(hbs`<CourseVisualizeInstructors @model={{this.course}} />`);

    assert.equal(component.breadcrumb.crumbs.length, 3);
    assert.equal(component.breadcrumb.crumbs[0].text, 'course 0');
    assert.equal(component.breadcrumb.crumbs[0].link, '/courses/1');
    assert.equal(component.breadcrumb.crumbs[1].text, 'Other Visualizations');
    assert.equal(component.breadcrumb.crumbs[1].link, '/data/courses/1');
    assert.equal(component.breadcrumb.crumbs[2].text, 'Instructors');
  });
});
