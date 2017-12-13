import Helper from '@ember/component/helper';
import { observer } from '@ember/object';

export function isIn([values, item]) {
  if (!values) {
    return false;
  }

  if (!item) {
    return false;
  }

  return values.includes(item);
}

export default Helper.extend({
  values: [],

  compute([values, item]) {
    this.set('values', values);

    return isIn([values, item]);
  },

  recomputeOnArrayChange: observer('values.[]', function() {
    this.recompute();
  })
});
