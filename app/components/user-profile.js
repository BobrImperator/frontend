/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
  currentUser: service(),
  user: null,
  canUpdate: false,
  canCreate: false,
  classNames: ['user-profile'],
  'data-test-user-profile': true,
});
