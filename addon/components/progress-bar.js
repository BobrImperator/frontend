import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';

export default Component.extend({
  classNames: ['progress-bar'],
  percentage: 0,
  widthStyle: computed('percentage', function(){
    const percentage = this.get('percentage');
    const str = `width: ${percentage}%`;

    return htmlSafe(str);
  }),
});
