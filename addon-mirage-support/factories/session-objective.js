import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  title: i => `session objective ${i}`,
  position: i => i,
  active: true,
});
