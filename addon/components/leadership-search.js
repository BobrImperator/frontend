import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { isBlank } from '@ember/utils';
import { task, timeout } from 'ember-concurrency';
import { cleanQuery } from 'ilios-common/utils/query-utils';

const { mapBy } = computed;

const DEBOUNCE_MS = 250;
const MIN_INPUT = 3;

export default Component.extend({
  store: service(),
  intl: service(),
  classNames: ['leadership-search'],
  existingUsers: null,
  searchValue: null,
  'data-test-leadership-search': true,

  existingUserIds: mapBy('existingUsers', 'id'),
  searchForUsers: task(function * (query) {
    const intl = this.get('intl');
    const store = this.get('store');
    this.set('searchValue', query);

    const q = cleanQuery(query);
    if (isBlank(q)) {
      yield timeout(1);
      return [];
    }

    if (q.length < MIN_INPUT) {
      return [{
        type: 'text',
        text: intl.t('general.moreInputRequiredPrompt')
      }];
    }
    yield timeout(DEBOUNCE_MS);

    const searchResults = yield store.query('user', {
      q,
      'order_by[lastName]': 'ASC',
      'order_by[firstName]': 'ASC',
      limit: 100
    });
    if (searchResults.length === 0) {
      return [{
        type: 'text',
        text: intl.t('general.noSearchResultsPrompt')
      }];
    }
    const mappedResults = searchResults.map(user => {
      return {
        type: 'user',
        user
      };
    });
    const results = [
      {
        type: 'summary',
        text: intl.t('general.resultsCount', {count: mappedResults.length})
      }
    ];
    results.pushObjects(mappedResults);

    return results;
  }).restartable(),

  clickUser: task(function * (user) {
    const existingUserIds = this.get('existingUserIds');
    if (existingUserIds.includes(user.get('id'))) {
      return;
    }
    this.set('searchValue', null);
    yield this.get('searchForUsers').perform(null);
    this.get('selectUser')(user);
  }).drop(),
});
