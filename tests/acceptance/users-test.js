import { click, fillIn, currentURL, find, triggerEvent, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

const url = '/users';
import percySnapshot from '@percy/ember';

module('Acceptance | Users', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    this.user = await setupAuthentication({ school, campusId: '123' });
    this.server.createList('user', 90, { schoolId: 1, campusId: '555' });
    this.server.createList('authentication', 90);
  });

  function getCellContent(i) {
    return find(`tbody tr td:nth-of-type(${i + 1})`).textContent.trim();
  }

  test('can see list of users and transition to user route', async function (assert) {
    assert.expect(6);
    const firstStudent = 'tbody tr td:nth-of-type(2) a';

    await visit(url);
    await percySnapshot(assert);
    assert.strictEqual(getCellContent(0), '', 'user is a student');
    assert.strictEqual(getCellContent(1), '0 guy M. Mc0son', 'name is shown');
    assert.strictEqual(getCellContent(2), '123', 'campus ID is shown');
    assert.strictEqual(getCellContent(3), 'user@example.edu', 'email is shown');
    assert.strictEqual(getCellContent(4), 'school 0', 'primary school is shown');

    await click(firstStudent);
    assert.strictEqual(currentURL(), `/users/${this.user.id}`, 'tranistioned to `user` route');
  });

  test('can page through list of users', async function (assert) {
    const leftArrow = '[data-test-go-to-previous]';
    const rightArrow = '[data-test-go-to-next]';

    await visit(url);
    await click(rightArrow);
    assert.strictEqual(currentURL(), '/users?offset=25', 'query param shown');

    await click(rightArrow);
    assert.strictEqual(currentURL(), '/users?offset=50', 'query param shown');

    await click(leftArrow);
    assert.strictEqual(currentURL(), '/users?offset=25', 'query param shown');

    await click(leftArrow);
    assert.strictEqual(currentURL(), '/users', 'back to first page');
  });

  test('can search for a user and transition to user route', async function (assert) {
    assert.expect(3);
    this.server.createList('user', 40, { firstName: 'Test', lastName: 'Name', schoolId: 1 });

    const userSearch = '.user-search input';
    const firstStudent = 'tbody tr:nth-of-type(1) td:nth-of-type(2) a';

    await visit(url);
    await percySnapshot(assert);
    await fillIn(userSearch, 'Test Name');
    await triggerEvent(userSearch, 'input');
    await percySnapshot(assert);

    assert.strictEqual(getCellContent(1), 'Test M. Name', 'content is visible');
    assert.strictEqual(currentURL(), '/users?filter=Test%20Name', 'no query params for search');

    await click(firstStudent);
    assert.strictEqual(currentURL(), `/users/${this.user.id}`, 'tranistioned to `user` route');
  });
});
