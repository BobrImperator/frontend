import EmberObject from '@ember/object';
import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, findAll, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | learnergroup cohort user manager', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    const userList = 'tbody tr';
    const user1CheckBox = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input[type=checkbox]';
    const user1FirstName = 'tbody tr:nth-of-type(1) td:nth-of-type(2)';
    const user1LastName = 'tbody tr:nth-of-type(1) td:nth-of-type(3)';
    const user1CampusId = 'tbody tr:nth-of-type(1) td:nth-of-type(4)';
    const user1Email = 'tbody tr:nth-of-type(1) td:nth-of-type(5)';
    const user2Disabled = 'tbody tr:nth-of-type(2) td:nth-of-type(1) svg';
    const user2FirstName = 'tbody tr:nth-of-type(2) td:nth-of-type(2)';
    const user2LastName = 'tbody tr:nth-of-type(2) td:nth-of-type(3)';
    const user2CampusId = 'tbody tr:nth-of-type(2) td:nth-of-type(4)';
    const user2Email = 'tbody tr:nth-of-type(2) td:nth-of-type(5)';

    let user1 = EmberObject.create({
      firstName: 'Jasper',
      lastName: 'Dog',
      campusId: '1234',
      email: 'testemail',
      enabled: true,
    });
    let user2 = EmberObject.create({
      firstName: 'Jackson',
      lastName: 'Doggy',
      campusId: '123',
      email: 'testemail2',
      enabled: false,
    });

    this.set('users', [user1, user2]);
    this.set('nothing', () => {});

    await render(hbs`{{learnergroup-cohort-user-manager
      users=users
      canUpdate=true
      learnerGroupTitle='this group'
      topLevelGroupTitle='top level group'
      sortBy='lastName'
      setSortBy=(action nothing)
      addUserToGroup=(action nothing)
      addUsersToGroup=(action nothing)
    }}`);


    assert.equal(find('.title').textContent.trim(), 'Cohort Members NOT assigned to top level group  (2)');
    assert.equal(findAll(userList).length, 2);
    assert.equal(findAll(user1CheckBox).length, 1);
    assert.notOk(find(user1CheckBox).prop('checked'));
    assert.equal(find(user1FirstName).textContent.trim(), 'Jasper');
    assert.equal(find(user1LastName).textContent.trim(), 'Dog');
    assert.equal(find(user1CampusId).textContent.trim(), '1234');
    assert.equal(find(user1Email).textContent.trim(), 'testemail');

    assert.equal(findAll(user2Disabled).length, 1);
    assert.equal(find(user2FirstName).textContent.trim(), 'Jackson');
    assert.equal(find(user2LastName).textContent.trim(), 'Doggy');
    assert.equal(find(user2CampusId).textContent.trim(), '123');
    assert.equal(find(user2Email).textContent.trim(), 'testemail2');
  });

  test('sort by firstName', async function(assert) {
    const userList = 'tbody tr';
    const user1FirstName = 'tbody tr:nth-of-type(1) td:nth-of-type(2)';
    const user2FirstName = 'tbody tr:nth-of-type(2) td:nth-of-type(2)';

    let user1 = EmberObject.create({
      firstName: 'Jasper',
    });
    let user2 = EmberObject.create({
      firstName: 'Jackson',
    });

    this.set('users', [user1, user2]);
    this.set('nothing', () => {});

    await render(hbs`{{learnergroup-cohort-user-manager
      users=users
      canUpdate=true
      learnerGroupTitle='this group'
      topLevelGroupTitle='top level group'
      sortBy='firstName'
      setSortBy=(action nothing)
      addUserToGroup=(action nothing)
      addUsersToGroup=(action nothing)
    }}`);


    assert.equal(findAll(userList).length, 2);
    assert.equal(find(user1FirstName).textContent.trim(), 'Jackson');
    assert.equal(find(user2FirstName).textContent.trim(), 'Jasper');
  });

  test('add multiple users', async function(assert) {
    assert.expect(4);
    const user1CheckBox = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input[type=checkbox]';
    const button = 'button.done';

    let user1 = EmberObject.create({
      enabled: true,
    });

    this.set('users', [user1]);
    this.set('nothing', () => {});
    this.set('addMany', ([user]) => {
      assert.equal(user1, user);
    });

    await render(hbs`{{learnergroup-cohort-user-manager
      users=users
      canUpdate=true
      learnerGroupTitle='this group'
      topLevelGroupTitle='top level group'
      sortBy='firstName'
      setSortBy=(action nothing)
      addUserToGroup=(action nothing)
      addUsersToGroup=(action addMany)
    }}`);

    assert.equal(findAll(button).length, 0);
    find(user1CheckBox).click();
    assert.equal(find(button).textContent.trim(), 'Move learner to this group');
    await click(button);
    await settled();
    assert.equal(findAll(button).length, 0, 'button is hidden after save');
  });

  test('add single user', async function(assert) {
    assert.expect(1);
    const action = 'tbody tr:nth-of-type(1) td:nth-of-type(6) .clickable';

    let user1 = EmberObject.create({
      enabled: true,
    });

    this.set('users', [user1]);
    this.set('nothing', () => {});
    this.set('addOne', user => {
      assert.equal(user1, user);
    });

    await render(hbs`{{learnergroup-cohort-user-manager
      users=users
      canUpdate=true
      learnerGroupTitle='this group'
      topLevelGroupTitle='top level group'
      sortBy='firstName'
      setSortBy=(action nothing)
      addUserToGroup=(action addOne)
      addUsersToGroup=(action nothing)
    }}`);

    return settled(find(action).click());

  });

  test('when users are selected single action is disabled', async function(assert) {
    assert.expect(1);
    const user1CheckBox = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input[type=checkbox]';
    const action = 'tbody tr:nth-of-type(1) td:nth-of-type(6) .clickable';

    let user1 = EmberObject.create({
      enabled: true,
    });

    this.set('users', [user1]);
    this.set('nothing', () => {});

    await render(hbs`{{learnergroup-cohort-user-manager
      users=users
      canUpdate=true
      learnerGroupTitle='this group'
      topLevelGroupTitle='top level group'
      sortBy='firstName'
      setSortBy=(action nothing)
      addUserToGroup=(action nothing)
      addUsersToGroup=(action nothing)
    }}`);

    find(user1CheckBox).click();
    assert.equal(findAll(action).length, 0);

  });

  test('checkall', async function(assert) {
    assert.expect(5);
    const checkAllBox = 'thead tr:nth-of-type(1) th:nth-of-type(1) input[type=checkbox]';
    const user1CheckBox = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input[type=checkbox]';
    const user2CheckBox = 'tbody tr:nth-of-type(2) td:nth-of-type(1) input[type=checkbox]';
    const button = 'button.done';

    let user1 = EmberObject.create({
      enabled: true,
    });
    let user2 = EmberObject.create({
      enabled: true,
    });

    this.set('users', [user1, user2]);
    this.set('nothing', () => {});
    this.set('addMany', ([userA, userB]) => {
      assert.equal(user1, userA);
      assert.equal(user2, userB);
    });

    await render(hbs`{{learnergroup-cohort-user-manager
      users=users
      canUpdate=true
      learnerGroupTitle='this group'
      topLevelGroupTitle='top level group'
      sortBy='firstName'
      setSortBy=(action nothing)
      addUserToGroup=(action nothing)
      addUsersToGroup=(action addMany)
    }}`);

    find(checkAllBox).click();
    assert.ok(find(user1CheckBox).prop('checked'));
    assert.ok(find(user2CheckBox).prop('checked'));
    assert.equal(find(button).textContent.trim(), 'Move 2 learners to this group');
    return settled(await click(button));

  });

  test('checking one puts checkall box into indeterminate state', async function(assert) {
    assert.expect(4);
    const checkAllBox = 'thead tr:nth-of-type(1) th:nth-of-type(1) input[type=checkbox]';
    const user1CheckBox = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input[type=checkbox]';
    const user2CheckBox = 'tbody tr:nth-of-type(2) td:nth-of-type(1) input[type=checkbox]';

    let user1 = EmberObject.create({
      enabled: true,
    });
    let user2 = EmberObject.create({
      enabled: true,
    });

    this.set('users', [user1, user2]);
    this.set('nothing', () => {});

    await render(hbs`{{learnergroup-cohort-user-manager
      users=users
      canUpdate=true
      learnerGroupTitle='this group'
      topLevelGroupTitle='top level group'
      sortBy='firstName'
      setSortBy=(action nothing)
      addUserToGroup=(action nothing)
      addUsersToGroup=(action nothing)
    }}`);

    find(user1CheckBox).click();
    assert.ok(find(checkAllBox).prop('indeterminate'));
    find(user2CheckBox).click();
    assert.ok(find(checkAllBox).prop('checked'));
    find(checkAllBox).click();
    assert.notOk(find(user1CheckBox).prop('checked'));
    assert.notOk(find(user2CheckBox).prop('checked'));
  });

  test('root users can manage disabled users', async function(assert) {
    assert.expect(2);
    const currentUserMock = Service.extend({
      isRoot: true,
    });
    this.owner.register('service:currentUser', currentUserMock);

    const userCheckbox = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input[type=checkbox]';
    const userDisabledIcon = 'tbody tr:nth-of-type(1) td:nth-of-type(1) .fa-user-times';


    let user1 = EmberObject.create({
      enabled: false,
    });

    this.set('users', [user1]);
    this.set('nothing', () => {});

    await render(hbs`{{learnergroup-cohort-user-manager
      users=users
      canUpdate=true
      learnerGroupTitle='this group'
      topLevelGroupTitle='top level group'
      sortBy='firstName'
      setSortBy=(action nothing)
      addUserToGroup=(action nothing)
      addUsersToGroup=(action nothing)
    }}`);

    assert.equal(1, findAll(userCheckbox).length, 'Checkbox visible');
    assert.equal(1, findAll(userDisabledIcon).length, 'User is labeled as disabled.');
  });

  test('non-root users cannot manage disabled users', async function(assert) {
    assert.expect(2);
    const currentUserMock = Service.extend({
      isRoot: false,
    });
    this.owner.register('service:currentUser', currentUserMock);

    const userCheckbox = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input[type=checkbox]';
    const userDisabledIcon = 'tbody tr:nth-of-type(1) td:nth-of-type(1) .fa-user-times';


    let user1 = EmberObject.create({
      enabled: false,
    });

    this.set('users', [user1]);
    this.set('nothing', () => {});

    await render(hbs`{{learnergroup-cohort-user-manager
      users=users
      canUpdate=true
      learnerGroupTitle='this group'
      topLevelGroupTitle='top level group'
      sortBy='firstName'
      setSortBy=(action nothing)
      addUserToGroup=(action nothing)
      addUsersToGroup=(action nothing)
    }}`);

    assert.equal(0, findAll(userCheckbox).length, 'Checkbox not visible');
    assert.equal(1, findAll(userDisabledIcon).length, 'User is labeled as disabled.');
  });
});
