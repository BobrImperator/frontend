import Component from '@ember/component';

export default Component.extend({
  classNames: ['selectable-terms-list'],
  tagName: 'ul',
  selectedTerms: null,
  terms: null,
  actions: {
    add(term) {
      this.add(term);

    },
    remove(term) {
      this.remove(term);
    }
  }
});
