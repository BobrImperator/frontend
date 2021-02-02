import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';

import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import page from 'ilios-common/page-objects/session';

module('Acceptance | Session - Terms', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
    const vocabulary = this.server.create('vocabulary', {
      school: this.school,
      active: true,
    });
    this.server.create('academicYear', { id: 2013 });

    const term1 = this.server.create('term', {
      vocabulary,
      active: true,
    });
    this.server.create('term', {
      vocabulary,
      active: true,
    });

    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
    });
    this.server.create('session', {
      course,
      terms: [term1],
    });
  });

  test('taxonomy summary', async function (assert) {
    assert.expect(9);
    await page.visit({ courseId: 1, sessionId: 1 });
    assert.equal(page.collapsedTaxonomies.title, 'Terms (1)');
    assert.equal(page.collapsedTaxonomies.headers.length, 3);
    assert.equal(page.collapsedTaxonomies.headers[0].title, 'Vocabulary');
    assert.equal(page.collapsedTaxonomies.headers[1].title, 'School');
    assert.equal(page.collapsedTaxonomies.headers[2].title, 'Assigned Terms');

    assert.equal(page.collapsedTaxonomies.vocabularies.length, 1);
    assert.equal(page.collapsedTaxonomies.vocabularies[0].name, 'Vocabulary 1');
    assert.equal(page.collapsedTaxonomies.vocabularies[0].school, 'school 0');
    assert.equal(page.collapsedTaxonomies.vocabularies[0].terms, 1);
  });

  test('list terms', async function (assert) {
    assert.expect(4);
    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionTaxonomyDetails: true,
    });
    assert.equal(page.taxonomies.vocabularies.length, 1);
    assert.equal(page.taxonomies.vocabularies[0].vocabularyName, 'Vocabulary 1');
    assert.equal(page.taxonomies.vocabularies[0].terms.length, 1);
    assert.equal(page.taxonomies.vocabularies[0].terms[0].name, 'term 0');
  });

  test('manage terms', async function (assert) {
    assert.expect(10);
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionTaxonomyDetails: true,
    });
    assert.equal(page.taxonomies.vocabularies.length, 1);
    await page.taxonomies.manage();

    assert.equal(page.taxonomies.manager.selectedTerms.length, 1);
    assert.equal(page.taxonomies.manager.selectedTerms[0].vocabularyName, 'Vocabulary 1');
    assert.equal(page.taxonomies.manager.selectedTerms[0].terms.length, 1);
    assert.equal(page.taxonomies.manager.selectedTerms[0].terms[0].name, 'term 0');
    assert.equal(page.taxonomies.manager.availableTerms.length, 2);
    assert.equal(page.taxonomies.manager.availableTerms[0].name, 'term 0');
    assert.ok(page.taxonomies.manager.availableTerms[0].isSelected);
    assert.equal(page.taxonomies.manager.availableTerms[1].name, 'term 1');
    assert.ok(page.taxonomies.manager.availableTerms[1].notSelected);
    await page.taxonomies.cancel();
  });

  test('save term changes', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(5);
    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionTaxonomyDetails: true,
    });
    assert.equal(page.taxonomies.vocabularies.length, 1);
    await page.taxonomies.manage();
    await page.taxonomies.manager.selectedTerms[0].terms[0].remove();
    await page.taxonomies.manager.availableTerms[1].toggle();
    await page.taxonomies.save();

    assert.equal(page.taxonomies.vocabularies.length, 1);
    assert.equal(page.taxonomies.vocabularies[0].vocabularyName, 'Vocabulary 1');
    assert.equal(page.taxonomies.vocabularies[0].terms.length, 1);
    assert.equal(page.taxonomies.vocabularies[0].terms[0].name, 'term 1');
  });

  test('cancel term changes', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(5);
    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionTaxonomyDetails: true,
    });
    assert.equal(page.taxonomies.vocabularies.length, 1);
    await page.taxonomies.manage();
    await page.taxonomies.manager.selectedTerms[0].terms[0].remove();
    await page.taxonomies.manager.availableTerms[1].toggle();
    await page.taxonomies.cancel();

    assert.equal(page.taxonomies.vocabularies.length, 1);
    assert.equal(page.taxonomies.vocabularies[0].vocabularyName, 'Vocabulary 1');
    assert.equal(page.taxonomies.vocabularies[0].terms.length, 1);
    assert.equal(page.taxonomies.vocabularies[0].terms[0].name, 'term 0');
  });
});
