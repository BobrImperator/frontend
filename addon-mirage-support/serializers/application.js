import { JSONAPISerializer } from 'ember-cli-mirage';
import { camelize } from '@ember/string';

export default JSONAPISerializer.extend({
  serializeIds: 'always',
  normalizeIds: 'always',
  alwaysIncludeLinkageData: true,
  keyForAttribute(key) {
    return camelize(key);
  },
  keyForRelationship(key) {
    return camelize(key);
  },
});
