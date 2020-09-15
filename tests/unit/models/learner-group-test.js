import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | LearnerGroup', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const model = this.owner.lookup('service:store').createRecord('learner-group');
    assert.ok(!!model);
  });

  test('list courses', async function(assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('learner-group');
    const course1 = store.createRecord('course', {title:'course1'});
    const course2 = store.createRecord('course', {title:'course2'});
    const session1 = store.createRecord('session', {course: course1});
    const session2 = store.createRecord('session', {course: course1});
    const session3 = store.createRecord('session', {course: course2});
    model.get('offerings').pushObjects([
      store.createRecord('offering', {session: session1}),
      store.createRecord('offering', {session: session1}),
      store.createRecord('offering', {session: session1}),
      store.createRecord('offering', {session: session2}),
      store.createRecord('offering', {session: session2}),
      store.createRecord('offering', {session: session3}),
    ]);

    const courses = await model.get('courses');
    assert.equal(courses.length, 2);
    assert.equal(courses.objectAt(0).get('title'), 'course1');
    assert.equal(courses.objectAt(1).get('title'), 'course2');
  });

  test('list sessions', async function(assert) {
    assert.expect(5);
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('learner-group');
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

  test('check allDescendantUsers on empty group', async function(assert) {
    assert.expect(1);
    const learnerGroup = this.owner.lookup('service:store').createRecord('learner-group');
    const allDescendantUsers = await learnerGroup.get('allDescendantUsers');
    assert.equal(allDescendantUsers.length, 0);
  });

  test('check allDescendantUsers on populated group with sub-groups', async function(assert) {
    assert.expect(6);
    const store = this.owner.lookup('service:store');
    const learnerGroup = store.createRecord('learner-group');

    const user1 = store.createRecord('user');
    const user2 = store.createRecord('user');
    const user3 = store.createRecord('user');
    const user4 = store.createRecord('user');
    const user5 = store.createRecord('user');
    const subGroup1 = store.createRecord('learner-group', {users: [user2]});
    const subSubGroup1 = store.createRecord('learner-group', {users: [user3]});
    const subGroup2 = store.createRecord('learner-group', {users: [user5], children: [ subSubGroup1 ]});
    learnerGroup.get('users').pushObjects([user1, user4]);
    learnerGroup.get('children').pushObjects([subGroup1, subGroup2]);

    const allDescendantUsers = await learnerGroup.get('allDescendantUsers');
    assert.equal(allDescendantUsers.length, 5);
    assert.ok(allDescendantUsers.includes(user1));
    assert.ok(allDescendantUsers.includes(user2));
    assert.ok(allDescendantUsers.includes(user3));
    assert.ok(allDescendantUsers.includes(user4));
    assert.ok(allDescendantUsers.includes(user5));
  });

  test('check empty allDescendants', async function(assert) {
    assert.expect(1);
    const learnerGroup = this.owner.lookup('service:store').createRecord('learner-group');

    const groups = await learnerGroup.get('allDescendants');
    assert.equal(groups.length, 0);
  });

  test('check allDescendants', async function(assert) {
    assert.expect(5);
    const store = this.owner.lookup('service:store');
    const learnerGroup = store.createRecord('learner-group');

    const subGroup1 = store.createRecord('learner-group', {parent: learnerGroup});
    const subGroup2 = store.createRecord('learner-group', {parent: subGroup1});
    const subGroup3 = store.createRecord('learner-group', {parent: subGroup2});
    const subGroup4 = store.createRecord('learner-group', {parent: learnerGroup});

    const groups = await learnerGroup.get('allDescendants');
    assert.equal(groups.length, 4);
    assert.ok(groups.includes(subGroup1));
    assert.ok(groups.includes(subGroup2));
    assert.ok(groups.includes(subGroup3));
    assert.ok(groups.includes(subGroup4));
  });

  test('check subgroupNumberingOffset on group with no sub-groups', async function(assert) {
    assert.expect(1);
    const groupTitle = 'Lorem Ipsum';
    const learnerGroup = this.owner.lookup('service:store').createRecord('learner-group');
    learnerGroup.set('title', groupTitle);
    const offset = await learnerGroup.get('subgroupNumberingOffset');
    assert.equal(offset, 1, 'no subgroups. offset is 1.');
  });

  test('check subgroupNumberingOffset on group with sub-groups', async function(assert) {
    assert.expect(1);
    const groupTitle = 'Lorem Ipsum';
    const store = this.owner.lookup('service:store');
    const learnerGroup = store.createRecord('learner-group');
    learnerGroup.set('title', groupTitle);
    store.createRecord('learner-group', {parent: learnerGroup, title: groupTitle + ' 1' });
    store.createRecord('learner-group', {parent: learnerGroup, title: groupTitle + ' 3' });
    const offset = await learnerGroup.get('subgroupNumberingOffset');
    assert.equal(offset, 4, 'highest number is 3. 3 + 1 = 4. offset is 4.');
  });

  test('check subgroupNumberingOffset on group with sub-groups and mis-matched sub-group title', async function(assert) {
    assert.expect(1);
    const groupTitle = 'Lorem Ipsum';
    const store = this.owner.lookup('service:store');
    const learnerGroup = store.createRecord('learner-group');
    learnerGroup.set('title', groupTitle);
    store.createRecord('learner-group', {parent: learnerGroup, title: groupTitle + ' 1' });
    store.createRecord('learner-group', {parent: learnerGroup, title: groupTitle + ' 3' });
    store.createRecord('learner-group', {parent: learnerGroup, title: 'not the parent title 4' });
    const offset = await learnerGroup.get('subgroupNumberingOffset');
    assert.equal(offset, 4, 'subgroup with title-mismatch is ignored, offset is 4 not 5.');
  });

  test('check allinstructors', async function(assert) {
    assert.expect(8);
    const store = this.owner.lookup('service:store');
    const learnerGroup = store.createRecord('learner-group');

    let allInstructors = await learnerGroup.get('allInstructors');
    assert.equal(allInstructors.length, 0);

    const user1 = store.createRecord('user');
    const user2 = store.createRecord('user');
    const user3 = store.createRecord('user');
    learnerGroup.get('instructors').pushObject(user1);
    const instructorGroup1 = store.createRecord('instructor-group', {users: [user2]});
    const instructorGroup2 = store.createRecord('instructor-group', {users: [user3]});
    learnerGroup.get('instructorGroups').pushObjects([instructorGroup1, instructorGroup2]);

    allInstructors = await learnerGroup.get('allInstructors');
    assert.equal(allInstructors.length, 3);
    assert.ok(allInstructors.includes(user1));
    assert.ok(allInstructors.includes(user2));
    assert.ok(allInstructors.includes(user3));

    const user4 = store.createRecord('user');
    const user5 = store.createRecord('user');
    learnerGroup.get('instructors').pushObject(user4);
    const instructorGroup3 = store.createRecord('instructor-group', {users: [user5]});
    learnerGroup.get('instructorGroups').pushObject(instructorGroup3);

    allInstructors = await learnerGroup.get('allInstructors');
    assert.equal(allInstructors.length, 5);
    assert.ok(allInstructors.includes(user4));
    assert.ok(allInstructors.includes(user5));
  });

  test('check allParents', async function(assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');

    const subGroup1 = store.createRecord('learner-group');
    const subGroup2 = store.createRecord('learner-group', {parent: subGroup1});
    const subGroup3 = store.createRecord('learner-group', {parent: subGroup2});

    const allParents = await subGroup3.get('allParents');
    assert.equal(allParents.length, 2);
    assert.equal(allParents[0], subGroup2);
    assert.equal(allParents[1], subGroup1);
  });

  test('check filterTitle on top group', async function(assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');

    const learnerGroup = store.createRecord('learner-group', {title: 'top group'});
    const subGroup1 = store.createRecord('learner-group', {parent: learnerGroup, title: 'subGroup1'});
    const subGroup2 = store.createRecord('learner-group', {parent: subGroup1, title: 'subGroup2'});
    store.createRecord('learner-group', {parent: subGroup2, title: 'subGroup3'});

    const groups = await learnerGroup.get('allDescendants');
    assert.equal(groups.length, 3);
    const filterTitle = await learnerGroup.get('filterTitle');
    assert.equal(filterTitle, 'subGroup1subGroup2subGroup3top group');
  });

  test('check filterTitle on sub group', async function(assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const learnerGroup = store.createRecord('learner-group', {title: 'top group'});
    const subGroup1 = store.createRecord('learner-group', {parent: learnerGroup, title: 'subGroup1'});
    const subGroup2 = store.createRecord('learner-group', {parent: subGroup1, title: 'subGroup2'});
    const subGroup3 = store.createRecord('learner-group', {parent: subGroup2, title: 'subGroup3'});
    const groups = await learnerGroup.get('allDescendants');
    assert.equal(groups.length, 3);
    const filterTitle = await subGroup3.get('filterTitle');
    assert.equal(filterTitle, 'subGroup2subGroup1top groupsubGroup3');
  });

  test('check sortTitle on top group', async function(assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const learnerGroup = store.createRecord('learner-group');

    learnerGroup.set('title', 'top group');
    const groups = await learnerGroup.get('allDescendants');
    assert.equal(groups.length, 0);

    store.createRecord('learner-group', {parent: learnerGroup, title: 'subGroup1'});
    const sortTitle = await learnerGroup.get('sortTitle');
    assert.equal(sortTitle, 'topgroup');
  });

  test('check sortTitle on sub group', async function(assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    const learnerGroup = store.createRecord('learner-group', { id: 1, title: 'top group' });
    let groups = await learnerGroup.get('allDescendants');
    assert.equal(groups.length, 0);

    const subGroup1 = store.createRecord('learner-group', {id: 2, parent: learnerGroup, title: 'subGroup1'});
    const subGroup2 = store.createRecord('learner-group', {id: 3, parent: subGroup1, title: 'subGroup2'});
    const subGroup3 = store.createRecord('learner-group', {id: 4, parent: subGroup2, title: 'subGroup3'});

    groups = await learnerGroup.get('allDescendants');
    assert.equal(groups.length, 3);

    const sortTitle = await subGroup3.get('sortTitle');
    assert.equal(sortTitle, 'topgroupsubGroup1subGroup2subGroup3');
  });

  test('check removeUserFromGroupAndAllDescendants', async function(assert) {
    assert.expect(7);
    const store = this.owner.lookup('service:store');
    const learnerGroup = store.createRecord('learner-group');

    const groups = await learnerGroup.get('allParents');
    assert.equal(groups.length, 0);

    const user1 = store.createRecord('user', {id: 99});
    const subGroup1 = store.createRecord('learner-group', {parent: learnerGroup, users: [user1]});
    const subGroup2 = store.createRecord('learner-group', {parent: subGroup1, users: [user1]});
    const subGroup3 = store.createRecord('learner-group', {parent: subGroup2, users: [user1]});
    const subGroup4 = store.createRecord('learner-group', {parent: subGroup1});

    const groupsToRemove = await subGroup1.removeUserFromGroupAndAllDescendants(user1);
    assert.equal(groupsToRemove.length, 3);
    assert.notOk(groupsToRemove.includes(learnerGroup));
    assert.ok(groupsToRemove.includes(subGroup1));
    assert.ok(groupsToRemove.includes(subGroup2));
    assert.ok(groupsToRemove.includes(subGroup3));
    assert.notOk(groupsToRemove.includes(subGroup4));
  });

  test('check addUserToGroupAndAllParents', async function(assert) {
    assert.expect(7);
    const store = this.owner.lookup('service:store');
    const learnerGroup = store.createRecord('learner-group');
    const groups = await learnerGroup.get('allParents');
    assert.equal(groups.length, 0);

    const user1 = store.createRecord('user');
    const subGroup1 = store.createRecord('learner-group', {parent: learnerGroup, users: [user1]});
    const subGroup2 = store.createRecord('learner-group', {parent: subGroup1});
    const subGroup3 = store.createRecord('learner-group', {parent: subGroup2});
    const subGroup4 = store.createRecord('learner-group', {parent: subGroup1});

    const groupsToAdd = await subGroup3.addUserToGroupAndAllParents(user1);

    assert.equal(groupsToAdd.length, 3);
    assert.ok(groupsToAdd.includes(learnerGroup));
    assert.notOk(groupsToAdd.includes(subGroup1));
    assert.ok(groupsToAdd.includes(subGroup2));
    assert.ok(groupsToAdd.includes(subGroup3));
    assert.notOk(groupsToAdd.includes(subGroup4));
  });


  test('has no learners in group without learners and without subgroups', async function(assert) {
    assert.expect(1);
    const learnerGroup = this.owner.lookup('service:store').createRecord('learner-group');
    const hasLearners = await learnerGroup.get('hasLearnersInGroupOrSubgroups');
    assert.notOk(hasLearners);
  });

  test('has learners in group with learners and but without learners in subgroups', async function(assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const learnerGroup = store.createRecord('learner-group');
    const learner = store.createRecord('user');
    learnerGroup.get('users').pushObject(learner);
    const hasLearners = await learnerGroup.get('hasLearnersInGroupOrSubgroups');
    assert.ok(hasLearners);
  });


  test('has no learners with no learners in group nor in subgroups', async function(assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const learnerGroup = store.createRecord('learner-group');
    const subgroup = store.createRecord('learner-group', { id: 2, parent: learnerGroup });
    learnerGroup.get('children').pushObject(subgroup);
    const hasLearners = await learnerGroup.get('hasLearnersInGroupOrSubgroups');
    assert.notOk(hasLearners);
  });


  test('has learners with no learners in group but with learners in subgroups', async function(assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const learnerGroup = store.createRecord('learner-group');
    const learner = store.createRecord('user', { id: 1 });
    const subgroup = store.createRecord('learner-group', { id: 2, users: [ learner ], parent: learnerGroup });
    learnerGroup.get('children').then(subgroups => {
      subgroups.pushObject(subgroup);
      learnerGroup.get('hasLearnersInGroupOrSubgroups').then(hasLearners => {
        assert.ok(hasLearners);
      });
    });
  });

  test('has learners with learners in group and with learners in subgroups', async function(assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const learnerGroup = store.createRecord('learner-group');
    const learner = store.createRecord('user', { id: 1 });
    const learner2 = store.createRecord('user', { id: 2 });
    const subgroup = store.createRecord('learner-group', { id: 2, users: [ learner ], parent: learnerGroup });
    learnerGroup.get('children').then(subgroups => {
      subgroups.pushObject(subgroup);
      learnerGroup.get('users').then(learners => {
        learners.pushObject(learner2);
        learnerGroup.get('hasLearnersInGroupOrSubgroups').then(hasLearners => {
          assert.ok(hasLearners);
        });
      });
    });
  });

  test('users only at this level', async function(assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const learnerGroup = store.createRecord('learner-group');
    const user1 = store.createRecord('user', {id: 1});
    const user2 = store.createRecord('user', {id: 2});
    const user3 = store.createRecord('user', {id: 3});
    const user4 = store.createRecord('user', {id: 4});

    const subgroup = store.createRecord('learner-group', { id: 2, parent: learnerGroup, 'users': [ user1, user3 ] });
    store.createRecord('learner-group', {id: 3, parent: subgroup, 'users': [ user4 ]});
    learnerGroup.get('users').pushObjects([user1, user2, user3, user4 ]);
    learnerGroup.get('children').pushObject(subgroup);
    const users = await learnerGroup.get('usersOnlyAtThisLevel');
    assert.equal(users.length, 1);
    assert.ok(users.includes(user2));
  });


  test('allParentTitles', async function(assert) {
    assert.expect(4);
    const store = this.owner.lookup('service:store');
    const learnerGroup = store.createRecord('learner-group', {title: 'Foo'});
    let titles = await learnerGroup.get('allParentTitles');
    assert.equal(titles.length, 0);

    const subGroup = store.createRecord('learner-group', {title: 'Bar', parent: learnerGroup });
    const subSubGroup = store.createRecord('learner-group', {title: 'Baz', parent: subGroup });
    titles = await subSubGroup.get('allParentTitles');
    assert.equal(titles.length, 2);
    assert.equal(titles[0], 'Foo');
    assert.equal(titles[1], 'Bar');
  });

  test('allParentsTitle', async function(assert) {
    assert.expect(2);

    const store = this.owner.lookup('service:store');
    const learnerGroup = store.createRecord('learner-group', {title: 'Foo'});
    let titles = await learnerGroup.get('allParentsTitle');
    assert.equal(titles.length, '');

    const subGroup = store.createRecord('learner-group', {title: 'Bar', parent: learnerGroup });
    const subSubGroup = store.createRecord('learner-group', {title: 'Baz', parent: subGroup });
    titles = await subSubGroup.get('allParentsTitle');
    assert.equal(titles, 'Foo > Bar > ');
  });

  test('sortTitle', async function(assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const learnerGroup = store.createRecord('learner-group', {title: 'Foo'});
    let title = await learnerGroup.get('sortTitle');
    assert.equal(title, 'Foo');

    const subGroup = store.createRecord('learner-group', {title: 'Bar', parent: learnerGroup });
    const subSubGroup = store.createRecord('learner-group', {title: 'Baz', parent: subGroup });
    title = await subSubGroup.get('sortTitle');
    assert.equal(title, 'FooBarBaz');
  });

  test('topLevelGroup', async function(assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const learnerGroup = store.createRecord('learner-group');
    let topLevelGroup = await learnerGroup.get('topLevelGroup');
    assert.equal(topLevelGroup, learnerGroup);
    const subGroup = store.createRecord('learner-group', { parent: learnerGroup });
    const subSubGroup = store.createRecord('learner-group', { parent: subGroup });
    topLevelGroup = await subSubGroup.get('topLevelGroup');
    assert.equal(topLevelGroup, learnerGroup);
  });

  test('isTopLevelGroup', async function(assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const learnerGroup = store.createRecord('learner-group', { id: 1 });
    assert.ok(learnerGroup.get('isTopLevelGroup'));

    const subGroup = store.createRecord('learner-group', { parent: learnerGroup});
    assert.notOk(subGroup.get('isTopLevelGroup'));
  });

  test('school', async function(assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const learnerGroup = store.createRecord('learner-group');
    const school = store.createRecord('school');
    const program = store.createRecord('program', { school });
    const programYear = store.createRecord('program-year', { program });
    const cohort = store.createRecord('cohort', { programYear });
    learnerGroup.set('cohort', cohort);
    const owningSchool = await learnerGroup.get('school');
    assert.equal(owningSchool, school);
  });

  test('usersCount', async function(assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const learnerGroup = store.createRecord('learner-group');
    assert.equal(learnerGroup.get('usersCount'), 0);
    const user1 = store.createRecord('user');
    const user2 = store.createRecord('user');

    learnerGroup.get('users').pushObjects([user1, user2 ]);
    assert.equal(learnerGroup.get('usersCount'), 2);
  });

  test('childrenCount', async function(assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store');
    const learnerGroup = store.createRecord('learner-group');
    assert.equal(learnerGroup.get('childrenCount'), 0);
    const group1 = store.createRecord('learner-group');
    const group2 = store.createRecord('learner-group');

    learnerGroup.get('children').pushObjects([group1, group2 ]);
    assert.equal(learnerGroup.get('childrenCount'), 2);
  });

  test('has no needs in group without subgroups', async function(assert) {
    assert.expect(1);
    const learnerGroup = this.owner.lookup('service:store').createRecord('learner-group');
    const hasNeeds = await learnerGroup.get('hasSubgroupsInNeedOfAccommodation');
    assert.notOk(hasNeeds);
  });

  test('has no needs in group with subgroups without needs', async function(assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const learnerGroup = store.createRecord('learner-group');
    const subGroup1 = store.createRecord('learner-group', { parent: learnerGroup });
    const subGroup2 = store.createRecord('learner-group', { parent: learnerGroup });
    learnerGroup.get('children').pushObject(subGroup1);
    learnerGroup.get('children').pushObject(subGroup2);

    const hasNeeds = await learnerGroup.get('hasSubgroupsInNeedOfAccommodation');
    assert.notOk(hasNeeds);
  });

  test('has needs in group with subgroups with needs', async function(assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const learnerGroup = store.createRecord('learner-group');
    const subGroup1 = store.createRecord('learner-group', { parent: learnerGroup });
    const subGroup2 = store.createRecord('learner-group', { parent: learnerGroup, needsAccommodation: true });
    learnerGroup.get('children').pushObject(subGroup1);
    learnerGroup.get('children').pushObject(subGroup2);
    const hasNeeds = await learnerGroup.get('hasSubgroupsInNeedOfAccommodation');
    assert.ok(hasNeeds);
  });


  test('has no needs in deeply nested subgroups without needs', async function(assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const learnerGroup = store.createRecord('learner-group');
    const subGroup1 = store.createRecord('learner-group', { parent: learnerGroup });
    const subGroup2 = store.createRecord('learner-group', { parent: learnerGroup });
    learnerGroup.get('children').pushObject(subGroup1);
    learnerGroup.get('children').pushObject(subGroup2);
    const subSubGroup1 = store.createRecord('learner-group', { parent: subGroup1 });
    const subSubGroup2 = store.createRecord('learner-group', { parent: subGroup1 });
    subGroup1.get('children').pushObject(subSubGroup1);
    subGroup1.get('children').pushObject(subSubGroup2);
    const subSubGroup3 = store.createRecord('learner-group', { parent: subGroup2 });
    const subSubGroup4 = store.createRecord('learner-group', { parent: subGroup2 });
    subGroup2.get('children').pushObject(subSubGroup3);
    subGroup2.get('children').pushObject(subSubGroup4);
    const hasNeeds = await learnerGroup.get('hasSubgroupsInNeedOfAccommodation');
    assert.notOk(hasNeeds);
  });

  test('has needs in deeply nested subgroups with needs', async function(assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const learnerGroup = store.createRecord('learner-group');
    const subGroup1 = store.createRecord('learner-group', { parent: learnerGroup });
    const subGroup2 = store.createRecord('learner-group', { parent: learnerGroup });
    learnerGroup.get('children').pushObject(subGroup1);
    learnerGroup.get('children').pushObject(subGroup2);
    const subSubGroup1 = store.createRecord('learner-group', { parent: subGroup1 });
    const subSubGroup2 = store.createRecord('learner-group', { parent: subGroup1 });
    subGroup1.get('children').pushObject(subSubGroup1);
    subGroup1.get('children').pushObject(subSubGroup2);
    const subSubGroup3 = store.createRecord('learner-group', { parent: subGroup2 });
    const subSubGroup4 = store.createRecord('learner-group', { parent: subGroup2, needsAccommodation: true });
    subGroup2.get('children').pushObject(subSubGroup3);
    subGroup2.get('children').pushObject(subSubGroup4);
    const hasNeeds = await learnerGroup.get('hasSubgroupsInNeedOfAccommodation');
    assert.ok(hasNeeds);
  });
});
