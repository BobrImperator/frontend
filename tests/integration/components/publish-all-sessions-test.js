import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/publish-all-sessions';

module('Integration | Component | publish all sessions', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const programYearObjective = this.server.create('programYearObjective');
    const course = this.server.create('course');
    const term = this.server.create('term');
    const meshDescriptor = this.server.create('meshDescriptor');
    this.server.create('courseObjective', {
      course,
      programYearObjectives: [programYearObjective],
    });
    const courseObjective = this.server.create('courseObjective', { course });
    const unpublishableSession = this.server.create('session', {
      title: 'session 1',
      published: false,
      course,
      meshDescriptors: [meshDescriptor],
      terms: [term],
    });
    const completeSession = this.server.create('session', {
      title: 'session 2',
      published: true,
      meshDescriptors: [meshDescriptor],
      terms: [term],
    });
    const publishableSession = this.server.create('session', {
      title: 'session 3',
      published: false,
    });

    const fullyPublishedByIncompleteSession = this.server.create('session', {
      title: 'session 4',
      published: true,
    });
    this.server.create('sessionObjective', {
      session: completeSession,
      courseObjectives: [courseObjective],
    });
    this.server.create('sessionObjective', {
      session: fullyPublishedByIncompleteSession,
    });
    this.server.create('offering', { session: publishableSession });
    this.server.create('offering', { session: completeSession });
    this.server.create('offering', {
      session: fullyPublishedByIncompleteSession,
    });
    this.server.create('sessionObjective', { session: completeSession });
    const store = this.owner.lookup('service:store');
    this.publishableSession = await store.find('session', publishableSession.id);
    this.unpublishableSession = await store.find('session', unpublishableSession.id);
    this.completeSession = await store.find('session', completeSession.id);
    this.fullyPublishedByIncompleteSession = await store.find(
      'session',
      fullyPublishedByIncompleteSession.id
    );
    this.course = await store.find('course', course.id);
  });

  test('it renders', async function (assert) {
    const sessions = [
      this.unpublishableSession,
      this.completeSession,
      this.publishableSession,
      this.fullyPublishedByIncompleteSession,
    ];
    this.set('sessions', sessions);
    this.set('course', this.course);

    await render(hbs`<PublishAllSessions @sessions={{this.sessions}} @course={{this.course}} />`);
    assert.equal(component.unpublishableSessions.text, 'Sessions Incomplete: cannot publish (1)');
    assert.notOk(component.unpublishableSessions.isExpanded);
    assert.equal(component.unpublishableSessions.sessions.length, 0);
    assert.ok(component.unpublishableSessions.canExpandCollapse);
    await component.unpublishableSessions.toggle();
    assert.ok(component.unpublishableSessions.isExpanded);
    assert.equal(component.unpublishableSessions.sessions.length, 1);
    assert.equal(component.unpublishableSessions.sessions[0].title, 'session 1');
    assert.equal(component.unpublishableSessions.sessions[0].offerings, 'No');
    assert.equal(component.unpublishableSessions.sessions[0].terms, 'Yes (1)');
    assert.equal(component.unpublishableSessions.sessions[0].objectives.text, 'No');
    assert.notOk(component.unpublishableSessions.sessions[0].objectives.isLinked);
    assert.equal(component.unpublishableSessions.sessions[0].meshDescriptors, 'Yes (1)');
    assert.equal(component.publishableSessions.text, 'Sessions Complete: ready to publish (1)');
    assert.notOk(component.publishableSessions.isExpanded);
    assert.equal(component.publishableSessions.sessions.length, 0);
    assert.ok(component.publishableSessions.canExpandCollapse);
    await component.publishableSessions.toggle();
    assert.ok(component.publishableSessions.isExpanded);
    assert.equal(component.publishableSessions.sessions.length, 1);
    assert.equal(component.publishableSessions.sessions[0].title, 'session 2');
    assert.equal(component.publishableSessions.sessions[0].offerings, 'Yes (1)');
    assert.equal(component.publishableSessions.sessions[0].terms, 'Yes (1)');
    assert.equal(component.publishableSessions.sessions[0].objectives.text, 'Yes (2)');
    assert.ok(component.publishableSessions.sessions[0].objectives.isLinked);
    assert.equal(component.publishableSessions.sessions[0].meshDescriptors, 'Yes (1)');
    assert.equal(component.overridableSessions.title, 'Sessions Requiring Review (2)');
    assert.ok(component.overridableSessions.markAllAsScheduled.isVisible);
    assert.ok(component.overridableSessions.publishAllAsIs.isVisible);
    assert.equal(component.overridableSessions.sessions.length, 2);
    assert.ok(component.overridableSessions.publishAllAsIs.isVisible);
    assert.ok(component.overridableSessions.markAllAsScheduled.isVisible);
    assert.notOk(component.overridableSessions.sessions[0].publishAsIs.isChecked);
    assert.ok(component.overridableSessions.sessions[0].markAsScheduled.isChecked);
    assert.equal(component.overridableSessions.sessions[0].title, 'session 3');
    assert.equal(component.overridableSessions.sessions[0].offerings, 'Yes (1)');
    assert.equal(component.overridableSessions.sessions[0].terms, 'No');
    assert.equal(component.overridableSessions.sessions[0].objectives.text, 'No');
    assert.notOk(component.overridableSessions.sessions[0].objectives.isLinked);
    assert.equal(component.overridableSessions.sessions[0].meshDescriptors, 'No');
    assert.ok(component.overridableSessions.sessions[1].publishAsIs.isChecked);
    assert.notOk(component.overridableSessions.sessions[1].markAsScheduled.isChecked);
    assert.equal(component.overridableSessions.sessions[1].title, 'session 4');
    assert.equal(component.overridableSessions.sessions[1].offerings, 'Yes (1)');
    assert.equal(component.overridableSessions.sessions[1].terms, 'No');
    assert.equal(component.overridableSessions.sessions[1].objectives.text, 'No');
    assert.notOk(component.overridableSessions.sessions[1].objectives.isLinked);
    assert.equal(component.overridableSessions.sessions[1].meshDescriptors, 'No');
    assert.equal(component.review.confirmation, 'Publish 2, schedule 1, and ignore 1 sessions');
  });

  test('it renders empty', async function (assert) {
    this.set('course', this.course);

    await render(hbs`<PublishAllSessions @sessions={{array}} @course={{this.course}} />`);

    assert.equal(component.unpublishableSessions.text, 'Sessions Incomplete: cannot publish (0)');
    assert.equal(component.publishableSessions.text, 'Sessions Complete: ready to publish (0)');
    assert.equal(component.overridableSessions.title, 'Sessions Requiring Review (0)');
    assert.equal(component.overridableSessions.title, 'Sessions Requiring Review (0)');
    assert.notOk(component.overridableSessions.markAllAsScheduled.isVisible);
    assert.notOk(component.overridableSessions.publishAllAsIs.isVisible);
    assert.equal(component.overridableSessions.sessions.length, 0);
    assert.equal(component.review.confirmation, 'Publish 0, schedule 0, and ignore 0 sessions');
  });

  test('shows course objective warning', async function (assert) {
    assert.expect(3);

    const sessions = [this.unpublishableSession];
    this.set('sessions', sessions);
    this.set('course', this.course);
    await render(hbs`<PublishAllSessions @sessions={{this.sessions}} @course={{this.course}} />`);
    assert.equal(
      component.review.unlinkedObjectivesWarning,
      'This course has unlinked objective(s)'
    );
    assert.ok(component.review.transitionToCourse.isVisible);
    assert.ok(component.review.visualize.isVisible);
  });
});
