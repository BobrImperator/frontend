import Service from '@ember/service';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import { resolve } from 'rsvp';

module('Integration | Component | course summary header', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    let currentUserMock = Service.extend({
      userIsCourseDirector: true,
    });
    this.owner.register('service:currentUser', currentUserMock);
  });

  test('it renders', async function(assert) {
    let school = EmberObject.create({});
    let permissionCheckerMock = Service.extend({
      canCreateCourse(inSchool) {
        assert.equal(school, inSchool);
        return resolve(true);
      }
    });
    this.owner.register('service:permissionChecker', permissionCheckerMock);
    let course = EmberObject.create({
      title: 'title',
      school: resolve(school),
      startDate: new Date(2020, 4, 6, 12),
      endDate: new Date(2020, 11, 11, 12),
      externalId: 'abc',
      level: 3,
      isPublished: true,
      isSchedule: false,
    });
    this.set('course', course);
    await render(hbs`{{course-summary-header course=course}}`);
    const title = 'h2';
    const actions = '.course-summary-actions';
    const materialsIcon = `${actions} svg:nth-of-type(1)`;
    const printIcon = `${actions} svg:nth-of-type(2)`;
    const rolloverIcon = `${actions} svg:nth-of-type(3)`;
    const blocks = '.course-summary-content .block';
    const start = `${blocks}:nth-of-type(1) span`;
    const externalId = `${blocks}:nth-of-type(2) span`;
    const end = `${blocks}:nth-of-type(3) span`;
    const level = `${blocks}:nth-of-type(4) span`;
    const status = `${blocks}:nth-of-type(5) span:nth-of-type(1)`;


    assert.equal(find(title).textContent.trim(), 'title');
    assert.ok(find(materialsIcon).hasClass('fa-archive'));
    assert.ok(find(printIcon).hasClass('fa-print'));
    assert.ok(find(rolloverIcon).hasClass('fa-random'));
    assert.equal(find(start).textContent.trim(), moment(course.startDate).format('L'));
    assert.equal(find(externalId).textContent.trim(), 'abc');
    assert.equal(find(end).textContent.trim(), moment(course.endDate).format('L'));
    assert.equal(find(level).textContent.trim(), '3');
    assert.equal(find(status).textContent.trim(), 'Published');


  });

  test('no link to materials when that is the current route', async function(assert) {
    let school = EmberObject.create({});
    let permissionCheckerMock = Service.extend({
      canCreateCourse(inSchool) {
        assert.equal(school, inSchool);
        return resolve(true);
      }
    });
    this.owner.register('service:permissionChecker', permissionCheckerMock);
    let routerMock = Service.extend({
      currentRouteName: 'course-materials',
      generateURL(){},
    });
    this.owner.register('service:-routing', routerMock);

    let course = EmberObject.create({
      title: 'title',
      school: resolve(school),
      startDate: new Date(2020, 4, 6, 12),
      endDate: new Date(2020, 11, 11, 12),
    });
    this.set('course', course);
    await render(hbs`{{course-summary-header course=course}}`);
    const actions = '.course-summary-actions svg';
    const printIcon = `${actions}:nth-of-type(1)`;
    const rolloverIcon = `${actions}:nth-of-type(2)`;

    assert.ok(findAll(actions).length, 2);
    assert.ok(find(printIcon).hasClass('fa-print'));
    assert.ok(find(rolloverIcon).hasClass('fa-random'));
  });

  test('no link to rollover when that is the current route', async function(assert) {
    let routerMock = Service.extend({
      currentRouteName: 'course.rollover',
      generateURL(){},
    });
    this.owner.register('service:-routing', routerMock);

    let course = EmberObject.create({
      title: 'title',
      startDate: new Date(2020, 4, 6, 12),
      endDate: new Date(2020, 11, 11, 12),
    });
    this.set('course', course);
    await render(hbs`{{course-summary-header course=course}}`);
    const actions = '.course-summary-actions svg';
    const materialsIcon = `${actions}:nth-of-type(1)`;
    const printIcon = `${actions}:nth-of-type(2)`;

    assert.ok(findAll(actions).length, 2);
    assert.ok(find(printIcon).hasClass('fa-print'));
    assert.ok(find(materialsIcon).hasClass('fa-archive'));
  });

  test('no link to rollover when user cannot edit the course', async function(assert) {
    let school = EmberObject.create({});
    let routerMock = Service.extend({
      currentRouteName: 'course.rollover',
      generateURL(){},
    });
    this.owner.register('service:-routing', routerMock);
    let permissionCheckerMock = Service.extend({
      canCreateCourse(inSchool) {
        assert.equal(school, inSchool);
        return resolve(false);
      }
    });
    this.owner.register('service:permissionChecker', permissionCheckerMock);

    let course = EmberObject.create({
      title: 'title',
      school: resolve(school),
      startDate: new Date(2020, 4, 6, 12),
      endDate: new Date(2020, 11, 11, 12),
    });
    this.set('course', course);
    await render(hbs`{{course-summary-header course=course}}`);
    const actions = '.course-summary-actions svg';
    const materialsIcon = `${actions}:nth-of-type(1)`;
    const printIcon = `${actions}:nth-of-type(2)`;

    assert.ok(findAll(actions).length, 2);
    assert.ok(find(printIcon).hasClass('fa-print'));
    assert.ok(find(materialsIcon).hasClass('fa-archive'));
  });
});
