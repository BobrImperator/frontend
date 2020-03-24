import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | dashboard/SelectedTermTree', function(hooks) {
  setupRenderingTest(hooks);

  const tree = [
    EmberObject.create({
      id: 1,
      title: 'top 1',
      children: []
    }),
    EmberObject.create({
      id: 2,
      title: 'top 2',
      children: [
        EmberObject.create({
          id: 3,
          title: 'top 2 child 1',
          children: []
        }),
      ]
    }),
  ];

  test('it renders a tree', async function(assert) {
    this.set('tree', tree);
    this.set('selectedTermIds', [3]);
    await render(hbs`<Dashboard::SelectedTermTree
      @terms={{this.tree}}
      @selectedTermIds={{this.selectedTermIds}}
      @add={{noop}}
      @remove={{noop}}
    />`);
    const topTerms = 'ul:nth-of-type(1) > li';
    const firstTopTerm = `${topTerms}:nth-of-type(1)`;
    const firstTopTermCheckbox = `${firstTopTerm} input`;
    const secondTopTerm = `${topTerms}:nth-of-type(2)`;
    const firstTopTermChildren = `${firstTopTerm} ul > li`;
    const secondTopTermChildren = `${secondTopTerm} ul > li`;
    const secondTopTermFirstChildCheckbox = `${secondTopTermChildren}:nth-of-type(1) input`;

    assert.dom(firstTopTerm).hasText('top 1');
    assert.dom(firstTopTermCheckbox).isNotChecked();
    assert.dom(secondTopTerm).hasText('top 2 top 2 child 1');
    assert.dom(firstTopTermChildren).doesNotExist();
    assert.dom(secondTopTermChildren).hasText('top 2 child 1');
    assert.dom(secondTopTermFirstChildCheckbox).isChecked();
  });

  test('clicking unchecked checkbox fires add', async function(assert) {
    assert.expect(1);
    this.set('tree', tree);
    this.set('add', (id) => {
      assert.equal(id, 1);
    });
    await render(hbs`<Dashboard::SelectedTermTree
      @terms={{this.tree}}
      @selectedTermIds={{array}}
      @add={{fn this.add}}
      @remove={{noop}}
    />`);
    await click('[data-test-target]:nth-of-type(1)');
  });

  test('clicking checked checkbox fires add', async function(assert) {
    assert.expect(1);
    this.set('tree', tree);
    this.set('selectedTermIds', [1]);
    this.set('remove', (id) => {
      assert.equal(id, 1);
    });
    await render(hbs`<Dashboard::SelectedTermTree
      @terms={{this.tree}}
      @selectedTermIds={{this.selectedTermIds}}
      @add={{noop}}
      @remove={{fn this.remove}}
    />`);
    await click('[data-test-target]:nth-of-type(1)');
  });
});
