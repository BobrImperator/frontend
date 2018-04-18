import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { initialize } from '../../../initializers/replace-promise';

initialize();

module('Unit | Model | InstructorGroup', function(hooks) {
  setupTest(hooks);

  test('list courses', async function(assert) {
    assert.expect(4);
    run( async () => {
      const model = run(() => this.owner.lookup('service:store').createRecord('instructor-group'));
      const store = model.store;
      const course1 = store.createRecord('course', { title:'course1', id: 1 });
      const course2 = store.createRecord('course', { title:'course2', id: 2 });
      const course3 = store.createRecord('course', { title:'course3', id: 3 });
      const session1 = store.createRecord('session', { course: course1 });
      const session2 = store.createRecord('session', { course: course1 });
      const session3 = store.createRecord('session', { course: course2 });
      const session4 = store.createRecord('session', { course: course3 });

      model.get('offerings').pushObjects([
        store.createRecord('offering', { session: session1 }),
        store.createRecord('offering', { session: session1 }),
        store.createRecord('offering', { session: session1 }),
        store.createRecord('offering', { session: session2 }),
        store.createRecord('offering', { session: session2 }),
        store.createRecord('offering', { session: session3 })
      ]);
      model.get('ilmSessions').pushObjects([
        store.createRecord('ilmSession', { session: session3 }),
        store.createRecord('ilmSession', { session: session4 })
      ]);
      const courses = await model.get('courses');
      assert.equal(courses.length, 3);
      assert.ok(courses.includes(course1));
      assert.ok(courses.includes(course2));
      assert.ok(courses.includes(course3));
    });
  });
  test('list sessions', async function(assert) {
    assert.expect(5);
    run( async () => {
      const model = run(() => this.owner.lookup('service:store').createRecord('instructor-group'));
      const store = model.store;
      const session1 = store.createRecord('session');
      const session2 = store.createRecord('session');
      const session3 = store.createRecord('session');
      const session4 = store.createRecord('session');

      model.get('offerings').pushObjects([
        store.createRecord('offering', { session: session1 }),
        store.createRecord('offering', { session: session1 }),
        store.createRecord('offering', { session: session1 }),
        store.createRecord('offering', { session: session2 }),
        store.createRecord('offering', { session: session2 }),
        store.createRecord('offering', { session: session3 })
      ]);
      model.get('ilmSessions').pushObjects([
        store.createRecord('ilmSession', { session: session3 }),
        store.createRecord('ilmSession', { session: session4 })
      ]);
      const sessions = await model.get('sessions');
      assert.equal(sessions.length, 4);
      assert.ok(sessions.includes(session1));
      assert.ok(sessions.includes(session2));
      assert.ok(sessions.includes(session3));
      assert.ok(sessions.includes(session4));
    });
  });
});
