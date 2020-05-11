import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/course/objectives';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | course/objectives', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders and is accessible with a single cohort', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });
    const competencies = this.server.createList('competency', 2);
    const course = this.server.create('course', {
      cohorts: [cohort]
    });
    const objectivesInProgramYear1 = this.server.createList('objective', 3, { competency: competencies[0] });
    const objectivesInProgramYear2 = this.server.createList('objective', 2, { competency: competencies[1] });

    objectivesInProgramYear1.forEach(objective => {
      this.server.create('program-year-objective', { objective, programYear });
    });

    objectivesInProgramYear2.forEach(objective => {
      this.server.create('program-year-objective', { objective, programYear });
    });

    const objectiveInCourse1 = this.server.create('objective', { parents: [objectivesInProgramYear1[0]] });
    this.server.create('course-objective', { course, objective: objectiveInCourse1 });

    const objectiveInCourse2 = this.server.create('objective');
    this.server.create('course-objective', { course, objective: objectiveInCourse2 });
    this.server.createList('objective', 2, { competency: competencies[0] });
    this.server.createList('objective', 4, { competency: competencies[1] });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);

    this.set('course', courseModel);
    await render(hbs`<Course::Objectives
      @course={{this.course}}
      @editable={{true}}
      @collapse={{noop}}
      @expand={{noop}}
    />`);

    assert.equal(component.objectiveList.objectives.length, 2);
    assert.equal(component.objectiveList.objectives[0].description.text, 'objective 5');
    assert.equal(component.objectiveList.objectives[0].parents.list.length, 1);
    assert.equal(component.objectiveList.objectives[0].parents.list[0].text, 'objective 0');
    assert.ok(component.objectiveList.objectives[0].meshDescriptors.empty);

    assert.equal(component.objectiveList.objectives[1].description.text, 'objective 6');
    assert.ok(component.objectiveList.objectives[1].parents.empty);
    assert.ok(component.objectiveList.objectives[1].meshDescriptors.empty);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it loads data for a single cohort', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });
    const competencies = this.server.createList('competency', 2);
    const course = this.server.create('course', {
      cohorts: [cohort]
    });
    const objectivesInProgramYear1 = this.server.createList('objective', 3, { competency: competencies[0] });
    const objectivesInProgramYear2 = this.server.createList('objective', 2, { competency: competencies[1] });

    objectivesInProgramYear1.forEach(objective => {
      this.server.create('program-year-objective', { objective, programYear });
    });

    objectivesInProgramYear2.forEach(objective => {
      this.server.create('program-year-objective', { objective, programYear });
    });

    const objectiveInCourse = this.server.create('objective', { parents: [objectivesInProgramYear1[0]] });
    this.server.create('course-objective', { course, objective: objectiveInCourse });
    this.server.createList('objective', 2, { competency: competencies[0] });
    this.server.createList('objective', 4, { competency: competencies[1] });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);

    this.set('course', courseModel);
    await render(hbs`<Course::Objectives
      @course={{this.course}}
      @editable={{true}}
      @collapse={{noop}}
      @expand={{noop}}
    />`);

    assert.equal(component.objectiveList.objectives.length, 1);
    assert.equal(component.objectiveList.objectives[0].description.text, 'objective 5');
    assert.equal(component.objectiveList.objectives[0].parents.list.length, 1);
    await component.objectiveList.objectives[0].parents.list[0].manage();

    const m = component.objectiveList.objectives[0].parentManager;
    assert.notOk(m.hasMultipleCohorts);
    assert.equal(m.selectedCohortTitle, 'program 0 cohort 0');
    assert.equal(m.competencies.length, 2);
    assert.equal(m.competencies[0].title, 'competency 0');
    assert.ok(m.competencies[0].selected);

    assert.equal(m.competencies[0].objectives.length, 3);
    assert.equal(m.competencies[0].objectives[0].title, 'objective 0');
    assert.ok(m.competencies[0].objectives[0].selected);
    assert.equal(m.competencies[0].objectives[1].title, 'objective 1');
    assert.ok(m.competencies[0].objectives[1].notSelected);
    assert.equal(m.competencies[0].objectives[2].title, 'objective 2');
    assert.ok(m.competencies[0].objectives[2].notSelected);

    assert.equal(m.competencies[1].title, 'competency 1');
    assert.ok(m.competencies[1].notSelected);

    assert.equal(m.competencies[1].objectives.length, 2);
    assert.equal(m.competencies[1].objectives[0].title, 'objective 3');
    assert.ok(m.competencies[1].objectives[0].notSelected);
    assert.equal(m.competencies[1].objectives[1].title, 'objective 4');
    assert.ok(m.competencies[1].objectives[1].notSelected);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it loads data for multiple cohorts', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear1 = this.server.create('program-year', { program });
    const cohort1 = this.server.create('cohort', { programYear: programYear1 });

    const programYear2 = this.server.create('program-year', { program });
    const cohort2 = this.server.create('cohort', { programYear: programYear2 });

    const competencies = this.server.createList('competency', 2);
    const course = this.server.create('course', {
      cohorts: [cohort1, cohort2]
    });

    const objectivesInProgramYear1 = this.server.createList('objective', 2, { competency: competencies[0] });
    const objectivesInProgramYear2 = this.server.createList('objective', 2, { competency: competencies[1] });

    objectivesInProgramYear1.forEach(objective => {
      this.server.create('program-year-objective', { objective, programYear: programYear1 });
    });

    objectivesInProgramYear2.forEach(objective => {
      this.server.create('program-year-objective', { objective, programYear: programYear2 });
    });

    const objectiveInCourse = this.server.create('objective', { parents: [objectivesInProgramYear1[0]] });
    this.server.create('course-objective', { course, objective: objectiveInCourse });

    this.server.createList('objective', 2, { competency: competencies[0] });
    this.server.createList('objective', 4, { competency: competencies[1] });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);

    this.set('course', courseModel);
    await render(hbs`<Course::Objectives
      @course={{this.course}}
      @editable={{true}}
      @collapse={{noop}}
      @expand={{noop}}
    />`);

    assert.equal(component.objectiveList.objectives.length, 1);
    assert.equal(component.objectiveList.objectives[0].description.text, 'objective 4');
    assert.equal(component.objectiveList.objectives[0].parents.list.length, 1);
    await component.objectiveList.objectives[0].parents.list[0].manage();

    const m = component.objectiveList.objectives[0].parentManager;
    assert.ok(m.hasMultipleCohorts);
    assert.equal(m.selectedCohortTitle, 'program 0 cohort 0 program 0 cohort 1');
    assert.equal(m.selectedCohortId, '1');

    assert.equal(m.competencies.length, 1);
    assert.equal(m.competencies[0].title, 'competency 0');
    assert.ok(m.competencies[0].selected);

    assert.equal(m.competencies[0].objectives.length, 2);
    assert.equal(m.competencies[0].objectives[0].title, 'objective 0');
    assert.ok(m.competencies[0].objectives[0].selected);
    assert.equal(m.competencies[0].objectives[1].title, 'objective 1');
    assert.ok(m.competencies[0].objectives[1].notSelected);

    await m.selectCohort(2);
    assert.equal(m.selectedCohortId, '2');
    assert.equal(m.competencies[0].title, 'competency 1');
    assert.ok(m.competencies[0].notSelected);

    assert.equal(m.competencies[0].objectives.length, 2);
    assert.equal(m.competencies[0].objectives[0].title, 'objective 2');
    assert.ok(m.competencies[0].objectives[0].notSelected);
    assert.equal(m.competencies[0].objectives[1].title, 'objective 3');
    assert.ok(m.competencies[0].objectives[1].notSelected);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('deleting objective', async function (assert) {
    const course = this.server.create('course');
    const objective = this.server.create('objective');
    this.server.create('course-objective', { course, objective });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);

    this.set('course', courseModel);
    await render(hbs`<Course::Objectives
      @course={{this.course}}
      @editable={{true}}
      @collapse={{noop}}
      @expand={{noop}}
    />`);

    assert.equal(component.objectiveList.objectives.length, 1);
    assert.equal(component.title, 'Objectives (1)');
    await component.objectiveList.objectives[0].remove();
    await component.objectiveList.objectives[0].confirmRemoval.confirm();
    assert.equal(component.objectiveList.objectives.length, 0);
    assert.equal(component.title, 'Objectives (0)');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
