import {
  collection,
  clickable,
  create,
  fillable,
  hasClass,
  isVisible,
  property,
  text,
  triggerable,
  value,
} from 'ember-cli-page-object';
import { flatpickrDatePicker } from 'ilios-common';
import sessionManager from './sequence-block-session-manager';
import sessionList from './sequence-block-session-list';
import yesNoToggle from 'ilios-common/page-objects/components/toggle-yesno';

const definition = {
  scope: '[data-test-curriculum-inventory-sequence-block-overview]',
  title: text('[data-test-overview] [data-test-title]'),
  course: {
    scope: '[data-test-overview] [data-test-course]',
    label: text('label'),
    edit: clickable('.editinplace [data-test-edit]'),
    isEditable: isVisible('.editinplace'),
    value: value('select'),
    select: fillable('select'),
    options: collection('option', {
      isSelected: property('selected'),
    }),
    details: text('[data-test-course-details]'),
    save: clickable('.done'),
    cancel: clickable('.cancel'),
  },
  courseDetails: {
    scope: '[data-test-overview] [data-test-course-details]',
  },
  description: {
    scope: '[data-test-overview] [data-test-description]',
    label: text('label'),
    edit: clickable('.editinplace [data-test-edit]'),
    set: fillable('textarea'),
    value: text('textarea'),
    isEditable: isVisible('.editinplace'),
    save: clickable('.done'),
    cancel: clickable('.cancel'),
  },
  required: {
    scope: '[data-test-overview] [data-test-required]',
    label: text('label'),
    edit: clickable('.editinplace [data-test-edit]'),
    isEditable: isVisible('.editinplace'),
    value: value('select'),
    select: fillable('select'),
    options: collection('option', {
      isSelected: property('selected'),
    }),
    save: clickable('.done'),
    cancel: clickable('.cancel'),
  },
  academicLevel: {
    scope: '[data-test-overview] [data-test-academic-level]',
    label: text('label'),
    edit: clickable('.editinplace [data-test-edit]'),
    isEditable: isVisible('.editinplace'),
    value: value('select'),
    select: fillable('select'),
    options: collection('option', {
      isSelected: property('selected'),
    }),
    save: clickable('.done'),
    cancel: clickable('.cancel'),
  },
  track: {
    scope: '[data-test-overview] [data-test-track]',
    label: text('label'),
    isEditable: isVisible('[data-test-toggle-yesno]'),
    yesNoToggle,
    save: clickable('.done'),
    cancel: clickable('.cancel'),
  },
  startDate: {
    scope: '[data-test-overview] [data-test-start-date]',
    edit: clickable('.editinplace [data-test-edit]'),
    isEditable: isVisible('.editinplace'),
    save: clickable('.done'),
    cancel: clickable('.cancel'),
  },
  endDate: {
    scope: '[data-test-overview] [data-test-end-date]',
    edit: clickable('.editinplace [data-test-edit]'),
    isEditable: isVisible('.editinplace'),
    save: clickable('.done'),
    cancel: clickable('.cancel'),
  },
  duration: {
    scope: '[data-test-overview] [data-test-duration]',
    edit: clickable('.editinplace [data-test-edit]'),
    isEditable: isVisible('.editinplace'),
    save: clickable('.done'),
    cancel: clickable('.cancel'),
  },
  orderInSequence: {
    scope: '[data-test-overview] [data-test-order-in-sequence]',
    label: text('label'),
    edit: clickable('.editinplace [data-test-edit]'),
    isEditable: isVisible('.editinplace'),
    value: value('select'),
    select: fillable('select'),
    options: collection('option', {
      isSelected: property('selected'),
    }),
    save: clickable('.done'),
    cancel: clickable('.cancel'),
  },
  childSequenceOrder: {
    scope: '[data-test-overview] [data-test-child-sequence-order]',
    label: text('label'),
    edit: clickable('.editinplace [data-test-edit]'),
    isEditable: isVisible('.editinplace'),
    value: value('select'),
    select: fillable('select'),
    options: collection('option', {
      isSelected: property('selected'),
    }),
    save: clickable('.done'),
    cancel: clickable('.cancel'),
  },
  isSelective: {
    scope: '[data-test-overview] [data-test-is-selective]',
    isHidden: hasClass('hidden'),
  },
  minimum: {
    scope: '[data-test-overview] [data-test-minimum]',
    edit: clickable('.editinplace [data-test-edit]'),
    isEditable: isVisible('.editinplace'),
    save: clickable('.done'),
    cancel: clickable('.cancel'),
  },
  maximum: {
    scope: '[data-test-overview] [data-test-maximum]',
    edit: clickable('.editinplace [data-test-edit]'),
    isEditable: isVisible('.editinplace'),
    save: clickable('.done'),
    cancel: clickable('.cancel'),
  },
  sessions: {
    scope: '[data-test-overview] [data-test-session-list-controls]',
    label: text('label'),
    editButton: {
      scope: 'button',
    },
  },
  minMaxEditor: {
    scope: '[data-test-curriculum-inventory-sequence-block-min-max-editor]',
    minimum: {
      scope: '[data-test-minimum]',
      label: text('label'),
      value: value('input'),
      set: fillable('input'),
      isDisabled: property('disabled', 'input'),
      errors: collection('.validation-error-message'),
      save: triggerable('keyup', 'input', { eventProperties: { key: 'Enter' } }),
      cancel: triggerable('keyup', 'input', { eventProperties: { key: 'Escape' } }),
    },
    maximum: {
      scope: '[data-test-maximum]',
      label: text('label'),
      value: value('input'),
      set: fillable('input'),
      errors: collection('.validation-error-message'),
      save: triggerable('keyup', 'input', { eventProperties: { key: 'Enter' } }),
      cancel: triggerable('keyup', 'input', { eventProperties: { key: 'Escape' } }),
    },
    save: clickable('[data-test-save]'),
    cancel: clickable('[data-test-cancel]'),
  },
  durationEditor: {
    scope:
      '[data-test-overview] [data-test-curriculum-inventory-sequence-block-dates-duration-editor]',
    duration: {
      scope: '[data-test-duration]',
      label: text('label'),
      value: value('input'),
      set: fillable('input'),
      errors: collection('.validation-error-message'),
      save: triggerable('keyup', 'input', { eventProperties: { key: 'Enter' } }),
      cancel: triggerable('keyup', 'input', { eventProperties: { key: 'Escape' } }),
    },
    startDate: {
      scope: '[data-test-startdate]',
      label: text('label'),
      value: value('input'),
      set: flatpickrDatePicker('input'),
      errors: collection('.validation-error-message'),
    },
    endDate: {
      scope: '[data-test-enddate]',
      label: text('label'),
      value: value('input'),
      set: flatpickrDatePicker('input'),
      errors: collection('.validation-error-message'),
    },
    save: clickable('[data-test-save]'),
    cancel: clickable('[data-test-cancel]'),
  },
  sessionList,
  sessionManager,
};

export default definition;
export const component = create(definition);
