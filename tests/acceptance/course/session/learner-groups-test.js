import { currentRouteName } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import page from 'ilios-common/page-objects/session';

module('Acceptance | Session - Learner Groups', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
  });

  module('With Fixtures', function (hooks2) {
    hooks2.beforeEach(async function () {
      this.program = this.server.create('program', {
        school: this.school
      });
      const programYear = this.server.create('programYear', {
        program: this.program
      });
      this.server.create('cohort', {
        programYear
      });
      this.server.create('course', {
        school: this.school,
        cohortIds: [1],
      });
      this.server.create('sessionType');
      this.server.createList('learnerGroup', 5, {
        cohortId: 1
      });
      this.server.createList('learnerGroup', 2, {
        cohortId: 1,
        parentId: 4
      });
      this.server.create('learnerGroup', {
        cohortId: 1,
        parentId: 5
      });
      this.server.create('session', {
        courseId: 1,
      });
      this.server.createList('user', 2);
      this.server.create('user', { firstName: 'joe', lastName: 'shmoe', middleName: 'unassigned' });
    });

    test('initial selected learner groups', async function(assert) {
      this.server.create('ilmSession', {
        sessionId: 1,
        learnerGroupIds: [1, 2, 4],
        learnerIds: [2, 3]
      });

      await page.visit({ courseId: 1, sessionId: 1 });

      assert.equal(currentRouteName(), 'session.index');

      const { detailLearnerList, detailLearnergroupsList } = page.detailLearnersAndLearnerGroups;
      assert.equal(detailLearnerList.learners.length, 2);
      assert.equal(detailLearnerList.learners[0].userNameInfo.fullName, '1 guy M. Mc1son');
      assert.equal(detailLearnerList.learners[1].userNameInfo.fullName, '2 guy M. Mc2son');
      assert.equal(detailLearnergroupsList.trees.length, 3);
      assert.equal(detailLearnergroupsList.trees[0].title, 'learner group 0 (program 0 cohort 0)');
      assert.equal(detailLearnergroupsList.trees[1].title, 'learner group 1 (program 0 cohort 0)');
      assert.equal(detailLearnergroupsList.trees[2].title, 'learner group 3 (program 0 cohort 0)');
      assert.equal(detailLearnergroupsList.trees[0].subgroups.length, 1);
      assert.equal(detailLearnergroupsList.trees[0].subgroups[0].title, 'learner group 0 (0)');
      assert.equal(detailLearnergroupsList.trees[1].subgroups.length, 1);
      assert.equal(detailLearnergroupsList.trees[1].subgroups[0].title, 'learner group 1 (0)');
      assert.equal(detailLearnergroupsList.trees[2].subgroups.length, 1);
      assert.equal(detailLearnergroupsList.trees[2].subgroups[0].title, 'learner group 3 (0)');
    });

    test('manager display', async function(assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('ilmSession', {
        sessionId: 1,
        learnerGroupIds: [1, 2, 4],
        learnerIds: [2, 3]
      });

      await page.visit({ courseId: 1, sessionId: 1 });

      assert.equal(currentRouteName(), 'session.index');

      await page.detailLearnersAndLearnerGroups.manage();

      const { learnerSelectionManager, learnergroupSelectionManager } = page.detailLearnersAndLearnerGroups;
      assert.equal(learnerSelectionManager.selectedLearners.detailLearnerList.learners.length, 2);
      assert.equal(
        learnerSelectionManager.selectedLearners.detailLearnerList.learners[0].userNameInfo.fullName,
        '1 guy M. Mc1son'
      );
      assert.equal(
        learnerSelectionManager.selectedLearners.detailLearnerList.learners[1].userNameInfo.fullName,
        '2 guy M. Mc2son'
      );
      assert.equal(learnergroupSelectionManager.selectedGroups.list.trees.length, 3);
      assert.equal(
        learnergroupSelectionManager.selectedGroups.list.trees[0].title,
        'learner group 0 (program 0 cohort 0)'
      );
      assert.equal(learnergroupSelectionManager.selectedGroups.list.trees[0].subgroups.length, 1);
      assert.equal(learnergroupSelectionManager.selectedGroups.list.trees[0].subgroups[0].title,
        'learner group 0 (0)'
      );
      assert.equal(
        learnergroupSelectionManager.selectedGroups.list.trees[1].title,
        'learner group 1 (program 0 cohort 0)'
      );
      assert.equal(learnergroupSelectionManager.selectedGroups.list.trees[1].subgroups.length, 1);
      assert.equal(learnergroupSelectionManager.selectedGroups.list.trees[1].subgroups[0].title,
        'learner group 1 (0)'
      );
      assert.equal(
        learnergroupSelectionManager.selectedGroups.list.trees[2].title,
        'learner group 3 (program 0 cohort 0)'
      );
      assert.equal(learnergroupSelectionManager.selectedGroups.list.trees[2].subgroups.length, 1);
      assert.equal(learnergroupSelectionManager.selectedGroups.list.trees[2].subgroups[0].title,
        'learner group 3 (0)'
      );
      assert.equal(learnergroupSelectionManager.availableGroups.cohorts.length, 1);
      assert.equal(learnergroupSelectionManager.availableGroups.cohorts[0].trees.length, 5);
      assert.equal(learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].title, 'learner group 0');
      assert.ok(learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].isHidden);
      assert.equal(learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups.length, 0);
      assert.equal(learnergroupSelectionManager.availableGroups.cohorts[0].trees[1].title, 'learner group 1');
      assert.ok(learnergroupSelectionManager.availableGroups.cohorts[0].trees[1].isHidden);
      assert.equal(learnergroupSelectionManager.availableGroups.cohorts[0].trees[1].subgroups.length, 0);
      assert.equal(learnergroupSelectionManager.availableGroups.cohorts[0].trees[2].title, 'learner group 2');
      assert.notOk(learnergroupSelectionManager.availableGroups.cohorts[0].trees[2].isHidden);
      assert.equal(learnergroupSelectionManager.availableGroups.cohorts[0].trees[2].subgroups.length, 0);
      assert.equal(learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].title, 'learner group 3');
      assert.notOk(learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].isHidden);
      assert.equal(learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].subgroups.length, 2);
      assert.equal(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].subgroups[0].title,
        'learner group 5'
      );
      assert.equal(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].subgroups[1].title,
        'learner group 6'
      );
      assert.notOk(learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].subgroups[0].isHidden);
      assert.notOk(learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].subgroups[1].isHidden);
      assert.equal(learnergroupSelectionManager.availableGroups.cohorts[0].trees[4].title, 'learner group 4');
      assert.notOk(learnergroupSelectionManager.availableGroups.cohorts[0].trees[4].isHidden);
      assert.equal(learnergroupSelectionManager.availableGroups.cohorts[0].trees[4].subgroups.length, 1);
      assert.equal(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[4].subgroups[0].title,
        'learner group 7'
      );
      assert.notOk(learnergroupSelectionManager.availableGroups.cohorts[0].trees[4].subgroups[0].isHidden);
    });

    test('learner group manager display with no selected groups or learners', async function(assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('ilmSession', {
        sessionId: 1,
        learnerGroupIds: [],
        learnerIds: [],
      });

      await page.visit({ courseId: 1, sessionId: 1 });

      assert.equal(currentRouteName(), 'session.index');

      await page.detailLearnersAndLearnerGroups.manage();

      const { learnerSelectionManager, learnergroupSelectionManager } = page.detailLearnersAndLearnerGroups;
      assert.equal(learnerSelectionManager.selectedLearners.noLearners.text, 'None');
      assert.equal(learnergroupSelectionManager.selectedGroups.noGroups.text, 'None');
      assert.equal(learnergroupSelectionManager.availableGroups.cohorts.length, 1);
      assert.equal(learnergroupSelectionManager.availableGroups.cohorts[0].trees.length, 5);
      assert.equal(learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].title, 'learner group 0');
      assert.notOk(learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].isHidden);
      assert.equal(learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].subgroups.length, 0);
      assert.equal(learnergroupSelectionManager.availableGroups.cohorts[0].trees[1].title, 'learner group 1');
      assert.notOk(learnergroupSelectionManager.availableGroups.cohorts[0].trees[1].isHidden);
      assert.equal(learnergroupSelectionManager.availableGroups.cohorts[0].trees[1].subgroups.length, 0);
      assert.equal(learnergroupSelectionManager.availableGroups.cohorts[0].trees[2].title, 'learner group 2');
      assert.notOk(learnergroupSelectionManager.availableGroups.cohorts[0].trees[2].isHidden);
      assert.equal(learnergroupSelectionManager.availableGroups.cohorts[0].trees[2].subgroups.length, 0);
      assert.equal(learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].title, 'learner group 3');
      assert.notOk(learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].isHidden);
      assert.equal(learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].subgroups.length, 2);
      assert.equal(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].subgroups[0].title,
        'learner group 5'
      );
      assert.equal(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].subgroups[1].title,
        'learner group 6'
      );
      assert.notOk(learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].subgroups[0].isHidden);
      assert.notOk(learnergroupSelectionManager.availableGroups.cohorts[0].trees[3].subgroups[1].isHidden);
      assert.equal(learnergroupSelectionManager.availableGroups.cohorts[0].trees[4].title, 'learner group 4');
      assert.notOk(learnergroupSelectionManager.availableGroups.cohorts[0].trees[4].isHidden);
      assert.equal(learnergroupSelectionManager.availableGroups.cohorts[0].trees[4].subgroups.length, 1);
      assert.equal(
        learnergroupSelectionManager.availableGroups.cohorts[0].trees[4].subgroups[0].title,
        'learner group 7'
      );
      assert.notOk(learnergroupSelectionManager.availableGroups.cohorts[0].trees[4].subgroups[0].isHidden);
    });

    test('filter learner groups by top group should include all subgroups', async function(assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('ilmSession', {
        sessionId: 1,
        learnerGroupIds: [1, 2, 4]
      });

      await page.visit({ courseId: 1, sessionId: 1 });

      assert.equal(currentRouteName(), 'session.index');
      assert.equal(page.detailLearnersAndLearnerGroups.detailLearnergroupsList.trees.length, 3);

      await page.detailLearnersAndLearnerGroups.manage();

      const { selectedGroups, availableGroups } = page.detailLearnersAndLearnerGroups.learnergroupSelectionManager;

      assert.equal(selectedGroups.list.trees.length, 3);
      assert.equal(selectedGroups.list.trees[0].title, 'learner group 0 (program 0 cohort 0)');
      assert.equal(selectedGroups.list.trees[1].title, 'learner group 1 (program 0 cohort 0)');
      assert.equal(selectedGroups.list.trees[2].title, 'learner group 3 (program 0 cohort 0)');

      await availableGroups.search('3');

      assert.equal(availableGroups.cohorts.length, 1);
      assert.equal(availableGroups.cohorts[0].title, 'program 0 cohort 0');
      assert.equal(availableGroups.cohorts[0].trees.length, 5);
      assert.equal(availableGroups.cohorts[0].trees[0].title, 'learner group 0');
      assert.ok(availableGroups.cohorts[0].trees[0].isDisabled);
      assert.ok(availableGroups.cohorts[0].trees[0].isHidden);
      assert.equal(availableGroups.cohorts[0].trees[1].title, 'learner group 1');
      assert.ok(availableGroups.cohorts[0].trees[1].isDisabled);
      assert.ok(availableGroups.cohorts[0].trees[1].isHidden);
      assert.equal(availableGroups.cohorts[0].trees[2].title, 'learner group 2');
      assert.notOk(availableGroups.cohorts[0].trees[2].isDisabled);
      assert.ok(availableGroups.cohorts[0].trees[2].isHidden);
      assert.equal(availableGroups.cohorts[0].trees[3].title, 'learner group 3');
      assert.notOk(availableGroups.cohorts[0].trees[3].isDisabled);
      assert.notOk(availableGroups.cohorts[0].trees[3].isHidden);
      assert.equal(availableGroups.cohorts[0].trees[3].subgroups.length, 2);
      assert.equal(availableGroups.cohorts[0].trees[3].subgroups[0].title, 'learner group 5');
      assert.equal(availableGroups.cohorts[0].trees[3].subgroups[1].title, 'learner group 6');
      assert.equal(availableGroups.cohorts[0].trees[4].title, 'learner group 4');
      assert.notOk(availableGroups.cohorts[0].trees[4].isDisabled);
      assert.ok(availableGroups.cohorts[0].trees[4].isHidden);
    });

    test('filter learner groups by subgroup should include top group', async function(assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('ilmSession', {
        sessionId: 1,
        learnerGroupIds: [1, 2, 4]
      });

      await page.visit({ courseId: 1, sessionId: 1 });

      assert.equal(currentRouteName(), 'session.index');
      assert.equal(page.detailLearnersAndLearnerGroups.detailLearnergroupsList.trees.length, 3);

      await page.detailLearnersAndLearnerGroups.manage();

      const { selectedGroups, availableGroups } = page.detailLearnersAndLearnerGroups.learnergroupSelectionManager;

      assert.equal(selectedGroups.list.trees.length, 3);
      assert.equal(selectedGroups.list.trees[0].title, 'learner group 0 (program 0 cohort 0)');
      assert.equal(selectedGroups.list.trees[1].title, 'learner group 1 (program 0 cohort 0)');
      assert.equal(selectedGroups.list.trees[2].title, 'learner group 3 (program 0 cohort 0)');

      await availableGroups.search('5');

      assert.equal(availableGroups.cohorts.length, 1);
      assert.equal(availableGroups.cohorts[0].title, 'program 0 cohort 0');
      assert.equal(availableGroups.cohorts[0].trees.length, 5);
      assert.equal(availableGroups.cohorts[0].trees[0].title, 'learner group 0');
      assert.ok(availableGroups.cohorts[0].trees[0].isDisabled);
      assert.ok(availableGroups.cohorts[0].trees[0].isHidden);
      assert.equal(availableGroups.cohorts[0].trees[1].title, 'learner group 1');
      assert.ok(availableGroups.cohorts[0].trees[1].isDisabled);
      assert.ok(availableGroups.cohorts[0].trees[1].isHidden);
      assert.equal(availableGroups.cohorts[0].trees[2].title, 'learner group 2');
      assert.notOk(availableGroups.cohorts[0].trees[2].isDisabled);
      assert.ok(availableGroups.cohorts[0].trees[2].isHidden);
      assert.equal(availableGroups.cohorts[0].trees[3].title, 'learner group 3');
      assert.notOk(availableGroups.cohorts[0].trees[3].isDisabled);
      assert.notOk(availableGroups.cohorts[0].trees[3].isHidden);
      assert.equal(availableGroups.cohorts[0].trees[3].subgroups.length, 2);
      assert.equal(availableGroups.cohorts[0].trees[3].subgroups[0].title, 'learner group 5');
      assert.equal(availableGroups.cohorts[0].trees[3].subgroups[1].title, 'learner group 6');
      assert.equal(availableGroups.cohorts[0].trees[4].title, 'learner group 4');
      assert.notOk(availableGroups.cohorts[0].trees[4].isDisabled);
      assert.ok(availableGroups.cohorts[0].trees[4].isHidden);
    });

    test('add learner group', async function(assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('ilmSession', {
        sessionId: 1,
        learnerGroupIds: [1, 2, 4]
      });

      await page.visit({ courseId: 1, sessionId: 1 });

      assert.equal(currentRouteName(), 'session.index');
      assert.equal(page.detailLearnersAndLearnerGroups.detailLearnergroupsList.trees.length, 3);

      await page.detailLearnersAndLearnerGroups.manage();

      const { selectedGroups, availableGroups } = page.detailLearnersAndLearnerGroups.learnergroupSelectionManager;

      assert.equal(selectedGroups.list.trees.length, 3);

      await availableGroups.cohorts[0].trees[2].add();
      await availableGroups.cohorts[0].trees[3].subgroups[0].add();

      assert.equal(selectedGroups.list.trees.length, 4);
      assert.equal(selectedGroups.list.trees[0].title, 'learner group 0 (program 0 cohort 0)');
      assert.equal(selectedGroups.list.trees[1].title, 'learner group 1 (program 0 cohort 0)');
      assert.equal(selectedGroups.list.trees[2].title, 'learner group 2 (program 0 cohort 0)');
      assert.equal(selectedGroups.list.trees[3].title, 'learner group 3 (program 0 cohort 0)');

      await page.detailLearnersAndLearnerGroups.save();

      const { detailLearnergroupsList } = page.detailLearnersAndLearnerGroups;
      assert.equal(detailLearnergroupsList.trees.length, 4);
      assert.equal(detailLearnergroupsList.trees[0].title, 'learner group 0 (program 0 cohort 0)');
      assert.equal(detailLearnergroupsList.trees[1].title, 'learner group 1 (program 0 cohort 0)');
      assert.equal(detailLearnergroupsList.trees[2].title, 'learner group 2 (program 0 cohort 0)');
      assert.equal(detailLearnergroupsList.trees[3].title, 'learner group 3 (program 0 cohort 0)');
    });

    test('add learner sub group', async function(assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('ilmSession', {
        sessionId: 1,
        learnerGroupIds: [1, 2, 4]
      });

      await page.visit({ courseId: 1, sessionId: 1 });

      assert.equal(currentRouteName(), 'session.index');
      assert.equal(page.detailLearnersAndLearnerGroups.detailLearnergroupsList.trees.length, 3);

      await page.detailLearnersAndLearnerGroups.manage();

      const { selectedGroups, availableGroups } = page.detailLearnersAndLearnerGroups.learnergroupSelectionManager;

      assert.equal(selectedGroups.list.trees.length, 3);
      assert.equal(selectedGroups.list.trees[2].subgroups.length, 1);
      assert.equal(selectedGroups.list.trees[2].subgroups[0].title, 'learner group 3 (0)');
      assert.ok(selectedGroups.list.trees[2].subgroups[0].isTopLevel);

      await availableGroups.cohorts[0].trees[3].subgroups[0].add();

      assert.equal(selectedGroups.list.trees.length, 3);
      assert.equal(selectedGroups.list.trees[0].title, 'learner group 0 (program 0 cohort 0)');
      assert.equal(selectedGroups.list.trees[1].title, 'learner group 1 (program 0 cohort 0)');
      assert.equal(selectedGroups.list.trees[2].title, 'learner group 3 (program 0 cohort 0)');
      assert.equal(selectedGroups.list.trees[2].subgroups.length, 2);
      assert.equal(selectedGroups.list.trees[2].subgroups[0].title, 'learner group 3 (0)');
      assert.equal(selectedGroups.list.trees[2].subgroups[1].title, 'learner group 5 (0)');

      await page.detailLearnersAndLearnerGroups.save();

      const { detailLearnergroupsList } = page.detailLearnersAndLearnerGroups;
      assert.equal(detailLearnergroupsList.trees.length, 3);
      assert.equal(detailLearnergroupsList.trees[0].title, 'learner group 0 (program 0 cohort 0)');
      assert.equal(detailLearnergroupsList.trees[1].title, 'learner group 1 (program 0 cohort 0)');
      assert.equal(detailLearnergroupsList.trees[2].title, 'learner group 3 (program 0 cohort 0)');
      assert.equal(detailLearnergroupsList.trees[2].subgroups.length, 2);
      assert.equal(detailLearnergroupsList.trees[2].subgroups[0].title, 'learner group 3 (0)');
      assert.ok(detailLearnergroupsList.trees[2].subgroups[0].isTopLevel);
      assert.equal(detailLearnergroupsList.trees[2].subgroups[1].title, 'learner group 5 (0)');
      assert.notOk(detailLearnergroupsList.trees[2].subgroups[1].isTopLevel);
    });

    test('add learner group with children', async function(assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('ilmSession', {
        sessionId: 1,
        learnerGroupIds: [1, 2, 4]
      });

      await page.visit({ courseId: 1, sessionId: 1 });

      assert.equal(currentRouteName(), 'session.index');
      assert.equal(page.detailLearnersAndLearnerGroups.detailLearnergroupsList.trees.length, 3);

      await page.detailLearnersAndLearnerGroups.manage();

      const { selectedGroups, availableGroups } = page.detailLearnersAndLearnerGroups.learnergroupSelectionManager;

      assert.equal(selectedGroups.list.trees.length, 3);
      assert.equal(selectedGroups.list.trees[2].subgroups.length, 1);
      assert.equal(selectedGroups.list.trees[2].subgroups[0].title, 'learner group 3 (0)');
      assert.ok(selectedGroups.list.trees[2].subgroups[0].isTopLevel);

      await availableGroups.cohorts[0].trees[3].add();

      assert.ok(availableGroups.cohorts[0].trees[3].isDisabled);
      assert.ok(availableGroups.cohorts[0].trees[3].isHidden);

      assert.equal(selectedGroups.list.trees.length, 3);
      assert.equal(selectedGroups.list.trees[0].title, 'learner group 0 (program 0 cohort 0)');
      assert.equal(selectedGroups.list.trees[1].title, 'learner group 1 (program 0 cohort 0)');
      assert.equal(selectedGroups.list.trees[2].title, 'learner group 3 (program 0 cohort 0)');
      assert.equal(selectedGroups.list.trees[2].subgroups.length, 3);
      assert.equal(selectedGroups.list.trees[2].subgroups[0].title, 'learner group 3 (0)');
      assert.equal(selectedGroups.list.trees[2].subgroups[1].title, 'learner group 5 (0)');
      assert.equal(selectedGroups.list.trees[2].subgroups[2].title, 'learner group 6 (0)');

      await page.detailLearnersAndLearnerGroups.save();

      const { detailLearnergroupsList } = page.detailLearnersAndLearnerGroups;
      assert.equal(detailLearnergroupsList.trees.length, 3);
      assert.equal(detailLearnergroupsList.trees[0].title, 'learner group 0 (program 0 cohort 0)');
      assert.equal(detailLearnergroupsList.trees[1].title, 'learner group 1 (program 0 cohort 0)');
      assert.equal(detailLearnergroupsList.trees[2].title, 'learner group 3 (program 0 cohort 0)');
      assert.equal(detailLearnergroupsList.trees[2].subgroups.length, 3);
      assert.equal(detailLearnergroupsList.trees[2].subgroups[0].title, 'learner group 3 (0)');
      assert.ok(detailLearnergroupsList.trees[2].subgroups[0].isTopLevel);
      assert.equal(detailLearnergroupsList.trees[2].subgroups[1].title, 'learner group 5 (0)');
      assert.notOk(detailLearnergroupsList.trees[2].subgroups[1].isTopLevel);
      assert.equal(detailLearnergroupsList.trees[2].subgroups[2].title, 'learner group 6 (0)');
      assert.notOk(detailLearnergroupsList.trees[2].subgroups[2].isTopLevel);
    });

    test('add learner group with children and remove one child', async function(assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('ilmSession', {
        sessionId: 1,
        learnerGroupIds: [1, 2, 4]
      });

      await page.visit({ courseId: 1, sessionId: 1 });

      assert.equal(currentRouteName(), 'session.index');
      assert.equal(page.detailLearnersAndLearnerGroups.detailLearnergroupsList.trees.length, 3);

      await page.detailLearnersAndLearnerGroups.manage();

      const { selectedGroups, availableGroups } = page.detailLearnersAndLearnerGroups.learnergroupSelectionManager;

      assert.equal(selectedGroups.list.trees.length, 3);
      assert.equal(selectedGroups.list.trees[2].subgroups[0].title, 'learner group 3 (0)');
      assert.ok(selectedGroups.list.trees[2].subgroups[0].isTopLevel);
      assert.equal(selectedGroups.list.trees[2].subgroups.length, 1);

      await availableGroups.cohorts[0].trees[3].add();
      await selectedGroups.list.trees[2].subgroups[1].remove();

      assert.notOk(availableGroups.cohorts[0].trees[3].isDisabled);
      assert.notOk(availableGroups.cohorts[0].trees[3].isHidden);

      assert.equal(selectedGroups.list.trees.length, 3);
      assert.equal(selectedGroups.list.trees[0].title, 'learner group 0 (program 0 cohort 0)');
      assert.equal(selectedGroups.list.trees[1].title, 'learner group 1 (program 0 cohort 0)');
      assert.equal(selectedGroups.list.trees[2].title, 'learner group 3 (program 0 cohort 0)');
      assert.equal(selectedGroups.list.trees[2].subgroups.length, 2);
      assert.equal(selectedGroups.list.trees[2].subgroups[0].title, 'learner group 3 (0)');
      assert.equal(selectedGroups.list.trees[2].subgroups[1].title, 'learner group 6 (0)');

      await page.detailLearnersAndLearnerGroups.save();

      const { detailLearnergroupsList } = page.detailLearnersAndLearnerGroups;
      assert.equal(detailLearnergroupsList.trees.length, 3);
      assert.equal(detailLearnergroupsList.trees[0].title, 'learner group 0 (program 0 cohort 0)');
      assert.equal(detailLearnergroupsList.trees[1].title, 'learner group 1 (program 0 cohort 0)');
      assert.equal(detailLearnergroupsList.trees[2].title, 'learner group 3 (program 0 cohort 0)');
      assert.equal(detailLearnergroupsList.trees[2].subgroups.length, 2);
      assert.equal(detailLearnergroupsList.trees[2].subgroups[0].title, 'learner group 3 (0)');
      assert.ok(detailLearnergroupsList.trees[2].subgroups[0].isTopLevel);
      assert.equal(detailLearnergroupsList.trees[2].subgroups[1].title, 'learner group 6 (0)');
      assert.notOk(detailLearnergroupsList.trees[2].subgroups[1].isTopLevel);
    });

    test('undo learner group change', async function(assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('ilmSession', {
        sessionId: 1,
        learnerGroupIds: [1, 2, 4]
      });

      await page.visit({ courseId: 1, sessionId: 1 });

      assert.equal(currentRouteName(), 'session.index');
      assert.equal(page.detailLearnersAndLearnerGroups.detailLearnergroupsList.trees.length, 3);

      await page.detailLearnersAndLearnerGroups.manage();

      const { selectedGroups, availableGroups } = page.detailLearnersAndLearnerGroups.learnergroupSelectionManager;

      await availableGroups.cohorts[0].trees[2].add();
      await availableGroups.cohorts[0].trees[3].add();
      await selectedGroups.list.trees[3].subgroups[1].remove();

      await page.detailLearnersAndLearnerGroups.cancel();

      const { detailLearnergroupsList } = page.detailLearnersAndLearnerGroups;
      assert.equal(detailLearnergroupsList.trees.length, 3);

      assert.equal(detailLearnergroupsList.trees[0].title, 'learner group 0 (program 0 cohort 0)');
      assert.equal(detailLearnergroupsList.trees[1].title, 'learner group 1 (program 0 cohort 0)');
      assert.equal(detailLearnergroupsList.trees[2].title, 'learner group 3 (program 0 cohort 0)');
      assert.equal(detailLearnergroupsList.trees[2].subgroups.length, 1);
      assert.equal(detailLearnergroupsList.trees[2].subgroups[0].title, 'learner group 3 (0)');
      assert.ok(detailLearnergroupsList.trees[2].subgroups[0].isTopLevel);
    });

    test('add learner', async function(assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('ilmSession', {
        sessionId: 1,
        learnerIds: [2, 3]
      });

      await page.visit({ courseId: 1, sessionId: 1 });

      assert.equal(currentRouteName(), 'session.index');

      assert.equal(page.detailLearnersAndLearnerGroups.detailLearnerList.learners.length, 2);

      await page.detailLearnersAndLearnerGroups.manage();

      const { learnerSelectionManager } = page.detailLearnersAndLearnerGroups;

      await learnerSelectionManager.search('shmoe');

      assert.equal(learnerSelectionManager.searchResults.length, 1);

      await learnerSelectionManager.searchResults[0].add();

      assert.equal(learnerSelectionManager.selectedLearners.detailLearnerList.learners.length, 3);

      await page.detailLearnersAndLearnerGroups.save();

      assert.equal(page.detailLearnersAndLearnerGroups.detailLearnerList.learners.length, 3);
      assert.equal(page.detailLearnersAndLearnerGroups.detailLearnerList.learners[0].userNameInfo.fullName, '1 guy M. Mc1son');
      assert.equal(page.detailLearnersAndLearnerGroups.detailLearnerList.learners[1].userNameInfo.fullName, '2 guy M. Mc2son');
      assert.equal(page.detailLearnersAndLearnerGroups.detailLearnerList.learners[2].userNameInfo.fullName, 'joe u. shmoe');

    });

    test('remove learner', async function(assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('ilmSession', {
        sessionId: 1,
        learnerIds: [2, 3]
      });

      await page.visit({ courseId: 1, sessionId: 1 });

      assert.equal(currentRouteName(), 'session.index');
      assert.equal(page.detailLearnersAndLearnerGroups.detailLearnerList.learners.length, 2);

      await page.detailLearnersAndLearnerGroups.manage();

      const { selectedLearners } = page.detailLearnersAndLearnerGroups.learnerSelectionManager;

      assert.equal(selectedLearners.detailLearnerList.learners.length, 2);

      await selectedLearners.detailLearnerList.learners[0].remove();

      assert.equal(selectedLearners.detailLearnerList.learners.length, 1);

      await page.detailLearnersAndLearnerGroups.save();

      assert.equal(page.detailLearnersAndLearnerGroups.detailLearnerList.learners.length, 1);
    });

    test('undo learner change', async function(assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('ilmSession', {
        sessionId: 1,
        learnerIds: [2, 3]
      });

      await page.visit({ courseId: 1, sessionId: 1 });

      assert.equal(currentRouteName(), 'session.index');
      assert.equal(page.detailLearnersAndLearnerGroups.detailLearnerList.learners.length, 2);

      await page.detailLearnersAndLearnerGroups.manage();

      const { selectedLearners } = page.detailLearnersAndLearnerGroups.learnerSelectionManager;

      assert.equal(selectedLearners.detailLearnerList.learners.length, 2);

      await selectedLearners.detailLearnerList.learners[0].remove();

      assert.equal(selectedLearners.detailLearnerList.learners.length, 1);

      await page.detailLearnersAndLearnerGroups.cancel();

      assert.equal(page.detailLearnersAndLearnerGroups.detailLearnerList.learners.length, 2);
    });
  });

  test('initial state with save works as expected #1773', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('sessionType');
    this.server.create('program', {
      school: this.school
    });
    this.server.create('programYear', {
      programId: 1
    });
    this.server.create('cohort', {
      programYearId: 1
    });
    this.server.create('course', {
      school: this.school,
      cohortIds: [1],
    });
    this.server.createList('learnerGroup', 2, {
      cohortId: 1
    });
    this.server.create('session', {
      courseId: 1,
    });
    this.server.create('ilmSession', {
      sessionId: 1,
    });
    await page.visit({ courseId: 1, sessionId: 1 });
    await page.detailLearnersAndLearnerGroups.manage();
    await page.detailLearnersAndLearnerGroups.learnergroupSelectionManager.availableGroups.cohorts[0].trees[0].add();
    await page.detailLearnersAndLearnerGroups.save();

    const { detailLearnergroupsList } = page.detailLearnersAndLearnerGroups;
    assert.equal(detailLearnergroupsList.trees.length, 1);
    assert.equal(detailLearnergroupsList.trees[0].title, 'learner group 0 (program 0 cohort 0)');
    assert.equal(detailLearnergroupsList.trees[0].subgroups.length, 1);
    assert.equal(detailLearnergroupsList.trees[0].subgroups[0].title, 'learner group 0 (0)');
    assert.ok(detailLearnergroupsList.trees[0].subgroups[0].isTopLevel);
  });
});
