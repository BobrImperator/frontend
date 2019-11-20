import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  intl: service(),
  tagName: 'a',
  classNames: ['back-link'],
  attributeBindings: ['title'],
  title: computed('intl.service', function(){
    const intl = this.get('intl');
    return intl.t('general.returnToPreviousPage');
  }),
  click(){
    window.history.back();
  }
});
