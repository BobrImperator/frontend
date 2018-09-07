import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | school manager', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.actions.nothing = parseInt;
    await render(hbs`{{school-manager
      setSchoolCompetencyDetails=(action 'nothing')
      setSchoolManageCompetencies=(action 'nothing')
      setSchoolVocabularyDetails=(action 'nothing')
      setSchoolLeadershipDetails=(action 'nothing')
      setSchoolManageLeadership=(action 'nothing')
      setSchoolSessionAttributesDetails=(action 'nothing')
      setSchoolManageSessionAttributes=(action 'nothing')
      setSchoolSessionTypeDetails=(action 'nothing')
      setSchoolManagedSessionType=(action 'nothing')
    }}`);

    assert.notEqual(this.$().text().search(/Back to Schools List/), -1);
  });
});
