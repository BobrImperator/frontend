import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('toggle-buttons', 'Integration | Component | toggle buttons', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(6);

  const firstLabel = 'label:eq(0)';
  const firstRadio = 'input:eq(0)';
  const secondLabel = 'label:eq(1)';
  const secondRadio = 'input:eq(1)';

  this.set('nothing', parseInt);
  this.render(hbs`{{toggle-buttons
    action=(action nothing)
    firstOptionSelected=true
    firstLabel='First'
    firstIcon='user'
    secondLabel='Second'
    secondIcon='expand'
  }}`);
  assert.equal(this.$(firstLabel).text().trim(), 'First', 'first label has correct text');
  assert.ok(this.$(firstRadio).is(':checked'), 'first radio is checked');
  assert.equal(this.$(firstLabel).attr('for'), this.$(firstRadio).attr('id'), 'first label is linked to radio correctly');

  assert.equal(this.$(secondLabel).text().trim(), 'Second', 'second label has correct text');
  assert.notOk(this.$(secondRadio).is(':checked'), 'second radio is not checked');
  assert.equal(this.$(secondLabel).attr('for'), this.$(secondRadio).attr('id'), 'second label is linked to radio correctly');

});

test('clicking radio fires toggle action', function(assert) {
  assert.expect(2);

  const first = 'input:eq(0)';
  const second = 'input:eq(1)';

  this.set('firstOptionSelected', true);
  let called = 0;
  this.set('toggle', (newValue) => {
    if (called === 0) {
      assert.notOk(newValue, 'has not been toggled yet');
    } else {
      assert.ok(newValue, 'has been toggled');
    }
    this.set('firstOptionSelected', newValue);
    called ++;
  });
  this.render(hbs`{{toggle-buttons
    toggle=(action toggle)
    firstOptionSelected=firstOptionSelected
    firstLabel='Left'
    secondLabel='Right'
  }}`);

  this.$(second).click();
  this.$(first).click();
});

test('clicking selected radio does not fire toggle action', function(assert) {
  assert.expect(1);

  const first = 'input:eq(0)';

  this.set('firstOptionSelected', true);
  this.set('toggle', () => {
    assert.ok(false, 'this should not be fired');
  });
  this.render(hbs`{{toggle-buttons
    toggle=(action toggle)
    firstOptionSelected=firstOptionSelected
    firstLabel='Left'
    secondLabel='Right'
  }}`);

  this.$(first).click();
  assert.equal(this.get('firstOptionSelected'), true);
});
