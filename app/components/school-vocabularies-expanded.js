import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { dropTask, restartableTask } from 'ember-concurrency';
import { map } from 'rsvp';

export default class SchoolVocabulariesExpandedComponent extends Component {
  @service store;
  @tracked schoolVocabularies = [];

  #loadedSchools = {};

  get isManaging() {
    return !!this.args.managedVocabularyId;
  }

  get isCollapsible() {
    return this.schoolVocabularies?.length && !this.isManaging;
  }

  async loadSchool(schoolId) {
    if (!(schoolId in this.#loadedSchools)) {
      this.#loadedSchools[schoolId] = this.store.findRecord('school', schoolId, {
        include: 'vocabularies.terms',
        reload: true,
      });
    }

    return this.#loadedSchools[schoolId];
  }

  @restartableTask
  *load() {
    yield this.loadSchool(this.args.school.id);
    const vocabularies = (yield this.args.school.vocabularies).slice();
    this.schoolVocabularies = yield map(vocabularies, async (vocabulary) => {
      const terms = await vocabulary.terms;
      return {
        vocabulary,
        terms,
      };
    });
  }

  get managedVocabulary() {
    if (!this.args.managedVocabularyId || !this.schoolVocabularies.length) {
      return null;
    }

    const { vocabulary } = this.schoolVocabularies.find(({ vocabulary }) => {
      return Number(this.args.managedVocabularyId) === Number(vocabulary.id);
    });

    return vocabulary;
  }

  get managedTerm() {
    if (
      !this.schoolVocabularies.length ||
      !this.args.managedVocabularyId ||
      !this.args.managedTermId
    ) {
      return null;
    }

    const { terms } = this.schoolVocabularies.find(({ vocabulary }) => {
      return Number(this.args.managedVocabularyId) === Number(vocabulary.id);
    });

    return terms.findBy('id', this.args.managedTermId);
  }

  @action
  doCollapse() {
    if (this.isCollapsible && this.schoolVocabularies.length) {
      this.args.collapse();
      this.args.setSchoolManagedVocabulary(null);
      this.args.setSchoolManagedVocabularyTerm(null);
    }
  }

  @dropTask
  *saveNewVocabulary(title, school, active) {
    const vocabulary = this.store.createRecord('vocabulary', {
      title,
      school,
      active,
    });
    this.args.setSchoolNewVocabulary(null);
    yield vocabulary.save();
  }
}
