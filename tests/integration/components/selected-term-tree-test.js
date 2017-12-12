import EmberObject from '@ember/object';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('selected-term-tree', 'Integration | Component | selected term tree', {
  integration: true
});

const tree = [
  EmberObject.create({
    title: 'top 1',
    children: []
  }),
  EmberObject.create({
    title: 'top 2',
    children: [
      EmberObject.create({
        title: 'top 2 child 1',
        children: []
      }),
    ]
  }),
];

test('it renders a tree', function (assert) {
  this.set('tree', tree);
  this.set('selectedTerms', [tree[1].children[0]]);
  this.set('toggle', () => { });
  this.render(hbs`{{selected-term-tree
    terms=tree
    selectedTerms=selectedTerms
    toggle=(action toggle)
  }}`);
  const topTerms = 'ul:eq(0) > li';
  const firstTopTerm = `${topTerms}:eq(0)`;
  const firstTopTermCheckbox = `${firstTopTerm} input`;
  const secondTopTerm = `${topTerms}:eq(1)`;
  const firstTopTermChildren = `${firstTopTerm} ul > li`;
  const secondTopTermChildren = `${secondTopTerm} ul > li`;
  const secondTopTermFirstChildCheckbox = `${secondTopTermChildren}:eq(0) input`;


  assert.equal(this.$(firstTopTerm).text().trim(), 'top 1');
  assert.notOk(this.$(firstTopTermCheckbox).is('checked'));
  assert.equal(this.$(secondTopTerm).text().replace(/\s/g, ''), 'top2top2child1');
  assert.equal(this.$(firstTopTermChildren).text().trim(), '');
  assert.equal(this.$(secondTopTermChildren).text().trim(), 'top 2 child 1');
  assert.ok(this.$(secondTopTermFirstChildCheckbox).is(':checked'));
});

test('clicking checkbox fires toggle', function (assert) {
  assert.expect(1);
  this.set('tree', tree);
  this.set('selectedTerms', []);
  this.set('toggle', (term) => {
    assert.equal(term, tree[1]);
  });
  this.render(hbs`{{selected-term-tree
    terms=tree
    selectedTerms=selectedTerms
    toggle=(action toggle)
  }}`);
  const topTerms = 'ul:eq(0) > li';
  const secondTopTerm = `${topTerms}:eq(1)`;
  const secondTermCheckbox = `${secondTopTerm} input:eq(0)`;

  this.$(secondTermCheckbox).click();
});

test('clicking title fires toggle', function (assert) {
  assert.expect(1);
  this.set('tree', tree);
  this.set('selectedTerms', []);
  this.set('toggle', (term) => {
    assert.equal(term, tree[1]);
  });
  this.render(hbs`{{selected-term-tree
    terms=tree
    selectedTerms=selectedTerms
    toggle=(action toggle)
  }}`);
  const topTerms = 'ul:eq(0) > li';
  const secondTopTerm = `${topTerms}:eq(1)`;
  const secondTermCheckbox = `${secondTopTerm} span:eq(0)`;

  this.$(secondTermCheckbox).click();
});
