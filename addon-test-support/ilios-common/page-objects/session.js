import {
  attribute,
  clickable,
  collection,
  create,
  fillable,
  hasClass,
  isVisible,
  property,
  text,
  visitable
} from 'ember-cli-page-object';
import objectives from './components/session/objectives';
import learningMaterials from './components/learning-materials';
import meshTerms from './components/mesh-terms';
import taxonomies from './components/detail-taxonomies';
import collapsedTaxonomies from './components/collapsed-taxonomies';
import instructorSelectionManager from './components/instructor-selection-manager';
import offeringForm from './components/offering-form';
import { datePicker, pageObjectFillInFroalaEditor } from 'ilios-common';
import leadershipCollapsed from './components/leadership-collapsed';
import leadershipList from './components/leadership-list';
import leadershipManager from './components/leadership-manager';
import postrequisiteEditor from './components/session/postrequisite-editor';
import detailLearnersAndLearnerGroups from './components/detail-learners-and-learner-groups';

export default create({
  scope: '[data-test-session-details]',
  visit: visitable('/courses/:courseId/sessions/:sessionId'),

  overview: {
    scope: '[data-test-session-overview]',
    title: {
      scope: '.session-header',
      title: text('.editable'),
      edit: clickable('[data-test-edit]'),
      set: fillable('input'),
      save: clickable('.done'),
      value: text('.title')
    },
    copy: {
      scope: 'a.copy',
      visit: clickable(),
      link: attribute('href'),
      visible: isVisible(),
    },
    sessionType: {
      scope: '.sessiontype',
      value: text('span', { at: 0}),
      edit: clickable('[data-test-edit]'),
      set: fillable('select'),
      save: clickable('.done'),
      hasError: isVisible('.validation-error-message')
    },
    sessionDescription: {
      scope: '.sessiondescription',
      value: text('span', { at: 0}),
      edit: clickable('[data-test-edit]'),
      set: pageObjectFillInFroalaEditor('[data-test-html-editor]'),
      save: clickable('.done'),
      cancel: clickable('.cancel'),
      hasError: isVisible('.validation-error-message')
    },
    instructionalNotes: {
      scope: '[data-test-instructional-notes]',
      value: text('span', { at: 0}),
      edit: clickable('[data-test-edit]'),
      set: pageObjectFillInFroalaEditor('[data-test-html-editor]'),
      save: clickable('.done'),
      cancel: clickable('.cancel'),
      hasError: isVisible('.validation-error-message')
    },
    ilmHours: {
      scope: '.sessionilmhours',
      value: text('span', { at: 0}),
      edit: clickable('[data-test-edit]'),
      set: fillable('input'),
      save: clickable('.done'),
      hasError: isVisible('.validation-error-message'),
    },
    ilmDueDate: {
      scope: '.sessionilmduedate',
      value: text('span', { at: 0}),
      edit: clickable('[data-test-edit]'),
      set: datePicker('input'),
      save: clickable('.done'),
      hasError: isVisible('.validation-error-message'),
    },
    supplemental: {
      scope: '.sessionsupplemental',
      isActive: property('checked', 'input'),
      click: clickable('[data-test-toggle-yesno] [data-test-handle]'),
    },
    specialAttire: {
      scope: '.sessionspecialattire',
      isActive: property('checked', 'input'),
      click: clickable('[data-test-toggle-yesno] [data-test-handle]'),
    },
    specialEquipment: {
      scope: '.sessionspecialequipment',
      isActive: property('checked', 'input'),
      click: clickable('[data-test-toggle-yesno] [data-test-handle]'),
    },
    attendanceRequired: {
      scope: '.sessionattendancerequired',
      isActive: property('checked', 'input'),
      click: clickable('[data-test-toggle-yesno] [data-test-handle]'),
    },
    toggleIlm: clickable('[data-test-toggle-yesno] [data-test-handle]', { scope: '.independentlearningcontrol' }),
    prerequisites: {
      scope: '.prerequisites',
    },
    postrequisite: {
      scope: '[data-test-postrequisite]',
      value: text('[data-test-edit]'),
      edit: clickable('[data-test-edit]'),
      editor: postrequisiteEditor
    },
    lastUpdated: text('.last-update'),
  },

  leadershipCollapsed,
  leadershipExpanded: {
    scope: '[data-test-session-leadership-expanded]',
    title: text('.title'),
    manage: clickable('.actions button'),
    save: clickable('.actions button.bigadd'),
    cancel: clickable('.actions button.bigcancel'),
    leadershipList,
    leadershipManager,
  },

  objectives,
  learningMaterials,
  meshTerms,
  taxonomies,
  collapsedTaxonomies,
  detailLearnersAndLearnerGroups,
  learnersAreVisible: isVisible('[data-test-detail-learners-and-learner-groups]'),
  instructorsAreVisible: isVisible('[data-test-detail-instructors]'),
  instructors: {
    scope: '[data-test-detail-instructors]',
    manage: clickable('.actions button'),
    save: clickable('.actions button.bigadd'),
    cancel: clickable('.actions button.bigcancel'),
    title: text('.detail-instructors-header .title'),
    currentGroups: collection('[data-test-instructor-group]', {
      title: text('[data-test-instructor-group-title]'),
      members: collection('[data-test-instructor-group-members] li', {
        text: text(),
      }),
    }),
    currentInstructors: collection('[data-test-instructors] li', {
      title: text(),
    }),
    manager: instructorSelectionManager,
  },

  offerings: {
    scope: '[data-test-session-offerings]',
    header: {
      scope: '.offering-section-top',
      title: text('.title'),
      createNew: clickable('.actions button'),
    },
    dateBlocks: collection('[data-test-session-offerings-list] .offering-block', {
      dayOfWeek: text('.offering-block-date-dayofweek'),
      dayOfMonth: text('.offering-block-date-dayofmonth'),
      startTime: text('.offering-block-time-time-starttime'),
      hasStartTime: isVisible('.offering-block-time-time-starttime'),
      endTime: text('.offering-block-time-time-endtime'),
      hasEndTime: isVisible('.offering-block-time-time-endtime'),
      multiDay: text('.multiday-offering-block-time-time'),
      hasMultiDay: isVisible('.multiday-offering-block-time-time'),
      offerings: collection('[data-test-offerings] [data-test-offering-manager]', {
        learnerGroups: collection('.offering-manager-learner-groups li', {
          title: text()
        }),
        location: text('[data-test-location]'),
        url: property('href', '[data-test-url] a'),
        instructors: collection('.offering-manager-instructors [data-test-instructor]', {
          title: text()
        }),
        edit: clickable('.edit'),
        remove: clickable('.remove'),
        hasRemoveConfirm: hasClass('show-remove-confirmation'),
        removeConfirmMessage: text('.confirm-message'),
        confirmRemoval: clickable('.remove', { scope: '.confirm-buttons'}),
        cancelRemoval: clickable('.cancel', { scope: '.confirm-buttons' }),
        offeringForm,
      }),
    }),
    offeringForm,
    smallGroup: clickable('.choose-offering-type button', { at: 0}),
    singleOffering: clickable('.choose-offering-type button', { at: 1}),
  },
});
