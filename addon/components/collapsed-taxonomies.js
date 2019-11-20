import Component from '@ember/component';

export default Component.extend({
  tagName: 'section',
  classNames: ['collapsed-taxonomies'],
  subject: null,
  'data-test-collapsed-taxonomies': true,
});
