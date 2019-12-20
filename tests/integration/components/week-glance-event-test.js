import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

import { component } from 'ilios-common/page-objects/components/week-glance-event';

const today = moment();

module('Integration | Component | week-glance-event', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders with some stuff', async function (assert) {
    this.set('event', {
      name: 'Learn to Learn',
      startDate: today.format(),
      location: 'Room 123',
      sessionTypeTitle: 'Lecture',
      courseExternalId: 'C1',
      sessionDescription: 'Best <strong>Session</strong> For Sure' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur',
      isBlanked: false,
      isPublished: true,
      isScheduled: false,
      learningMaterials: [
        {
          title: 'Citation LM',
          type: 'citation',
          required: true,
          publicNotes: 'This is cool.',
          citation: 'citationtext',
          sessionLearningMaterial: 1,
        },
        {
          title: 'Link LM',
          type: 'link',
          required: false,
          link: 'http://myhost.com/url2',
          sessionLearningMaterial: 2,
        },
        {
          title: 'File LM',
          type: 'file',
          filename: 'This is a PDF',
          mimetype: 'application/pdf',
          required: true,
          absoluteFileUri: 'http://myhost.com/url1',
          sessionLearningMaterial: 3,
        },
      ],
      attireRequired: true,
      equipmentRequired: true,
      attendanceRequired: true,
      supplemental: true,
    });
    await render(hbs`<WeekGlanceEvent @event={{event}} />`);

    assert.equal(component.title, 'Learn to Learn');
    assert.equal(component.sessionType, 'Lecture');
    assert.equal(component.location, '- Room 123');
    assert.ok(component.hasDescription);
    assert.equal(component.description, 'Best Session For SureLorem ipsum dolor sit amet, c');
    assert.equal(component.learningMaterials.length, 3);
    assert.equal(component.learningMaterials[0].title, 'Citation LM');
    assert.ok(component.learningMaterials[0].hasTypeIcon);
    assert.equal(component.learningMaterials[0].typeIconTitle, 'Citation');
    assert.ok(component.learningMaterials[0].hasCitation);
    assert.equal(component.learningMaterials[0].citation, 'citationtext');
    assert.ok(component.learningMaterials[0].hasPublicNotes);
    assert.equal(component.learningMaterials[0].publicNotes, 'This is cool.');

    assert.equal(component.learningMaterials[1].title, 'Link LM');
    assert.ok(component.learningMaterials[1].hasTypeIcon);
    assert.equal(component.learningMaterials[1].typeIconTitle, 'Web Link');
    assert.notOk(component.learningMaterials[1].hasCitation);
    assert.notOk(component.learningMaterials[1].hasPublicNotes);
    assert.equal(component.learningMaterials[1].url, 'http://myhost.com/url2');

    assert.equal(component.learningMaterials[2].title, 'File LM');
    assert.ok(component.learningMaterials[2].hasTypeIcon);
    assert.equal(component.learningMaterials[2].typeIconTitle, 'File');
    assert.notOk(component.learningMaterials[2].hasCitation);
    assert.notOk(component.learningMaterials[2].hasPublicNotes);
    assert.equal(component.learningMaterials[2].url, 'http://myhost.com/url1?inline');

    assert.notOk(component.hasInstructors);
    assert.equal(component.sessionAttributes.length, 4);
    assert.ok(component.sessionAttributes[0].attire);
    assert.ok(component.sessionAttributes[1].equipment);
    assert.ok(component.sessionAttributes[2].attendance);
    assert.ok(component.sessionAttributes[3].supplemental);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders with other stuff', async function (assert) {
    this.set('event', {
      name: 'Finding the Point in Life',
      startDate: today.format(),
      location: 'Room 456',
      sessionTypeTitle: 'Independent Learning',
      isBlanked: false,
      isPublished: true,
      isScheduled: false,
      learningMaterials: [
        {
          title: 'Great Slides',
          required: true,
          type: 'file',
          filename: 'This is another PDF',
          mimetype: 'application/pdf',
          absoluteFileUri: 'http://myhost.com/url1',
          publicNotes: 'slide notes',
          sessionLearningMaterial: 1,
        },
      ],
      instructors: [
        'Second Person',
        'First Person',
      ],
      attireRequired: false,
      equipmentRequired: false,
      attendanceRequired: false,
      supplemental: false,
    });
    await render(hbs`<WeekGlanceEvent @event={{event}} />`);

    assert.equal(component.title, 'Finding the Point in Life');
    assert.equal(component.sessionType, 'Independent Learning');
    assert.equal(component.location, '- Room 456');
    assert.notOk(component.hasDescription);
    assert.equal(component.learningMaterials.length, 1);
    assert.equal(component.learningMaterials[0].title, 'Great Slides');
    assert.ok(component.learningMaterials[0].hasTypeIcon);
    assert.equal(component.learningMaterials[0].typeIconTitle, 'File');
    assert.notOk(component.learningMaterials[0].hasCitation);
    assert.ok(component.learningMaterials[0].hasPublicNotes);
    assert.equal(component.learningMaterials[0].publicNotes, 'slide notes');
    assert.equal(component.learningMaterials[0].url, 'http://myhost.com/url1?inline');

    assert.ok(component.hasInstructors);
    assert.equal(component.instructors, 'Instructors: First Person, Second Person');
    assert.equal(component.sessionAttributes.length, 0);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
  test('it renders schedule materials', async function (assert) {
    this.set('event', {
      name: 'Schedule some materials',
      startDate: today.format(),
      location: 'Room 123',
      sessionTypeTitle: 'Lecture',
      courseExternalId: 'C1',
      sessionDescription: 'Best <strong>Session</strong> For Sure' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur',
      isBlanked: false,
      isPublished: true,
      isScheduled: false,
      learningMaterials: [
        {
          title: 'In the window',
          type: 'citation',
          required: true,
          isBlanked: false,
          citation: 'citationtext',
          endDate: today.clone().add(1, 'day').toDate(),
          startDate: today.clone().subtract(1, 'day').toDate(),
          sessionLearningMaterial: 1,
        },
        {
          title: 'Too Early',
          type: 'citation',
          required: true,
          isBlanked: true,
          citation: 'citationtext',
          startDate: moment('2001-12-31').toDate(),
          sessionLearningMaterial: 2,
        },
        {
          title: 'Too Late',
          type: 'citation',
          required: true,
          isBlanked: true,
          citation: 'citationtext',
          endDate: moment('2035-06-01').toDate(),
          sessionLearningMaterial: 3,
        },
      ],
      attireRequired: true,
      equipmentRequired: true,
      attendanceRequired: true,
      supplemental: true,
    });
    await render(hbs`<WeekGlanceEvent @event={{event}} />`);

    assert.equal(component.title, 'Schedule some materials');
    assert.equal(component.sessionType, 'Lecture');
    assert.equal(component.location, '- Room 123');
    assert.ok(component.hasDescription);
    assert.equal(component.description, 'Best Session For Sure' + 'Lorem ipsum dolor sit amet, c');
    assert.equal(component.learningMaterials.length, 3);
    assert.equal(component.learningMaterials[0].title, 'In the window');
    assert.ok(component.learningMaterials[0].timedReleaseInfo.length > 0);
    assert.equal(component.learningMaterials[1].title, 'Too Early');
    assert.ok(component.learningMaterials[1].timedReleaseInfo.length === 0);
    assert.equal(component.learningMaterials[2].title, 'Too Late');
    assert.ok(component.learningMaterials[2].timedReleaseInfo.length > 0);

    assert.notOk(component.hasInstructors);
    assert.equal(component.sessionAttributes.length, 4);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders prework', async function (assert) {
    this.set('event', {
      name: 'Learn to Learn',
      startDate: today.format(),
      location: 'Room 123',
      sessionTypeTitle: 'Lecture',
      courseExternalId: 'C1',
      sessionDescription: 'Best <strong>Session</strong> For Sure' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur',
      isBlanked: false,
      isPublished: true,
      isScheduled: false,
      prerequisites: [
        { name: 'prework 1', slug: 'e1' },
        { name: 'prework 2', slug: 'e2' },
      ]
    });
    await render(hbs`<WeekGlanceEvent @event={{event}} />`);

    assert.equal(component.title, 'Learn to Learn');
    assert.equal(component.preWork.length, 2);
    assert.equal(component.preWork[0].title, 'prework 1');
    assert.ok(component.preWork[0].hasLink);
    assert.equal(component.preWork[1].title, 'prework 2');
    assert.ok(component.preWork[1].hasLink);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it skips course learning materials', async function (assert) {
    this.set('event', {
      name: 'Learn to Learn',
      startDate: today.format(),
      location: 'Room 123',
      sessionTypeTitle: 'Lecture',
      courseExternalId: 'C1',
      sessionDescription: 'Best <strong>Session</strong> For Sure' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur',
      isBlanked: false,
      isPublished: true,
      isScheduled: false,
      learningMaterials: [
        {
          title: 'Citation LM',
          type: 'citation',
          required: true,
          publicNotes: 'This is cool.',
          citation: 'citationtext',
          courseLearningMaterial: 1,
        },
        {
          title: 'Link LM',
          type: 'link',
          required: false,
          link: 'http://myhost.com/url2',
          sessionLearningMaterial: 1,
        },
        {
          title: 'File LM',
          type: 'file',
          filename: 'This is a PDF',
          mimetype: 'application/pdf',
          required: true,
          absoluteFileUri: 'http://myhost.com/url1',
          sessionLearningMaterial: 2,
        },
      ],
      attireRequired: true,
      equipmentRequired: true,
      attendanceRequired: true,
      supplemental: true,
    });
    await render(hbs`<WeekGlanceEvent @event={{event}} />`);

    assert.equal(component.title, 'Learn to Learn');
    assert.equal(component.learningMaterials.length, 2);

    assert.equal(component.learningMaterials[0].title, 'Link LM');
    assert.ok(component.learningMaterials[0].hasTypeIcon);
    assert.equal(component.learningMaterials[0].typeIconTitle, 'Web Link');
    assert.notOk(component.learningMaterials[0].hasCitation);
    assert.notOk(component.learningMaterials[0].hasPublicNotes);
    assert.equal(component.learningMaterials[0].url, 'http://myhost.com/url2');

    assert.equal(component.learningMaterials[1].title, 'File LM');
    assert.ok(component.learningMaterials[1].hasTypeIcon);
    assert.equal(component.learningMaterials[1].typeIconTitle, 'File');
    assert.notOk(component.learningMaterials[1].hasCitation);
    assert.notOk(component.learningMaterials[1].hasPublicNotes);
    assert.equal(component.learningMaterials[1].url, 'http://myhost.com/url1?inline');
  });
});
