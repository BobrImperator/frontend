import Component from '@ember/component';
import ObjectiListItem from 'ilios/mixins/objective-list-item';

export default Component.extend(ObjectiListItem, {
  programYear: null,
  expanded: true,
  classNames: ['objective-list-item'],
});
