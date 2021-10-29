import { currentURL, currentRouteName } from '@ember/test-helpers';
import moment from 'moment';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupAuthentication } from 'ilios-common';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import page from 'ilios-common/page-objects/course';

module('Acceptance | Course - Overview', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);
  hooks.beforeEach(async function () {
    this.user = await setupAuthentication();
    this.school = this.server.create('school');
    this.server.createList('courseClerkshipType', 2);
  });

  module('check fields', function (hooks2) {
    hooks2.beforeEach(function () {
      this.user.update({ administeredSchools: [this.school] });
      this.clerkshipType = this.server.create('courseClerkshipType');
      this.course = this.server.create('course', {
        year: 2013,
        school: this.school,
        clerkshipType: this.clerkshipType,
        externalId: 123,
        level: 3,
      });
      this.server.create('user', {
        firstName: 'A',
        lastName: 'Director',
        directedCourses: [this.course],
      });
    });

    test('collapsed', async function (assert) {
      const courseModel = await this.owner.lookup('service:store').find('course', this.course.id);
      const clerkshipTypeModel = await this.owner
        .lookup('service:store')
        .find('courseClerkshipType', this.clerkshipType.id);
      await page.visit({ courseId: courseModel.id });
      assert.strictEqual(
        page.overview.startDate.text,
        'Start: ' + this.intl.formatDate(courseModel.startDate)
      );
      assert.strictEqual(page.overview.externalId.text, 'Course ID: 123');
      assert.strictEqual(page.overview.level.text, 'Level: 3');
      assert.strictEqual(
        page.overview.endDate.text,
        'End: ' + this.intl.formatDate(courseModel.endDate)
      );
      assert.strictEqual(page.overview.universalLocator, 'ILIOS' + courseModel.id);
      assert.strictEqual(
        page.overview.clerkshipType.text,
        `Clerkship Type: ${clerkshipTypeModel.title}`
      );
    });

    test('expanded', async function (assert) {
      const courseModel = await this.owner.lookup('service:store').find('course', this.course.id);
      const clerkshipTypeModel = await this.owner
        .lookup('service:store')
        .find('courseClerkshipType', this.clerkshipType.id);
      await page.visit({ courseId: courseModel.id, details: true });
      assert.strictEqual(
        page.overview.startDate.text,
        'Start: ' + this.intl.formatDate(courseModel.startDate)
      );
      assert.strictEqual(page.overview.externalId.text, 'Course ID: 123');
      assert.strictEqual(page.overview.level.text, 'Level: 3');
      assert.strictEqual(
        page.overview.endDate.text,
        'End: ' + this.intl.formatDate(courseModel.endDate)
      );
      assert.strictEqual(page.overview.universalLocator, 'ILIOS' + courseModel.id);
      assert.strictEqual(
        page.overview.clerkshipType.text,
        `Clerkship Type: ${clerkshipTypeModel.title}`
      );
    });

    test('open and close details', async function (assert) {
      const courseModel = await this.owner.lookup('service:store').find('course', this.course.id);
      await page.visit({ courseId: courseModel.id });
      assert.strictEqual(page.titles, 2);
      assert.strictEqual(currentURL(), '/courses/1');
      await page.collapseControl();
      assert.ok(page.titles > 2);
      assert.strictEqual(currentURL(), '/courses/1?details=true');
      await page.collapseControl();
      assert.strictEqual(page.titles, 2);
      assert.strictEqual(currentURL(), '/courses/1');
    });
  });

  test('pick clerkship type', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    await page.visit({ courseId: courseModel.id, details: true });
    assert.strictEqual(
      page.overview.clerkshipType.text,
      'Clerkship Type: ' + t('general.notAClerkship')
    );
    await page.overview.clerkshipType.edit();
    assert.strictEqual(page.overview.clerkshipType.value, 'null');
    await page.overview.clerkshipType.set(2);
    await page.overview.clerkshipType.save();
    assert.strictEqual(page.overview.clerkshipType.text, 'Clerkship Type: clerkship type 1');
  });

  test('remove clerkship type', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const clerkshipType = this.server.create('courseClerkshipType');
    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
      clerkshipType,
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    await page.visit({ courseId: courseModel.id, details: true });
    assert.strictEqual(page.overview.clerkshipType.text, 'Clerkship Type: clerkship type 2');
    await page.overview.clerkshipType.edit();
    assert.strictEqual(page.overview.clerkshipType.value, '3');
    await page.overview.clerkshipType.set(0);
    await page.overview.clerkshipType.save();
    assert.strictEqual(
      page.overview.clerkshipType.text,
      'Clerkship Type: ' + t('general.notAClerkship')
    );
  });

  test('change title', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    await page.visit({ courseId: courseModel.id, details: true });
    assert.strictEqual(page.header.title, 'course 0');
    await page.header.edit();
    await page.header.set('test new title');
    await page.header.save();
    assert.strictEqual(page.header.title, 'test new title');
  });

  test('change start date', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
      year: 2013,
      startDate: moment('2013-04-23').toDate(),
      endDate: moment('2015-05-22').toDate(),
      school: this.school,
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    await page.visit({ courseId: courseModel.id, details: true });
    const newDate = moment(course.startDate).add(1, 'year').add(1, 'month');
    assert.strictEqual(
      page.overview.startDate.text,
      'Start: ' + this.intl.formatDate(course.startDate)
    );
    await page.overview.startDate.edit();
    assert.strictEqual(
      page.overview.startDate.datePicker.value,
      this.intl.formatDate(course.startDate)
    );
    await page.overview.startDate.datePicker.set(newDate.toDate());
    await page.overview.startDate.save();
    assert.strictEqual(page.overview.startDate.text, 'Start: ' + this.intl.formatDate(newDate));
  });

  test('start date validation', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
      year: 2013,
      startDate: moment('2013-04-23').toDate(),
      endDate: moment('2013-05-22').toDate(),
      school: this.school,
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    await page.visit({ courseId: courseModel.id, details: true });
    const startDate = this.intl.formatDate(courseModel.startDate);
    const newDate = moment(courseModel.startDate).add(1, 'year');
    assert.strictEqual(page.overview.startDate.text, `Start: ${startDate}`);
    assert.notOk(page.overview.startDate.hasError);
    await page.overview.startDate.edit();
    assert.strictEqual(page.overview.startDate.datePicker.value, startDate);
    await page.overview.startDate.datePicker.set(newDate.toDate());
    await page.overview.startDate.save();
    assert.ok(page.overview.startDate.hasError);
  });

  test('change end date', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
      year: 2013,
      startDate: moment('2013-04-23').toDate(),
      endDate: moment('2015-05-22').toDate(),
      school: this.school,
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    await page.visit({ courseId: courseModel.id, details: true });
    const endDate = this.intl.formatDate(courseModel.endDate);
    const newDate = moment(course.endDate).add(1, 'year').add(1, 'month');
    assert.strictEqual(page.overview.endDate.text, `End: ${endDate}`);
    await page.overview.endDate.edit();
    assert.strictEqual(page.overview.endDate.datePicker.value, endDate);
    await page.overview.endDate.datePicker.set(newDate.toDate());
    await page.overview.endDate.save();
    assert.strictEqual(page.overview.endDate.text, 'End: ' + this.intl.formatDate(newDate));
  });

  test('end date validation', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
      year: 2013,
      startDate: moment('2013-04-23').toDate(),
      endDate: moment('2013-05-22').toDate(),
      school: this.school,
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    await page.visit({ courseId: courseModel.id, details: true });
    const endDate = this.intl.formatDate(courseModel.endDate);
    const newDate = moment(course.endDate).subtract(1, 'year');
    assert.strictEqual(page.overview.endDate.text, 'End: ' + endDate);
    assert.notOk(page.overview.endDate.hasError);
    await page.overview.endDate.edit();
    assert.strictEqual(page.overview.endDate.datePicker.value, endDate);
    await page.overview.endDate.datePicker.set(newDate.toDate());
    await page.overview.endDate.save();
    assert.ok(page.overview.endDate.hasError);
  });

  test('change externalId', async function (assert) {
    const externalId = 'abc123';
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
      externalId,
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    await page.visit({ courseId: courseModel.id, details: true });
    const newValue = 'new id';
    assert.strictEqual(page.overview.externalId.text, `Course ID: ${externalId}`);
    await page.overview.externalId.edit();
    assert.strictEqual(page.overview.externalId.value, externalId);
    await page.overview.externalId.set(newValue);
    await page.overview.externalId.save();
    assert.strictEqual(page.overview.externalId.text, `Course ID: ${newValue}`);
  });

  test('change to empty externalId', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
      externalId: 'abc123',
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    await page.visit({ courseId: courseModel.id, details: true });
    assert.strictEqual(page.overview.externalId.text, `Course ID: ${courseModel.externalId}`);
    await page.overview.externalId.edit();
    await page.overview.externalId.set('');
    await page.overview.externalId.save();
    assert.strictEqual(page.overview.externalId.text, 'Course ID: ' + t('general.clickToEdit'));
  });

  test('renders with empty externalId', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    await page.visit({ courseId: courseModel.id, details: true });
    assert.strictEqual(page.overview.externalId.text, 'Course ID: ' + t('general.clickToEdit'));
  });

  test('change level', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
      level: 3,
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    await page.visit({ courseId: courseModel.id, details: true });
    const newValue = 1;
    assert.strictEqual(page.overview.level.text, `Level: ${courseModel.level}`);
    await page.overview.level.edit();
    assert.strictEqual(parseInt(page.overview.level.value, 10), courseModel.level);
    await page.overview.level.set(newValue);
    await page.overview.level.save();
    assert.strictEqual(page.overview.level.text, `Level: ${newValue}`);
  });

  test('click rollover', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    await page.visit({ courseId: courseModel.id, details: true });
    assert.ok(page.overview.rollover.isVisible);
    await page.overview.rollover.visit();

    assert.strictEqual(currentRouteName(), 'course.rollover');
  });

  test('rollover hidden from unprivileged users', async function (assert) {
    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    await page.visit({ courseId: courseModel.id, details: true });
    assert.notOk(page.overview.rollover.isVisible);
  });

  test('rollover visible to privileged users', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    await page.visit({ courseId: courseModel.id, details: true });
    assert.ok(page.overview.rollover.isVisible);
  });

  test('rollover hidden on rollover route', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    await page.visit({ courseId: courseModel.id, details: true });
    assert.ok(page.overview.rollover.isVisible);
    await page.overview.rollover.visit();
    assert.notOk(page.overview.rollover.isVisible);
  });
});
