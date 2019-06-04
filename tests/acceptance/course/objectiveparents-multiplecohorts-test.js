import {
  module,
  test
} from 'qunit';
import { setupAuthentication } from 'ilios-common';

import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import page from 'ilios-common/page-objects/course';

module('Acceptance | Course with multiple Cohorts - Objective Parents', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.user = await setupAuthentication();
    this.school = this.server.create('school');
    const program = this.server.create('program', { school: this.school });

    const programYears = this.server.createList('programYear', 2, { program });
    const cohort1 = this.server.create('cohort', { programYear: programYears[0]});
    const cohort2 = this.server.create('cohort', { programYear: programYears[1]});
    const competencies = this.server.createList('competency', 2, { school: this.school, programYears });

    const objective1 = this.server.create('objective', { programYears: [programYears[0]], competency: competencies[0] });
    this.server.create('objective', { programYears: [programYears[0]], competency: competencies[1] });

    this.server.create('objective', { programYears: [programYears[1]], competency: competencies[0] });
    const objective2 = this.server.create('objective', { programYears: [programYears[1]], competency: competencies[1] });

    const objective3 = this.server.create('objective', {
      parents: [objective1, objective2]
    });
    const objective4 = this.server.create('objective');
    this.server.create('course', {
      year: 2013,
      school: this.school,
      objectives: [objective3, objective4],
      cohorts: [cohort1, cohort2]
    });
  });

  test('list parent objectives by competency', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(33);

    await page.visit({ courseId: 1, details: true, courseObjectiveDetails: true });
    assert.equal(page.objectives.current.length, 2);

    assert.equal(page.objectives.current[0].description.text, 'objective 4');
    assert.equal(page.objectives.current[0].parents.length, 2);
    assert.equal(page.objectives.current[0].parents[0].description, 'objective 0');
    assert.equal(page.objectives.current[0].parents[1].description, 'objective 3');
    await page.objectives.current[0].manageParents();

    assert.equal(page.objectiveParentManager.title, 'objective 4');
    await page.objectiveParentManager.selectGroup(1);

    assert.equal(page.objectiveParentManager.groups.length, 2);
    assert.equal(page.objectiveParentManager.groups[0].title, 'program 0 cohort 0');
    assert.equal(page.objectiveParentManager.groups[0].value, '1');
    assert.equal(page.objectiveParentManager.groups[1].title, 'program 0 cohort 1');
    assert.equal(page.objectiveParentManager.groups[1].value, '2');

    assert.equal(page.objectiveParentManager.competencies.length, 2);
    assert.equal(page.objectiveParentManager.competencies[0].title, 'competency 0');
    assert.ok(page.objectiveParentManager.competencies[0].selected);
    assert.equal(page.objectiveParentManager.competencies[0].objectives.length, 1);
    assert.equal(page.objectiveParentManager.competencies[0].objectives[0].title, 'objective 0');
    assert.ok(page.objectiveParentManager.competencies[0].objectives[0].selected);

    assert.equal(page.objectiveParentManager.competencies[1].title, 'competency 1');
    assert.ok(page.objectiveParentManager.competencies[1].notSelected);
    assert.equal(page.objectiveParentManager.competencies[1].objectives.length, 1);
    assert.equal(page.objectiveParentManager.competencies[1].objectives[0].title, 'objective 1');
    assert.ok(page.objectiveParentManager.competencies[1].objectives[0].notSelected);

    await page.objectiveParentManager.selectGroup(2);

    assert.equal(page.objectiveParentManager.competencies.length, 2);
    assert.equal(page.objectiveParentManager.competencies[0].title, 'competency 0');
    assert.ok(page.objectiveParentManager.competencies[0].notSelected);
    assert.equal(page.objectiveParentManager.competencies[0].objectives.length, 1);
    assert.equal(page.objectiveParentManager.competencies[0].objectives[0].title, 'objective 2');
    assert.ok(page.objectiveParentManager.competencies[0].objectives[0].notSelected);

    assert.equal(page.objectiveParentManager.competencies[1].title, 'competency 1');
    assert.ok(page.objectiveParentManager.competencies[1].selected);
    assert.equal(page.objectiveParentManager.competencies[1].objectives.length, 1);
    assert.equal(page.objectiveParentManager.competencies[1].objectives[0].title, 'objective 3');
    assert.ok(page.objectiveParentManager.competencies[1].objectives[0].selected);
  });

  test('save changes', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(13);
    await page.visit({ courseId: 1, details: true, courseObjectiveDetails: true });
    assert.equal(page.objectives.current[0].description.text, 'objective 4');
    assert.equal(page.objectives.current[0].parents.length, 2);
    assert.equal(page.objectives.current[0].parents[0].description, 'objective 0');
    assert.equal(page.objectives.current[0].parents[1].description, 'objective 3');
    await page.objectives.current[0].manageParents();


    assert.equal(page.objectiveParentManager.title, 'objective 4');
    await page.objectiveParentManager.selectGroup(1);

    await page.objectiveParentManager.competencies[1].objectives[0].add();
    assert.ok(page.objectiveParentManager.competencies[0].objectives[0].notSelected);
    assert.ok(page.objectiveParentManager.competencies[1].objectives[0].selected);
    await page.objectiveParentManager.selectGroup(2);
    await page.objectiveParentManager.competencies[0].objectives[0].add();
    assert.ok(page.objectiveParentManager.competencies[0].objectives[0].selected);
    assert.ok(page.objectiveParentManager.competencies[1].objectives[0].notSelected);

    await page.objectives.save();

    assert.equal(page.objectives.current[0].description.text, 'objective 4');
    assert.equal(page.objectives.current[0].parents.length, 2);
    assert.equal(page.objectives.current[0].parents[0].description, 'objective 1');
    assert.equal(page.objectives.current[0].parents[1].description, 'objective 2');

  });

  test('cancel changes', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(13);
    await page.visit({ courseId: 1, details: true, courseObjectiveDetails: true });
    assert.equal(page.objectives.current[0].description.text, 'objective 4');
    assert.equal(page.objectives.current[0].parents.length, 2);
    assert.equal(page.objectives.current[0].parents[0].description, 'objective 0');
    assert.equal(page.objectives.current[0].parents[1].description, 'objective 3');
    await page.objectives.current[0].manageParents();


    assert.equal(page.objectiveParentManager.title, 'objective 4');
    await page.objectiveParentManager.selectGroup(1);

    await page.objectiveParentManager.competencies[1].objectives[0].add();
    assert.ok(page.objectiveParentManager.competencies[0].objectives[0].notSelected);
    assert.ok(page.objectiveParentManager.competencies[1].objectives[0].selected);
    await page.objectiveParentManager.selectGroup(2);
    await page.objectiveParentManager.competencies[0].objectives[0].add();
    assert.ok(page.objectiveParentManager.competencies[0].objectives[0].selected);
    assert.ok(page.objectiveParentManager.competencies[1].objectives[0].notSelected);

    await page.objectives.cancel();

    assert.equal(page.objectives.current[0].description.text, 'objective 4');
    assert.equal(page.objectives.current[0].parents.length, 2);
    assert.equal(page.objectives.current[0].parents[0].description, 'objective 0');
    assert.equal(page.objectives.current[0].parents[1].description, 'objective 3');
  });
});
