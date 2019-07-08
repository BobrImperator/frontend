import { inject as service } from '@ember/service';
import layout from '../templates/components/detail-learning-materials';
import { isEmpty } from '@ember/utils';
import Component from '@ember/component';
import { computed } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';
import { all, map } from 'rsvp';
import SortableByPosition from 'ilios-common/mixins/sortable-by-position';

const { notEmpty, not } = computed;

export default Component.extend(SortableByPosition, {
  currentUser: service(),
  store: service(),
  intl: service(),
  layout,
  tagName: 'section',
  classNameBindings: [':detail-learningmaterials', 'displaySearchBox'],
  subject: null,
  isCourse: false,
  editable: true,
  isSorting: false,
  isSaving: false,
  managingMaterial: null,
  totalMaterialsToSave: null,
  currentMaterialsSaved: null,

  displayAddNewForm: false,
  type: null,
  'data-test-detail-learning-materials': true,

  isManaging: notEmpty('managingMaterial'),
  isSession: not('isCourse'),
  displaySearchBox: computed('isManaging', 'displayAddNewForm', 'isSorting', function(){
    const isManaging = this.get('isManaging');
    const displayAddNewForm = this.get('displayAddNewForm');
    const editable = this.get('editable');
    const isSorting = this.get('isSorting');

    return (!isManaging && !displayAddNewForm && !isSorting && editable);
  }),

  proxyMaterials: computed('subject.learningMaterials.@each.position', async function() {
    const materialProxy = ObjectProxy.extend({ confirmRemoval: false });
    const materials = await this.subject.get('learningMaterials');
    return materials
      .toArray()
      .sort(this.positionSortingCallback)
      .map((material) =>  materialProxy.create({ content: material }));
  }),

  parentMaterials: computed('subject.learningMaterials.[]', async function () {
    const subLms = await this.get('subject.learningMaterials');
    const learningMaterials = map(subLms.toArray(), async subjectMaterial => {
      return await subjectMaterial.get('learningMaterial');
    });

    return learningMaterials;
  }),

  hasMoreThanOneLearningMaterial: computed('subject.learningMaterials.[]', async function () {
    const subject = this.get('subject');
    const learningMaterials = await subject.get('learningMaterials');

    return learningMaterials.length > 1;
  }),

  learningMaterialStatuses: computed(async function () {
    const store = this.get('store');
    return await store.findAll('learning-material-status');
  }),
  learningMaterialUserRoles: computed(async function () {
    const store = this.get('store');
    return await store.findAll('learning-material-user-role');
  }),

  actions: {
    confirmRemoval(lmProxy) {
      lmProxy.set('showRemoveConfirmation', true);
    },
    cancelRemove(lmProxy) {
      lmProxy.set('showRemoveConfirmation', false);
    },
    addNewLearningMaterial(type) {
      this.setProperties({type, displayAddNewForm: true});
    },

    async saveNewLearningMaterial(lm) {
      const store = this.get('store');
      const isCourse = this.get('isCourse');
      const subject = this.get('subject');
      const savedLm = await lm.save();
      const learningMaterials = await subject.get('learningMaterials');

      let lmSubject;
      let position = 0;
      if (!isEmpty(learningMaterials)) {
        position = learningMaterials.toArray().sortBy('position').reverse()[0].get('position') + 1;
      }
      if (isCourse) {
        lmSubject = store.createRecord('course-learning-material', {course: subject, position});
      } else {
        lmSubject = store.createRecord('session-learning-material', {session: subject, position});
      }
      lmSubject.set('learningMaterial', savedLm);
      await lmSubject.save();
      this.set('displayAddNewForm', false);
    },

    saveSortOrder(learningMaterials) {
      this.set('isSaving', true);
      for (let i = 0, n = learningMaterials.length; i < n; i++) {
        let lm = learningMaterials[i];
        lm.set('position', i + 1);
      }
      this.set('totalMaterialsToSave', learningMaterials.length);
      this.set('currentMaterialsSaved', 0);

      this.saveSomeMaterials(learningMaterials).then(() => {
        this.set('isSaving', false);
        this.set('isSorting', false);
      });
    },

    async addLearningMaterial(parentLearningMaterial) {
      const store = this.get('store');
      let newLearningMaterial;
      let lmCollectionType;
      let subject = this.get('subject');

      if (this.get('isCourse')) {
        newLearningMaterial = store.createRecord('course-learning-material', {
          course: subject,
          learningMaterial: parentLearningMaterial,
          position: 0,
        });
        lmCollectionType = 'courseLearningMaterials';

      }
      if (this.get('isSession')) {
        newLearningMaterial = store.createRecord('session-learning-material', {
          session: subject,
          learningMaterial: parentLearningMaterial,
          position: 0
        });
        lmCollectionType = 'sessionLearningMaterials';
      }
      const learningMaterials = await subject.get('learningMaterials');
      let position = 0;
      if (learningMaterials.length > 1) {
        position = learningMaterials.toArray().sortBy('position').reverse()[0].get('position') + 1;
      }
      newLearningMaterial.set('position', position);
      const savedLearningMaterial = await newLearningMaterial.save();
      const children = await parentLearningMaterial.get(lmCollectionType);
      children.pushObject(savedLearningMaterial);

      return savedLearningMaterial;
    },

    async remove(lmProxy) {
      const subjectLearningMaterial = lmProxy.get('content');
      subjectLearningMaterial.deleteRecord();
      return subjectLearningMaterial.save();
    },
  },
  saveSomeMaterials(arr){
    let chunk = arr.splice(0, 5);
    return all(chunk.invoke('save')).then(() => {
      if (arr.length){
        this.set('currentMaterialsSaved', this.get('currentMaterialsSaved') + chunk.length);
        return this.saveSomeMaterials(arr);
      }
    });
  },
});
