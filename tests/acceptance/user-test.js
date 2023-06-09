import { click, fillIn, currentURL, triggerEvent, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';

import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'ilios/tests/pages/user';
import percySnapshot from '@percy/ember';

module('Acceptance | User', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    const userObject = {
      id: 100,
      campusId: '123',
      email: 'user@example.edu',
      phone: '111-111-1111',
      primaryCohortId: 1,
      cohortIds: [1, 2, 3],
      learnerGroupIds: [3, 5],
      administeredSchools: [this.school],
      school: this.school,
    };
    this.server.create('program', { school: this.school });
    this.server.createList('programYear', 3, { programId: 1 });
    this.cohort1 = this.server.create('cohort', { title: 'Medicine', programYearId: 1 });
    this.cohort2 = this.server.create('cohort', { programYearId: 2 });
    this.cohort3 = this.server.create('cohort', { programYearId: 3 });
    this.server.createList('learnerGroup', 5, { title: 'Group 1', cohortId: 1 });
    await setupAuthentication(userObject);
  });

  test('can search for users', async function (assert) {
    assert.expect(4);
    this.server.createList('user', 20, { email: 'user@example.edu', school: this.school });
    this.server.createList('authentication', 20);

    const userSearch = '.user-search input';
    const secondResult = '.user-search .results li:nth-of-type(3)';
    const secondResultUsername = `${secondResult} .name`;
    const secondResultEmail = `${secondResult} .email`;
    const name = '.user-display-name';

    await visit('/users/100');
    await percySnapshot(assert);
    await fillIn(userSearch, 'son');
    await triggerEvent(userSearch, 'keyup');
    await percySnapshot(assert);
    assert.dom(secondResultUsername).hasText('1 guy M. Mc1son', 'user name is correct');
    assert.dom(secondResultEmail).hasText('user@example.edu', 'user email is correct');

    await click(secondResultUsername);
    assert.strictEqual(currentURL(), '/users/2', 'new user profile is shown');
    assert.dom(name).hasText('1 guy M. Mc1son', 'user name is shown');
  });

  test('User roles display', async function (assert) {
    assert.expect(22);
    const studentRole = this.server.create('user-role', {
      title: 'Student',
    });
    const formerStudentRole = this.server.create('user-role', {
      title: 'Former Student',
    });
    const user1 = this.server.create('user', {
      enabled: true,
      userSyncIgnore: true,
      roles: [studentRole, formerStudentRole],
      school: this.school,
    });
    const user2 = this.server.create('user', {
      enabled: false,
      userSyncIgnore: false,
      school: this.school,
    });
    await page.visit({ userId: user1.id });
    await percySnapshot(assert);
    assert.strictEqual(page.roles.student.value, 'Yes');
    assert.strictEqual(page.roles.student.label, 'Student:');
    assert.strictEqual(page.roles.formerStudent.value, 'Yes');
    assert.strictEqual(page.roles.formerStudent.label, 'Former Student:');
    assert.strictEqual(page.roles.enabled.value, 'Yes');
    assert.strictEqual(page.roles.enabled.label, 'Account Enabled:');
    assert.strictEqual(page.roles.excludeFromSync.value, 'Yes');
    assert.strictEqual(page.roles.excludeFromSync.label, 'Exclude From Sync:');
    await page.roles.manage();
    await percySnapshot(assert);
    assert.ok(page.roles.formerStudent.selected);
    assert.ok(page.roles.enabled.selected);
    assert.ok(page.roles.excludeFromSync.selected);

    await page.visit({ userId: user2.id });
    await percySnapshot(assert);
    assert.strictEqual(page.roles.student.value, 'No');
    assert.strictEqual(page.roles.student.label, 'Student:');
    assert.strictEqual(page.roles.formerStudent.value, 'No');
    assert.strictEqual(page.roles.formerStudent.label, 'Former Student:');
    assert.strictEqual(page.roles.enabled.value, 'No');
    assert.strictEqual(page.roles.enabled.label, 'Account Enabled:');
    assert.strictEqual(page.roles.excludeFromSync.value, 'No');
    assert.strictEqual(page.roles.excludeFromSync.label, 'Exclude From Sync:');
    await page.roles.manage();
    await percySnapshot(assert);
    assert.notOk(page.roles.formerStudent.selected);
    assert.notOk(page.roles.enabled.selected);
    assert.notOk(page.roles.excludeFromSync.selected);
  });

  test('Change user roles #3887', async function (assert) {
    const studentRole = this.server.create('user-role', {
      title: 'Student',
    });
    const formerStudentRole = this.server.create('user-role', {
      title: 'Former Student',
    });
    const user = this.server.create('user', {
      enabled: true,
      userSyncIgnore: true,
      roles: [studentRole, formerStudentRole],
      school: this.school,
    });
    await page.visit({ userId: user.id });
    assert.strictEqual(page.roles.student.value, 'Yes');
    assert.strictEqual(page.roles.formerStudent.value, 'Yes');
    assert.strictEqual(page.roles.enabled.value, 'Yes');
    assert.strictEqual(page.roles.excludeFromSync.value, 'Yes');
    await page.roles.manage();
    assert.ok(page.roles.formerStudent.selected);
    assert.ok(page.roles.enabled.selected);
    assert.ok(page.roles.excludeFromSync.selected);
    await page.roles.formerStudent.click();
    await page.roles.enabled.click();
    await page.roles.excludeFromSync.click();
    assert.notOk(page.roles.formerStudent.selected);
    assert.notOk(page.roles.enabled.selected);
    assert.notOk(page.roles.excludeFromSync.selected);

    await page.roles.save();
    assert.strictEqual(page.roles.student.value, 'Yes');
    assert.strictEqual(page.roles.formerStudent.value, 'No');
    assert.strictEqual(page.roles.enabled.value, 'No');
    assert.strictEqual(page.roles.excludeFromSync.value, 'No');
    await page.visit({ userId: user.id });
    assert.strictEqual(page.roles.student.value, 'Yes');
    assert.strictEqual(page.roles.formerStudent.value, 'No');
    assert.strictEqual(page.roles.enabled.value, 'No');
    assert.strictEqual(page.roles.excludeFromSync.value, 'No');
  });

  test('Visit another user #4809', async function (assert) {
    const studentRole = this.server.create('user-role', {
      title: 'Student',
    });
    const formerStudentRole = this.server.create('user-role', {
      title: 'Former Student',
    });
    const user1 = this.server.create('user', {
      enabled: true,
      userSyncIgnore: true,
      roles: [formerStudentRole],
      school: this.school,
      primaryCohort: this.cohort1,
      authentication: this.server.create('authentication'),
    });
    const user2 = this.server.create('user', {
      enabled: false,
      userSyncIgnore: false,
      roles: [studentRole],
      school: this.school,
      primaryCohort: this.cohort2,
      authentication: this.server.create('authentication'),
    });
    await page.visit({ userId: user1.id });
    assert.strictEqual(page.bio.username.text, 'Username: 1');
    assert.strictEqual(page.roles.student.value, 'No');
    assert.strictEqual(page.roles.formerStudent.value, 'Yes');
    assert.strictEqual(page.roles.enabled.value, 'Yes');
    assert.strictEqual(page.roles.excludeFromSync.value, 'Yes');
    assert.strictEqual(page.cohorts.primaryCohort.title, 'school 0 program 0 Medicine');

    await page.visit({ userId: user2.id });
    assert.strictEqual(page.bio.username.text, 'Username: 2');
    assert.strictEqual(page.roles.student.value, 'Yes');
    assert.strictEqual(page.roles.formerStudent.value, 'No');
    assert.strictEqual(page.roles.enabled.value, 'No');
    assert.strictEqual(page.roles.excludeFromSync.value, 'No');
    assert.strictEqual(page.cohorts.primaryCohort.title, 'school 0 program 0 cohort 1');
  });
});
