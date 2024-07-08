import { collection, create, notHasClass } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-course-visualize-vocabularies-graph]',
  isIcon: notHasClass('no-icon'),
  chart: {
    scope: '.simple-chart',
    slices: collection('svg .slice'),
  },
};

export default definition;
export const component = create(definition);
