import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/learningmaterial-search';

module('Integration | Component | learningmaterial search', function(hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);
  setupMirage(hooks);

  test('search shows results', async function(assert) {
    assert.expect(1);
    this.server.createList('learning-material', 2);
    await render(hbs`<LearningmaterialSearch />`);
    await component.search('material');
    assert.equal(component.searchResults.length, 2);
  });

  test('empty search clears results', async function(assert) {
    assert.expect(2);
    this.server.createList('learning-material', 2);
    await render(hbs`<LearningmaterialSearch />`);
    await component.search('    material    ');
    assert.equal(component.searchResults.length, 2);
    await component.search('        ');
    assert.equal(component.searchResults.length, 0);
  });
});
