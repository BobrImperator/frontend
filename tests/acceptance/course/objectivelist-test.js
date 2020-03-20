import {
  module,
  test
} from 'qunit';
import { setupAuthentication } from 'ilios-common';

import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import page from 'ilios-common/page-objects/course';

module('Acceptance | Course - Objective List', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.user = await setupAuthentication();
    this.school = this.server.create('school');
    this.server.create('academicYear', { id: 2013 });
  });

  test('list objectives', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(45);
    this.server.createList('competency', 2, { school: this.school });
    this.server.create('objective', {
      competencyId: 1
    });
    this.server.create('objective');
    this.server.createList('meshDescriptor', 3);
    this.server.create('objective', {
      parentIds: [1],
      meshDescriptorIds: [1]
    });
    this.server.create('objective', {
      parentIds: [2],
      meshDescriptorIds: [1,2]
    });
    this.server.createList('objective', 11);
    this.server.create('course', {
      year: 2013,
      school: this.school,
      objectiveIds: [3,4,5,6,7,8,9,10,11,12,13,14,15]
    });
    await page.visit({ courseId: 1, details: true, courseObjectiveDetails: true });
    assert.equal(page.objectives.objectiveList.objectives.length, 13);

    assert.equal(page.objectives.objectiveList.objectives[0].description.text, 'objective 2');
    assert.equal(page.objectives.objectiveList.objectives[0].parents.length, 1);
    assert.equal(page.objectives.objectiveList.objectives[0].parents[0].description, 'objective 0');
    assert.equal(page.objectives.objectiveList.objectives[0].meshTerms.length, 1);
    assert.equal(page.objectives.objectiveList.objectives[0].meshTerms[0].title, 'descriptor 0');

    assert.equal(page.objectives.objectiveList.objectives[1].description.text, 'objective 3');
    assert.equal(page.objectives.objectiveList.objectives[1].parents.length, 1);
    assert.equal(page.objectives.objectiveList.objectives[1].parents[0].description, 'objective 1');
    assert.equal(page.objectives.objectiveList.objectives[1].meshTerms.length, 2);
    assert.equal(page.objectives.objectiveList.objectives[1].meshTerms[0].title, 'descriptor 0');
    assert.equal(page.objectives.objectiveList.objectives[1].meshTerms[1].title, 'descriptor 1');

    for (let i=2; i <= 12; i++) {
      assert.equal(page.objectives.objectiveList.objectives[i].description.text, `objective ${i + 2}`);
      assert.equal(page.objectives.objectiveList.objectives[i].parents.length, 0);
      assert.equal(page.objectives.objectiveList.objectives[i].meshTerms.length, 0);
    }
  });

  test('long objective', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(3);
    var longTitle = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam placerat tempor neque ut egestas. In cursus dignissim erat, sed porttitor mauris tincidunt at. Nunc et tortor in purus facilisis molestie. Phasellus in ligula nisi. Nam nec mi in urna mollis pharetra. Suspendisse in nibh ex. Curabitur maximus diam in condimentum pulvinar. Phasellus sit amet metus interdum, molestie turpis vel, bibendum eros. In fermentum elit in odio cursus cursus. Nullam ipsum ipsum, fringilla a efficitur non, vehicula vitae enim. Duis ultrices vitae neque in pulvinar. Nulla molestie vitae quam eu faucibus. Vestibulum tempor, tellus in dapibus sagittis, velit purus maximus lectus, quis ullamcorper sem neque quis sem. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed commodo risus sed tellus imperdiet, ac suscipit justo scelerisque. Quisque sit amet nulla efficitur, sollicitudin sem in, venenatis mi. Quisque sit amet neque varius, interdum quam id, condimentum ipsum. Quisque tincidunt efficitur diam ut feugiat. Duis vehicula mauris elit, vel vehicula eros commodo rhoncus. Phasellus ac eros vel turpis egestas aliquet. Nam id dolor rutrum, imperdiet purus ac, faucibus nisi. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nam aliquam leo eget quam varius ultricies. Suspendisse pellentesque varius mi eu luctus. Integer lacinia ornare magna, in egestas quam molestie non.';
    this.server.create('objective', {
      title: longTitle
    });

    this.server.create('course', {
      year: 2013,
      school: this.school,
      objectiveIds: [1]
    });
    await page.visit({ courseId: 1, details: true, courseObjectiveDetails: true });
    assert.equal(page.objectives.objectiveList.objectives.length, 1);
    assert.equal(page.objectives.objectiveList.objectives[0].description.text, longTitle.substring(0, 200));
    await page.objectives.objectiveList.objectives[0].description.openEditor();
    assert.equal(await page.objectives.objectiveList.objectives[0].description.editorContents(), `<p>${longTitle}</p>`);
  });

  test('edit objective title', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(4);
    const newDescription = 'test new title';
    this.server.create('objective');

    this.server.create('course', {
      year: 2013,
      school: this.school,
      objectiveIds: [1]
    });
    await page.visit({ courseId: 1, details: true, courseObjectiveDetails: true });
    assert.equal(page.objectives.objectiveList.objectives.length, 1);
    assert.equal(page.objectives.objectiveList.objectives[0].description.text, 'objective 0');
    await page.objectives.objectiveList.objectives[0].description.openEditor();
    await page.objectives.objectiveList.objectives[0].description.edit(newDescription);
    await page.objectives.objectiveList.objectives[0].description.save();
    assert.equal(page.objectives.objectiveList.objectives.length, 1);
    assert.equal(page.objectives.objectiveList.objectives[0].description.text, newDescription);
  });

  test('empty objective title can not be saved', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(4);
    this.server.create('objective');

    this.server.create('course', {
      year: 2013,
      school: this.school,
      objectiveIds: [1]
    });
    await page.visit({ courseId: 1, details: true, courseObjectiveDetails: true });
    assert.equal(page.objectives.objectiveList.objectives.length, 1);
    assert.notOk(page.objectives.objectiveList.objectives[0].description.hasValidationError);
    await page.objectives.objectiveList.objectives[0].description.openEditor();
    await page.objectives.objectiveList.objectives[0].description.edit('<p>&nbsp</p><div></div><span>  </span>');
    await page.objectives.objectiveList.objectives[0].description.save();
    assert.ok(page.objectives.objectiveList.objectives[0].description.hasValidationError);
    assert.equal(page.objectives.objectiveList.objectives[0].description.validationError, 'This field can not be blank');
  });
});
