import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios-common/page-objects/components/click-choice-buttons';

module('Integration | Component | click choice buttons', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(4);
    await render(hbs`<ClickChoiceButtons
      @toggle={{noop}}
      @firstChoicePicked={{true}}
      @buttonContent1="Left Button"
      @buttonContent2="Right Button"
    />`);
    assert.equal(component.firstButton.text, 'Left Button', 'first button has correct text');
    assert.equal(component.secondButton.text, 'Right Button', 'second button has correct text');
    assert.ok(component.firstButton.isActive);
    assert.notOk(component.secondButton.isActive);
  });

  test('it renders second choice picked', async function(assert) {
    assert.expect(4);
    await render(hbs`<ClickChoiceButtons
      @toggle={{noop}}
      @firstChoicePicked={{false}}
      @buttonContent1="Left Button"
      @buttonContent2="Right Button"
    />`);
    assert.equal(component.firstButton.text, 'Left Button', 'first button has correct text');
    assert.equal(component.secondButton.text, 'Right Button', 'second button has correct text');
    assert.notOk(component.firstButton.isActive);
    assert.ok(component.secondButton.isActive);
  });

  test('click fires toggle action', async function(assert) {
    assert.expect(8);
    this.set('firstChoicePicked', true);
    let called = 0;
    this.set('toggle', (newValue) => {
      if (called === 0) {
        assert.notOk(newValue, 'has not been toggled yet');
      } else {
        assert.ok(newValue, 'has been toggled');
      }
      this.set('firstChoicePicked', newValue);
      called ++;
    });
    await render(hbs`<ClickChoiceButtons
      @toggle={{action this.toggle}}
      @firstChoicePicked={{this.firstChoicePicked}}
      @buttonContent1="Left Button"
      @buttonContent2="Right Button"
    />`);
    assert.ok(component.firstButton.isActive);
    assert.notOk(component.secondButton.isActive);

    await component.secondButton.click();

    assert.notOk(component.firstButton.isActive);
    assert.ok(component.secondButton.isActive);

    await component.firstButton.click();

    assert.ok(component.firstButton.isActive);
    assert.notOk(component.secondButton.isActive);
  });

  test('clicking selected button does not fire toggle action', async function(assert) {
    assert.expect(4);
    this.set('toggle', () => {
      assert.ok(false, 'this should not be fired');
    });
    await render(hbs`<ClickChoiceButtons
      @toggle={{this.toggle}}
      @firstChoicePicked={{true}}
      @buttonContent1="Left Button"
      @buttonContent2="Right Button"
    />`);

    assert.ok(component.firstButton.isActive);
    assert.notOk(component.secondButton.isActive);

    await component.firstButton.click();

    assert.ok(component.firstButton.isActive);
    assert.notOk(component.secondButton.isActive);
  });
});
