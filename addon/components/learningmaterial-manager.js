import Component from '@glimmer/component';
import { dropTask, restartableTask } from 'ember-concurrency-decorators';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import moment from 'moment';
import { validatable, Length, AfterDate, NotBlank } from 'ilios-common/decorators/validation';

@validatable
export default class LearningMaterialManagerComponent extends Component {
  @service store;

  @tracked notes;
  @tracked learningMaterial;

  @Length(4, 120) @NotBlank() @tracked title;
  @AfterDate('startDate', { granularity: 'minute' }) @tracked endDate;

  @tracked type;
  @tracked owningUser;
  @tracked originalAuthor;
  @tracked description;
  @tracked copyrightPermission;
  @tracked copyrightRationale;
  @tracked citation;
  @tracked link;
  @tracked mimetype;
  @tracked absoluteFileUri;
  @tracked filename;
  @tracked uploadDate;
  @tracked closeManager;
  @tracked terms;
  @tracked startDate;
  @tracked parentMaterial;
  @tracked statusId;
  @tracked userRoleTitle;
  @tracked publicNotes;
  @tracked required;

  get isFile() {
    return this.type === 'file';
  }
  get isLink() {
    return this.type === 'link';
  }
  get isCitation() {
    return this.type === 'citation';
  }

  @action
  updateDate(which, value) {
    const oldDate = moment(this[which]);
    const newDate = moment(value);
    const hour = oldDate.get('hour');
    const minute = oldDate.get('minute');
    newDate.set({ hour, minute });
    this[which] = newDate.toDate();
  }
  @action
  updateTime(which, value, type) {
    const oldDate = moment(this[which]);
    const year = oldDate.get('year');
    const month = oldDate.get('month');
    const date = oldDate.get('date');
    let hour = oldDate.get('hour');
    let minute = oldDate.get('minute');
    if (type === 'hour') {
      hour = value;
    }
    if (type === 'minute') {
      minute = value;
    }

    const newDate = moment();
    newDate.set({ year, month, date, hour, minute });
    this[which] = newDate.toDate();
  }
  @action
  addDate(which) {
    this[which] = moment().hour(8).minute(0).second(0).toDate();
  }
  @action
  addTerm(term) {
    this.terms = [...this.terms, term];
  }
  @action
  removeTerm(term) {
    this.terms = this.terms.filter((obj) => obj !== term);
  }
  @action
  updateStatusId(event) {
    this.statusId = event.target.value;
  }

  get courseLearningMaterialIds() {
    if (!this.parentMaterial) {
      return [];
    }
    return this.parentMaterial.hasMany('courseLearningMaterials').ids();
  }

  get sessionLearningMaterialIds() {
    if (!this.parentMaterial) {
      return [];
    }
    return this.parentMaterial.hasMany('sessionLearningMaterials').ids();
  }

  /**
   * Whether the given learning material is linked to no more than one session or course.
   * @property isUnlinked
   * @type {Ember.computed}
   * @public
   */
  get isLinkedOnlyOnce() {
    return this.courseLearningMaterialIds.length + this.sessionLearningMaterialIds.length === 1;
  }

  get currentStatus() {
    return this.args.learningMaterialStatuses.findBy('id', this.statusId);
  }

  @restartableTask
  *load(element, [learningMaterial, parentMaterial]) {
    if (!learningMaterial || !parentMaterial) {
      return;
    }
    this.notes = learningMaterial.notes;
    this.required = learningMaterial.required;
    this.publicNotes = learningMaterial.publicNotes;
    this.startDate = learningMaterial.startDate;
    this.endDate = learningMaterial.endDate;

    const meshDescriptors = yield learningMaterial.get('meshDescriptors');
    this.terms = meshDescriptors.toArray();

    this.parentMaterial = parentMaterial;
    this.type = parentMaterial.type;
    this.title = parentMaterial.title;
    this.originalAuthor = parentMaterial.originalAuthor;
    this.description = parentMaterial.description;
    this.copyrightPermission = parentMaterial.copyrightPermission;
    this.copyrightRationale = parentMaterial.copyrightRationale;
    this.citation = parentMaterial.citation;
    this.link = parentMaterial.link;
    this.mimetype = parentMaterial.mimetype;
    this.absoluteFileUri = parentMaterial.absoluteFileUri;
    this.filename = parentMaterial.filename;
    this.uploadDate = parentMaterial.uploadDate;

    const status = yield parentMaterial.get('status');
    this.statusId = status.id;
    this.owningUser = yield parentMaterial.get('owningUser');
    const userRole = yield parentMaterial.get('userRole');
    this.userRoleTitle = userRole.title;
  }
  @dropTask
  *save() {
    this.addErrorDisplayForAllFields();
    const isTitleValid = yield this.isValid('title');
    const isEndDateValid = this.startDate && this.endDate ? yield this.isValid('endDate') : true;
    if (!isTitleValid || !isEndDateValid) {
      return false;
    }
    this.clearErrorDisplay();

    this.args.learningMaterial.set('publicNotes', this.publicNotes);
    this.args.learningMaterial.set('required', this.required);
    this.args.learningMaterial.set('notes', this.notes);
    this.args.learningMaterial.set('startDate', this.startDate);
    this.args.learningMaterial.set('endDate', this.endDate);

    this.parentMaterial.set('status', this.currentStatus);
    this.parentMaterial.set('title', this.title);
    this.parentMaterial.set('description', this.description);

    this.args.learningMaterial.set('meshDescriptors', this.terms);
    yield this.args.learningMaterial.save();
    yield this.parentMaterial.save();
    this.args.closeManager();
  }
}
