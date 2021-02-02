import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';

import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import page from 'ilios-common/page-objects/session';

module('Acceptance | Session - Mesh Terms', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
    this.server.create('academicYear');
    this.server.createList('meshTree', 3);
    this.server.createList('meshConcept', 3);

    this.server.create('meshConcept', {
      scopeNote: '1234567890'.repeat(30),
    });

    this.server.create('meshDescriptor', {
      conceptIds: [1, 2, 3, 4],
      treeIds: [1, 2, 3],
    });
    this.server.create('meshDescriptor', {
      deleted: true,
    });
    this.server.createList('meshDescriptor', 4);

    const course = this.server.create('course', {
      year: 2014,
      school: this.school,
    });
    this.server.create('session', {
      course,
      meshDescriptorIds: [1, 2, 3],
    });
  });

  test('list mesh', async function (assert) {
    assert.expect(4);
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.equal(page.meshTerms.current.length, 3);
    assert.equal(page.meshTerms.current[0].title, 'descriptor 0');
    assert.equal(page.meshTerms.current[1].title, 'descriptor 1');
    assert.equal(page.meshTerms.current[2].title, 'descriptor 2');
  });

  test('manage terms', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.equal(page.meshTerms.current.length, 3);
    await page.meshTerms.manage();
    assert.equal(page.meshTerms.meshManager.selectedTerms.length, 3);
    assert.equal(page.meshTerms.meshManager.selectedTerms[0].title, 'descriptor 0');
    assert.equal(page.meshTerms.meshManager.selectedTerms[1].title, 'descriptor 1');
    assert.equal(page.meshTerms.meshManager.selectedTerms[2].title, 'descriptor 2');
    await page.meshTerms.meshManager.search('descriptor');
    await page.meshTerms.meshManager.runSearch();

    assert.equal(page.meshTerms.meshManager.searchResults.length, 6);
    for (let i = 0; i < 6; i++) {
      assert.equal(page.meshTerms.meshManager.searchResults[i].title, `descriptor ${i}`);
    }
    assert.ok(page.meshTerms.meshManager.searchResults[0].isDisabled);
    assert.ok(page.meshTerms.meshManager.searchResults[1].isDisabled);
    assert.ok(page.meshTerms.meshManager.searchResults[2].isDisabled);
    assert.ok(page.meshTerms.meshManager.searchResults[3].isEnabled);
    assert.ok(page.meshTerms.meshManager.searchResults[4].isEnabled);
    assert.ok(page.meshTerms.meshManager.searchResults[5].isEnabled);

    await page.meshTerms.meshManager.selectedTerms[0].remove();
    await page.meshTerms.meshManager.searchResults[3].add();
    assert.ok(page.meshTerms.meshManager.searchResults[3].isDisabled);
    assert.ok(page.meshTerms.meshManager.searchResults[0].isEnabled);
    assert.equal(page.meshTerms.meshManager.selectedTerms.length, 3);

    assert.equal(page.meshTerms.meshManager.selectedTerms[0].title, 'descriptor 1');
    assert.equal(page.meshTerms.meshManager.selectedTerms[1].title, 'descriptor 2');
    assert.equal(page.meshTerms.meshManager.selectedTerms[2].title, 'descriptor 3');
  });

  test('save terms', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(9);
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.equal(page.meshTerms.current.length, 3);
    await page.meshTerms.manage();

    assert.equal(page.meshTerms.meshManager.selectedTerms.length, 3);
    await page.meshTerms.meshManager.search('descriptor');
    await page.meshTerms.meshManager.runSearch();

    await page.meshTerms.meshManager.selectedTerms[0].remove();
    await page.meshTerms.meshManager.searchResults[3].add();

    assert.equal(page.meshTerms.meshManager.selectedTerms[0].title, 'descriptor 1');
    assert.equal(page.meshTerms.meshManager.selectedTerms[1].title, 'descriptor 2');
    assert.equal(page.meshTerms.meshManager.selectedTerms[2].title, 'descriptor 3');

    await page.meshTerms.save();
    assert.equal(page.meshTerms.current.length, 3);
    assert.equal(page.meshTerms.current[0].title, 'descriptor 1');
    assert.equal(page.meshTerms.current[1].title, 'descriptor 2');
    assert.equal(page.meshTerms.current[2].title, 'descriptor 3');
  });

  test('cancel term changes', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(11);
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.equal(page.meshTerms.current.length, 3);
    assert.equal(page.meshTerms.current[0].title, 'descriptor 0');
    assert.equal(page.meshTerms.current[1].title, 'descriptor 1');
    assert.equal(page.meshTerms.current[2].title, 'descriptor 2');

    await page.meshTerms.manage();
    assert.equal(page.meshTerms.meshManager.selectedTerms.length, 3);

    await page.meshTerms.meshManager.search('descriptor');
    await page.meshTerms.meshManager.runSearch();

    await page.meshTerms.meshManager.selectedTerms[0].remove();
    await page.meshTerms.meshManager.searchResults[3].add();

    assert.equal(page.meshTerms.meshManager.selectedTerms[0].title, 'descriptor 1');
    assert.equal(page.meshTerms.meshManager.selectedTerms[1].title, 'descriptor 2');
    assert.equal(page.meshTerms.meshManager.selectedTerms[2].title, 'descriptor 3');

    await page.meshTerms.cancel();
    assert.equal(page.meshTerms.current[0].title, 'descriptor 0');
    assert.equal(page.meshTerms.current[1].title, 'descriptor 1');
    assert.equal(page.meshTerms.current[2].title, 'descriptor 2');
  });
});
