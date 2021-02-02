import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/course/objective-list';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | course/objective-list', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders and is accessible', async function (assert) {
    assert.expect(14);
    const school = this.server.create('school');
    const course = this.server.create('course');
    const vocabulary = this.server.create('vocabulary', { school });
    const term1 = this.server.create('term', { vocabulary });
    const term2 = this.server.create('term', { vocabulary });
    this.server.create('course-objective', {
      course,
      title: 'Objective A',
      position: 0,
      terms: [term1],
    });
    this.server.create('course-objective', {
      course,
      title: 'Objective B',
      position: 0,
      terms: [term2],
    });

    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    this.set('course', courseModel);

    await render(
      hbs`<Course::ObjectiveList
        @editable={{true}}
        @course={{this.course}}
      />`
    );
    assert.ok(component.sortIsVisible, 'Sort Objectives button is visible');
    assert.equal(component.headers[0].text, 'Description');
    assert.equal(component.headers[1].text, 'Parent Objectives');
    assert.equal(component.headers[2].text, 'Vocabulary Terms');
    assert.equal(component.headers[3].text, 'MeSH Terms');
    assert.equal(component.headers[4].text, 'Actions');

    assert.equal(component.objectives.length, 2);
    assert.equal(component.objectives[0].description.text, 'Objective B');
    assert.equal(component.objectives[0].selectedTerms.list[0].title, 'Vocabulary 1 (school 0)');
    assert.equal(component.objectives[0].selectedTerms.list[0].terms[0].name, 'term 1');
    assert.equal(component.objectives[1].description.text, 'Objective A');
    assert.equal(component.objectives[1].selectedTerms.list[0].title, 'Vocabulary 1 (school 0)');
    assert.equal(component.objectives[1].selectedTerms.list[0].terms[0].name, 'term 0');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('empty list', async function (assert) {
    assert.expect(2);
    const course = this.server.create('course');
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    this.set('course', courseModel);

    await render(
      hbs`<Course::ObjectiveList
        @editable={{true}}
        @course={{this.course}}
      />`
    );
    assert.notOk(component.sortIsVisible);
    assert.equal(component.text, '');
  });

  test('no "sort objectives" button in list with one item', async function (assert) {
    assert.expect(3);
    const course = this.server.create('course');
    this.server.create('course-objective', { course, position: 0 });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    this.set('course', courseModel);

    await render(
      hbs`<Course::ObjectiveList
        @editable={{true}}
        @course={{this.course}}
      />`
    );
    assert.notOk(component.sortIsVisible, 'Sort Objectives button is visible');
    assert.equal(component.objectives.length, 1);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
