import Component from '@ember/component';

export default Component.extend({
  label: null,
  yes: false,
  tagName: 'span',
  classNames: ['toggle-yesno'],
  'data-test-toggle-yesno': true,
  click(){
    const yes = this.get('yes');
    this.get('toggle')(!yes);
  }
});
