import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency-decorators';
import { filter } from 'rsvp';

export default class SelectableTermsList extends Component {
  @tracked terms = [];

  get topLevelTermsRelationshipPromise() {
    return this.args.vocabulary ? this.args.vocabulary.get('topLevelTerms') : null;
  }

  @restartableTask
  *loadFilteredTerms() {
    let terms = [];
    if (this.topLevelTermsRelationshipPromise) {
      terms = (yield this.topLevelTermsRelationshipPromise).toArray();
    } else if (this.args.terms) {
      terms = this.args.terms.toArray();
    }

    if (this.args.termFilter) {
      const exp = new RegExp(this.args.termFilter, 'gi');
      this.terms = yield filter(terms, async (term) => {
        const searchString = await term.get('titleWithDescendantTitles');
        return searchString.match(exp);
      });
    } else {
      this.terms = terms;
    }
  }
}
