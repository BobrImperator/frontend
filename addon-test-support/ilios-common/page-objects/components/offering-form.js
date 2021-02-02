import {
  clickable,
  collection,
  create,
  fillable,
  hasClass,
  isPresent,
  isVisible,
  property,
  text,
  triggerable,
  value,
} from 'ember-cli-page-object';
import { flatpickrDatePicker } from 'ilios-common';
import userNameInfo from './user-name-info';
import detailLearnergroupsList from './detail-learnergroups-list';
import learnergroupTree from './learnergroup-tree';

const definition = {
  scope: '[data-test-offering-form]',
  startDate: {
    scope: '.start-date',
    set: flatpickrDatePicker('input'),
    value: value('input'),
  },
  endDate: {
    scope: '.end-date-time',
    label: text('label'),
    value: text('.text'),
  },
  startTime: {
    scope: '.start-time',
    hour: fillable('select', { at: 0 }),
    minutes: fillable('select', { at: 1 }),
    ampm: fillable('select', { at: 2 }),
  },
  duration: {
    scope: '.offering-duration',
    hours: {
      scope: '.hours input',
      set: fillable(),
      submit: triggerable('keypress', '', {
        eventProperties: { key: 'Enter' },
      }),
    },
    minutes: {
      scope: '.minutes input',
      set: fillable(),
      submit: triggerable('keypress', '', {
        eventProperties: { key: 'Enter' },
      }),
    },
  },
  timezoneEditor: {
    scope: '[data-test-timezone-picker]',
    currentTimezone: {
      scope: '[data-test-current-timezone]',
      edit: clickable(),
    },
    label: {
      scope: 'label',
    },
    picker: {
      scope: '.picker select',
      select: fillable(),
    },
    cancel: clickable('.actions .cancel'),
  },
  location: {
    scope: '.room',
    set: fillable('input'),
    value: value('input'),
    hasError: isVisible('.validation-error-message'),
    submit: triggerable('keypress', 'input', {
      eventProperties: { key: 'Enter' },
    }),
  },
  url: {
    scope: '[data-test-url]',
    set: fillable('input'),
    value: value('input'),
    hasError: isVisible('.validation-error-message'),
    submit: triggerable('keypress', 'input', {
      eventProperties: { key: 'Enter' },
    }),
  },
  recurring: {
    scope: '.make-recurring',
    toggle: clickable('[data-test-toggle-yesno] [data-test-handle]'),
    setWeeks: fillable('.make-recurring-input'),
    hasError: isVisible('.validation-error-message'),
    weekdays: collection('[data-test-make-recurring-day]', {
      label: text('[data-test-recurring-day-label]'),
      input: {
        scope: '[data-test-recurring-day-input]',
        toggle: clickable(),
        isSelected: property('checked'),
        isDisabled: property('disabled'),
      },
    }),
  },
  instructorManager: {
    scope: '[data-test-instructor-management]',
    selectedInstructors: collection('[data-test-selected-instructor]', {
      userNameInfo,
      remove: clickable('.remove'),
    }),
    selectedInstructorGroups: collection('[data-test-selected-instructor-group]', {
      title: text('[data-test-instructor-group-title]'),
      members: collection('[data-test-instructor-group-member]', {
        userNameInfo,
      }),
      remove: clickable('[data-test-instructor-group-title]'),
    }),
    search: fillable('.search-box input'),
    searchResults: collection('.results [data-test-result]', {
      add: clickable(),
      active: hasClass('active'),
      inactive: hasClass('inactive'),
    }),
  },
  learnerManager: {
    scope: '[data-test-learner-management]',
    selectedLearners: {
      scope: '[data-test-selected-learners]',
    },
    availableLearners: {
      scope: '[data-test-available-learners]',
    },
    selectedLearnerGroups: {
      scope: '[data-test-selected-learner-groups]',
      title: text('[data-test-title]', { at: 0 }),
      list: detailLearnergroupsList,
      noGroups: {
        scope: '[data-test-no-selected-learner-groups]',
      },
    },
    availableLearnerGroups: {
      scope: '[data-test-available-learner-groups]',
      title: text('[data-test-title]', { at: 0 }),
      search: fillable('[data-test-search-box] input'),
      runSearch: clickable('[data-test-search-box] .search-icon'),
      cohorts: collection('[data-test-cohorts]', {
        title: text('[data-test-title]', { at: 0 }),
        trees: collection('[data-test-learnergroup-tree-root=true]', learnergroupTree),
      }),
    },
    hasError: isPresent('.validation-error-message'),
  },

  save: clickable('.done'),
  close: clickable('.cancel'),
};

export default definition;
export const component = create(definition);
