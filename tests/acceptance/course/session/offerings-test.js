import moment from 'moment';
import {
  module,
  test
} from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import page from 'ilios-common/page-objects/session';

module('Acceptance | Session - Offerings', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('programYear', { program });
    const cohort = this.server.create('cohort', { programYear });
    const course = this.server.create('course', {
      cohorts: [cohort],
      school: this.school,
      directors: [this.user]
    });
    this.server.create('sessionType', {
      school: this.school
    });
    const users = this.server.createList('user', 8);
    const instructorGroup1 = this.server.create('instructor-group', {
      users: [users[0], users[1], users[4], users[5]],
      school: this.school,
    });
    const instructorGroup2 = this.server.create('instructor-group', {
      users: [users[2], users[3]],
      school: this.school
    });
    const learnerGroup1 = this.server.create('learner-group', {
      users: [users[0], users[1]],
      cohort,
      location: 'default 1',
      instructors: [this.user],
    });
    const learnerGroup2 = this.server.create('learner-group', {
      users: [users[2], users[3]],
      cohort,
      location: 'default 2',
      instructorGroups: [instructorGroup1],
    });
    const session = this.server.create('session', { course });

    this.today = moment().hour(9);
    this.offering1 = this.server.create('offering', {
      session,
      instructors: [users[4], users[5], users[6], users[7]],
      instructorGroups: [instructorGroup1, instructorGroup2],
      learnerGroups: [learnerGroup1, learnerGroup2],
      startDate: this.today.format(),
      endDate: this.today.clone().add(1, 'hour').format(),
    });

    this.offering2 = this.server.create('offering', {
      session,
      instructors: [users[6], users[7]],
      instructorGroups: [instructorGroup2],
      learnerGroups: [learnerGroup2],
      startDate: this.today.clone().add(1, 'day').format(),
      endDate: this.today.clone().add(1, 'day').add(1, 'hour').format(),
    });
    this.offering3 = this.server.create('offering', {
      session,
      instructorGroups: [instructorGroup2],
      learnerGroups: [learnerGroup2],
      instructors: [],
      startDate: this.today.clone().add(2, 'days').format(),
      endDate: this.today.clone().add(3, 'days').add(1, 'hour').format(),
    });
  });

  test('basics', async function(assert) {
    assert.expect(2);
    await page.visit({ courseId: 1, sessionId: 1 });

    assert.equal(page.offerings.header.title, 'Offerings (3)');
    assert.equal(page.offerings.dateBlocks.length, 3);
  });

  test('offering dates', async function(assert) {
    assert.expect(23);
    await page.visit({ courseId: 1, sessionId: 1 });

    const blocks = page.offerings.dateBlocks;
    assert.ok(blocks[0].hasStartTime);
    assert.ok(blocks[0].hasEndTime);
    assert.notOk(blocks[0].hasMultiDay);
    assert.equal(blocks[0].dayOfWeek, moment(this.offering1.startDate).format('dddd'));
    assert.equal(blocks[0].dayOfMonth, moment(this.offering1.startDate).format('MMMM Do'));
    assert.equal(blocks[0].startTime, 'Starts: ' + moment(this.offering1.startDate).format('LT'));
    assert.equal(blocks[0].endTime, 'Ends: ' + moment(this.offering1.endDate).format('LT'));
    assert.equal(blocks[0].offerings.length, 1);

    assert.ok(blocks[1].hasStartTime);
    assert.ok(blocks[1].hasEndTime);
    assert.notOk(blocks[1].hasMultiDay);
    assert.equal(blocks[1].dayOfWeek, moment(this.offering2.startDate).format('dddd'));
    assert.equal(blocks[1].dayOfMonth, moment(this.offering2.startDate).format('MMMM Do'));
    assert.equal(blocks[1].startTime, 'Starts: ' + moment(this.offering2.startDate).format('LT'));
    assert.equal(blocks[1].endTime, 'Ends: ' + moment(this.offering2.endDate).format('LT'));
    assert.equal(blocks[1].offerings.length, 1);

    assert.notOk(blocks[2].hasStartTime);
    assert.notOk(blocks[2].hasEndTime);
    assert.ok(blocks[2].hasMultiDay);
    assert.equal(blocks[2].dayOfWeek, moment(this.offering3.startDate).format('dddd'));
    assert.equal(blocks[2].dayOfMonth, moment(this.offering3.startDate).format('MMMM Do'));
    let expectedText = 'Multiday ' +
        'Starts ' + moment(this.offering3.startDate).format('dddd MMMM Do [@] LT') +
      ' Ends ' + moment(this.offering3.endDate).format('dddd MMMM Do [@] LT');
    assert.equal(blocks[2].offerings.length, 1);

    assert.equal(blocks[2].multiDay, expectedText);
  });

  test('offering details', async function (assert) {
    await page.visit({ courseId: 1, sessionId: 1 });
    const blocks = page.offerings.dateBlocks;
    assert.equal(blocks[0].offerings[0].learnerGroups.length, 2);
    assert.equal(blocks[0].offerings[0].learnerGroups[0].title, 'learner group 0');
    assert.equal(blocks[0].offerings[0].learnerGroups[1].title, 'learner group 1');
    assert.equal(blocks[0].offerings[0].location, this.offering1.room);
    assert.equal(blocks[0].offerings[0].instructors.length, 8);
    assert.equal(blocks[0].offerings[0].instructors[0].title, '1 guy M. Mc1son');
    assert.equal(blocks[0].offerings[0].instructors[1].title, '2 guy M. Mc2son');
    assert.equal(blocks[0].offerings[0].instructors[2].title, '3 guy M. Mc3son');
    assert.equal(blocks[0].offerings[0].instructors[3].title, '4 guy M. Mc4son');
    assert.equal(blocks[0].offerings[0].instructors[4].title, '5 guy M. Mc5son');
    assert.equal(blocks[0].offerings[0].instructors[5].title, '6 guy M. Mc6son');
    assert.equal(blocks[0].offerings[0].instructors[6].title, '7 guy M. Mc7son');
    assert.equal(blocks[0].offerings[0].instructors[7].title, '8 guy M. Mc8son');

    assert.equal(blocks[1].offerings[0].learnerGroups.length, 1);
    assert.equal(blocks[1].offerings[0].learnerGroups[0].title, 'learner group 1');
    assert.equal(blocks[1].offerings[0].location, this.offering2.room);
    assert.equal(blocks[1].offerings[0].instructors.length, 4);
    assert.equal(blocks[1].offerings[0].instructors[0].title, '3 guy M. Mc3son');
    assert.equal(blocks[1].offerings[0].instructors[1].title, '4 guy M. Mc4son');
    assert.equal(blocks[1].offerings[0].instructors[2].title, '7 guy M. Mc7son');
    assert.equal(blocks[1].offerings[0].instructors[3].title, '8 guy M. Mc8son');

    assert.equal(blocks[2].offerings[0].learnerGroups.length, 1);
    assert.equal(blocks[2].offerings[0].learnerGroups[0].title, 'learner group 1');
    assert.equal(blocks[2].offerings[0].location, this.offering3.room);
    assert.equal(blocks[2].offerings[0].instructors.length, 2);
    assert.equal(blocks[2].offerings[0].instructors[0].title, '3 guy M. Mc3son');
    assert.equal(blocks[2].offerings[0].instructors[1].title, '4 guy M. Mc4son');
  });

  test('confirm removal message', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ courseId: 1, sessionId: 1 });
    await page.offerings.dateBlocks[0].offerings[0].remove();
    assert.ok(page.offerings.dateBlocks[0].offerings[0].hasRemoveConfirm);
    assert.equal(page.offerings.dateBlocks[0].offerings[0].removeConfirmMessage, 'Are you sure you want to delete this offering with 2 learner groups? This action cannot be undone. Yes Cancel');
  });

  test('remove offering', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(2);
    await page.visit({ courseId: 1, sessionId: 1 });
    await page.offerings.dateBlocks[0].offerings[0].remove();
    await page.offerings.dateBlocks[0].offerings[0].confirmRemoval();
    assert.equal(page.offerings.header.title, 'Offerings (2)');
    assert.equal(page.offerings.dateBlocks.length, 2);
  });

  test('cancel remove offering', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(2);
    await page.visit({ courseId: 1, sessionId: 1 });
    await page.offerings.dateBlocks[0].offerings[0].remove();
    await page.offerings.dateBlocks[0].offerings[0].cancelRemoval();
    assert.equal(page.offerings.header.title, 'Offerings (3)');
    assert.equal(page.offerings.dateBlocks.length, 3);
  });

  test('users can create a new offering single day', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(14);
    await page.visit({ courseId: 1, sessionId: 1 });
    await page.offerings.header.createNew();
    const { offeringForm: form } = page.offerings;
    await page.offerings.singleOffering();
    await form.startDate(new Date(2011, 8, 11));
    await form.startTime.hour(2);
    await form.startTime.minutes(15);
    await form.startTime.ampm('am');
    await form.hours(15);
    await form.minutes(15);
    await form.location('Rm. 111');

    await form.learnerGroupManager.availableLearnerGroups.cohorts[0].topLevelGroups[0].add();
    await form.learnerGroupManager.availableLearnerGroups.cohorts[0].topLevelGroups[1].add();
    await form.instructorSelectionManager.search('guy');
    await form.instructorSelectionManager.searchResults[0].add();
    await form.save();

    const block = page.offerings.dateBlocks[0];

    assert.ok(block.hasStartTime);
    assert.ok(block.hasEndTime);
    assert.notOk(block.hasMultiDay);
    assert.equal(block.dayOfWeek, 'Sunday');
    assert.equal(block.dayOfMonth, 'September 11th');
    assert.equal(block.startTime, 'Starts: 2:15 AM');
    assert.equal(block.endTime, 'Ends: 5:30 PM');
    assert.equal(block.offerings.length, 1);

    assert.equal(block.offerings[0].learnerGroups.length, 2);
    assert.equal(block.offerings[0].learnerGroups[0].title, 'learner group 0');
    assert.equal(block.offerings[0].learnerGroups[1].title, 'learner group 1');
    assert.equal(block.offerings[0].location, 'Rm. 111');
    assert.equal(block.offerings[0].instructors.length, 1);
    assert.equal(block.offerings[0].instructors[0].title, '0 guy M. Mc0son');
  });


  test('users can create a new offering multi-day', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(13);
    await page.visit({ courseId: 1, sessionId: 1 });
    await page.offerings.header.createNew();
    const { offeringForm: form } = page.offerings;
    await page.offerings.singleOffering();
    await form.startDate(new Date(2011, 8, 11));
    await form.startTime.hour(2);
    await form.startTime.minutes(15);
    await form.startTime.ampm('am');
    await form.hours(39);
    await form.minutes(15);
    await form.location('Rm. 111');

    await form.learnerGroupManager.availableLearnerGroups.cohorts[0].topLevelGroups[0].add();
    await form.learnerGroupManager.availableLearnerGroups.cohorts[0].topLevelGroups[1].add();
    await form.instructorSelectionManager.search('guy');
    await form.instructorSelectionManager.searchResults[0].add();
    await form.save();

    const block = page.offerings.dateBlocks[0];

    assert.notOk(block.hasStartTime);
    assert.notOk(block.hasEndTime);
    assert.ok(block.hasMultiDay);
    assert.equal(block.dayOfWeek, 'Sunday');
    assert.equal(block.dayOfMonth, 'September 11th');
    let expectedText = 'Multiday ' +
        'Starts Sunday September 11th @ 2:15 AM' +
      ' Ends Monday September 12th @ 5:30 PM';
    assert.equal(block.multiDay, expectedText);
    assert.equal(block.offerings.length, 1);

    assert.equal(block.offerings[0].learnerGroups.length, 2);
    assert.equal(block.offerings[0].learnerGroups[0].title, 'learner group 0');
    assert.equal(block.offerings[0].learnerGroups[1].title, 'learner group 1');
    assert.equal(block.offerings[0].location, 'Rm. 111');
    assert.equal(block.offerings[0].instructors.length, 1);
    assert.equal(block.offerings[0].instructors[0].title, '0 guy M. Mc0son');
  });

  test('users can create a new small group offering', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(19);

    await page.visit({ courseId: 1, sessionId: 1 });
    await page.offerings.header.createNew();
    const { offeringForm: form } = page.offerings;
    await page.offerings.smallGroup();
    await form.startDate(new Date(2011, 8, 11));
    await form.startTime.hour(2);
    await form.startTime.minutes(15);
    await form.startTime.ampm('am');
    await form.hours(15);
    await form.minutes(15);

    await form.learnerGroupManager.availableLearnerGroups.cohorts[0].topLevelGroups[0].add();
    await form.learnerGroupManager.availableLearnerGroups.cohorts[0].topLevelGroups[1].add();
    await form.save();

    const block = page.offerings.dateBlocks[0];

    assert.ok(block.hasStartTime);
    assert.ok(block.hasEndTime);
    assert.notOk(block.hasMultiDay);
    assert.equal(block.dayOfWeek, 'Sunday');
    assert.equal(block.dayOfMonth, 'September 11th');
    assert.equal(block.startTime, 'Starts: 2:15 AM');
    assert.equal(block.endTime, 'Ends: 5:30 PM');
    assert.equal(block.offerings.length, 2);

    assert.equal(block.offerings[0].learnerGroups.length, 1);
    assert.equal(block.offerings[0].learnerGroups[0].title, 'learner group 0');
    assert.equal(block.offerings[0].instructors.length, 1);
    assert.equal(block.offerings[0].instructors[0].title, '0 guy M. Mc0son');

    assert.equal(block.offerings[1].learnerGroups.length, 1);
    assert.equal(block.offerings[1].learnerGroups[0].title, 'learner group 1');
    assert.equal(block.offerings[1].instructors.length, 4);
    assert.equal(block.offerings[1].instructors[0].title, '1 guy M. Mc1son');
    assert.equal(block.offerings[1].instructors[1].title, '2 guy M. Mc2son');
    assert.equal(block.offerings[1].instructors[2].title, '5 guy M. Mc5son');
    assert.equal(block.offerings[1].instructors[3].title, '6 guy M. Mc6son');
  });


  test('users can edit existing offerings', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(17);

    await page.visit({ courseId: 1, sessionId: 1 });
    await page.offerings.dateBlocks[0].offerings[0].edit();

    const { offeringForm: form } = page.offerings.dateBlocks[0].offerings[0];

    await form.startDate(new Date(2011, 9, 5));
    await form.startTime.hour(11);
    await form.startTime.minutes(45);
    await form.startTime.ampm('am');
    await form.hours(6);
    await form.minutes(10);
    await form.location('Rm. 111');

    await form.learnerGroupManager.selectedLearnerGroups[0].removeAll();
    await form.instructorSelectionManager.instructors[0].remove();
    await form.instructorSelectionManager.instructorGroups[0].remove();

    await form.save();

    const block = page.offerings.dateBlocks[0];

    assert.ok(block.hasStartTime);
    assert.ok(block.hasEndTime);
    assert.notOk(block.hasMultiDay);
    assert.equal(block.dayOfWeek, 'Wednesday');
    assert.equal(block.dayOfMonth, 'October 5th');
    assert.equal(block.startTime, 'Starts: 11:45 AM');
    assert.equal(block.endTime, 'Ends: 5:55 PM');
    assert.equal(block.offerings.length, 1);

    const offering = block.offerings[0];

    assert.equal(offering.learnerGroups.length, 1);
    assert.equal(offering.learnerGroups[0].title, 'learner group 1');
    assert.equal(offering.instructors.length, 5);
    assert.equal(offering.instructors[0].title, '3 guy M. Mc3son');
    assert.equal(offering.instructors[1].title, '4 guy M. Mc4son');
    assert.equal(offering.instructors[2].title, '6 guy M. Mc6son');
    assert.equal(offering.instructors[3].title, '7 guy M. Mc7son');
    assert.equal(offering.instructors[4].title, '8 guy M. Mc8son');
    assert.equal(offering.location, 'Rm. 111');
  });

  test('users can create recurring small groups', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(77);

    await page.visit({ courseId: 1, sessionId: 1 });
    await page.offerings.header.createNew();
    const { offeringForm: form } = page.offerings;
    await page.offerings.smallGroup();
    await form.startDate(new Date(2015, 4, 22));
    await form.startTime.hour(2);
    await form.startTime.minutes(15);
    await form.startTime.ampm('am');
    await form.hours(13);
    await form.minutes(8);


    await form.toggleRecurring();
    await form.recurringWeeks(4);

    await form.learnerGroupManager.availableLearnerGroups.cohorts[0].topLevelGroups[0].add();
    await form.learnerGroupManager.availableLearnerGroups.cohorts[0].topLevelGroups[1].add();

    await form.save();

    assert.equal(page.offerings.dateBlocks.length, 7);
    assert.equal(page.offerings.dateBlocks[0].dayOfMonth, 'May 22nd');
    assert.equal(page.offerings.dateBlocks[1].dayOfMonth, 'May 29th');
    assert.equal(page.offerings.dateBlocks[2].dayOfMonth, 'June 5th');
    assert.equal(page.offerings.dateBlocks[3].dayOfMonth, 'June 12th');

    for (let i = 0; i < 4; i++) {
      const block = page.offerings.dateBlocks[i];
      assert.ok(block.hasStartTime);
      assert.ok(block.hasEndTime);
      assert.notOk(block.hasMultiDay);
      assert.equal(block.dayOfWeek, 'Friday');
      assert.equal(block.startTime, 'Starts: 2:15 AM');
      assert.equal(block.endTime, 'Ends: 3:23 PM');
      assert.equal(block.offerings.length, 2);
      assert.equal(block.offerings[0].learnerGroups.length, 1);
      assert.equal(block.offerings[0].learnerGroups[0].title, 'learner group 0');

      assert.equal(block.offerings[0].instructors.length, 1);
      assert.equal(block.offerings[0].instructors[0].title, '0 guy M. Mc0son');

      assert.equal(block.offerings[1].learnerGroups.length, 1);
      assert.equal(block.offerings[1].learnerGroups[0].title, 'learner group 1');
      assert.equal(block.offerings[1].instructors.length, 4);
      assert.equal(block.offerings[1].instructors[0].title, '1 guy M. Mc1son');
      assert.equal(block.offerings[1].instructors[1].title, '2 guy M. Mc2son');
      assert.equal(block.offerings[1].instructors[2].title, '5 guy M. Mc5son');
      assert.equal(block.offerings[1].instructors[3].title, '6 guy M. Mc6son');
    }
  });

  test('users can create recurring single offerings', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(53);

    await page.visit({ courseId: 1, sessionId: 1 });
    await page.offerings.header.createNew();
    const { offeringForm: form } = page.offerings;
    await page.offerings.singleOffering();
    await form.startDate(new Date(2015, 4, 22));
    await form.startTime.hour(2);
    await form.startTime.minutes(15);
    await form.startTime.ampm('am');
    await form.hours(13);
    await form.minutes(8);
    await form.location('Scottsdale Stadium');

    await form.toggleRecurring();
    await form.recurringWeeks(4);

    await form.learnerGroupManager.availableLearnerGroups.cohorts[0].topLevelGroups[0].add();
    await form.learnerGroupManager.availableLearnerGroups.cohorts[0].topLevelGroups[1].add();

    await form.save();

    assert.equal(page.offerings.dateBlocks.length, 7);
    assert.equal(page.offerings.dateBlocks[0].dayOfMonth, 'May 22nd');
    assert.equal(page.offerings.dateBlocks[1].dayOfMonth, 'May 29th');
    assert.equal(page.offerings.dateBlocks[2].dayOfMonth, 'June 5th');
    assert.equal(page.offerings.dateBlocks[3].dayOfMonth, 'June 12th');

    for (let i = 0; i < 4; i++) {
      const block = page.offerings.dateBlocks[i];
      assert.ok(block.hasStartTime);
      assert.ok(block.hasEndTime);
      assert.notOk(block.hasMultiDay);
      assert.equal(block.dayOfWeek, 'Friday');
      assert.equal(block.startTime, 'Starts: 2:15 AM');
      assert.equal(block.endTime, 'Ends: 3:23 PM');
      assert.equal(block.offerings.length, 1);
      assert.equal(block.offerings[0].learnerGroups.length, 2);
      assert.equal(block.offerings[0].location, 'Scottsdale Stadium');
      assert.equal(block.offerings[0].learnerGroups[0].title, 'learner group 0');
      assert.equal(block.offerings[0].learnerGroups[1].title, 'learner group 1');

      assert.equal(block.offerings[0].instructors.length, 0);
    }
  });

  test('edit offerings twice #2850', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(2);
    this.server.create('learnerGroup', {
      cohortId: 1,
    });
    this.server.create('learnerGroup', {
      cohortId: 1,
      parentId: 3,
    });
    this.server.create('learnerGroup', {
      cohortId: 1,
      parentId: 4,
    });
    this.server.create('learnerGroup', {
      cohortId: 1,
      parentId: 5,
    });
    this.server.db.cohorts.update(1, { learnerGroupIds: [3, 4, 5, 6] });

    await page.visit({ courseId: 1, sessionId: 1 });
    await page.offerings.dateBlocks[0].offerings[0].edit();
    await page.offerings.dateBlocks[0].offerings[0].offeringForm.save();
    assert.equal(page.offerings.dateBlocks[0].offerings[0].location, 'room 0');


    await page.offerings.dateBlocks[0].offerings[0].edit();
    await page.offerings.dateBlocks[0].offerings[0].offeringForm.save();
    assert.equal(page.offerings.dateBlocks[0].offerings[0].location, 'room 0');
  });
});
