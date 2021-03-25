import { click, fillIn, find, currentURL, currentRouteName, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'ilios/tests/pages/programs';

module('Acceptance | Programs', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('User in single school with no special permissions', function (hooks) {
    hooks.beforeEach(async function () {
      this.school = this.server.create('school');
      this.user = await setupAuthentication({ school: this.school });
    });

    test('visiting /programs', async function (assert) {
      await page.visit();
      assert.equal(currentRouteName(), 'programs');
    });

    test('add new program', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      assert.expect(3);
      const url = '/programs';
      const expandButton = '.expand-button';
      const input = '.new-program input';
      const saveButton = '.new-program .done';
      const savedLink = '.saved-result a';

      await visit(url);
      await click(expandButton);
      await fillIn(input, 'Test Title');
      await click(saveButton);
      function getContent(i) {
        return find(`tbody tr td:nth-of-type(${i + 1})`).textContent.trim();
      }

      assert.dom(savedLink).hasText('Test Title', 'link is visisble');
      assert.equal(getContent(0), 'Test Title', 'program is correct');
      assert.equal(getContent(1), 'school 0', 'school is correct');
    });

    test('remove program', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      assert.expect(6);
      this.server.create('program', {
        school: this.school,
      });
      await page.visit();
      assert.equal(this.server.db.programs.length, 1);
      assert.equal(page.list.items.length, 1);
      assert.equal(page.list.items[0].title, 'program 0');
      await page.list.items[0].remove();
      await page.list.confirmRemoval.confirm();
      assert.equal(this.server.db.programs.length, 0);
      assert.equal(page.list.items.length, 0);
      assert.dom('.flash-messages').exists({ count: 1 });
    });

    test('cancel remove program', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      assert.expect(5);
      this.server.create('program', {
        school: this.school,
      });
      await page.visit();
      assert.equal(this.server.db.programs.length, 1);
      assert.equal(page.list.items.length, 1);
      assert.equal(page.list.items[0].title, 'program 0');
      await page.list.items[0].remove();
      await page.list.confirmRemoval.cancel();
      assert.equal(this.server.db.programs.length, 1);
      assert.equal(page.list.items.length, 1);
    });

    test('click edit takes you to program route', async function (assert) {
      assert.expect(1);
      this.server.create('program', {
        school: this.school,
      });
      await page.visit();
      await click('.list tbody tr:nth-of-type(1) td:nth-of-type(3) .edit');
      assert.equal(currentURL(), '/programs/1');
    });

    test('click title takes you to program route', async function (assert) {
      assert.expect(1);
      this.server.create('program', {
        school: this.school,
      });
      await page.visit();
      await click('.list tbody tr:nth-of-type(1) td:nth-of-type(1) a');
      assert.equal(currentURL(), '/programs/1');
    });
  });

  test('filters options', async function (assert) {
    assert.expect(4);
    const schools = this.server.createList('school', 2);
    await setupAuthentication({ school: schools[1] });
    await page.visit();
    assert.equal(page.schoolFilter.schools.length, 2);
    assert.equal(page.schoolFilter.schools[0].text, 'school 0');
    assert.equal(page.schoolFilter.schools[1].text, 'school 1');
    assert.equal(page.schoolFilter.selectedSchool, '2');
  });
});
