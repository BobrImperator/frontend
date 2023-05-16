import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { enqueueTask, timeout } from 'ember-concurrency';
import { mapBy } from 'ilios-common/utils/array-helpers';

export default class LearnerGroupUserManagerComponent extends Component {
  @service currentUser;

  @tracked filter = '';
  @tracked selectedGroupUsers = [];
  @tracked selectedNonGroupUsers = [];
  @tracked usersBeingAddedToGroup = [];
  @tracked usersBeingRemovedFromGroup = [];

  get sortedAscending() {
    return this.args.sortBy.search(/desc/) === -1;
  }

  get selectableUsers() {
    if (this.currentUser.isRoot) {
      return mapBy(this.args.users, 'content');
    }
    return mapBy(
      this.args.users.filter((user) => {
        return user.get('enabled');
      }),
      'content'
    );
  }

  get filteredUsers() {
    if (!this.args.users) {
      return [];
    }
    const filter = this.filter.trim().toLowerCase();

    if (!filter) {
      return this.args.users;
    }

    return this.args.users.filter((user) => {
      return (
        user.get('fullNameFromFirstLastName').trim().toLowerCase().includes(filter) ||
        user.get('fullName').trim().toLowerCase().includes(filter) ||
        user.get('email').trim().toLowerCase().includes(filter)
      );
    });
  }

  get groupUsers() {
    if (!this.args.isEditing) {
      return this.filteredUsers;
    }
    return this.filteredUsers.filter(
      (user) => user.get('lowestGroupInTree').id === this.args.learnerGroupId
    );
  }

  get nonGroupUsers() {
    return this.filteredUsers.filter(
      (user) => user.get('lowestGroupInTree').id !== this.args.learnerGroupId
    );
  }

  get hasSelectedGroupUsers() {
    return !!this.selectedGroupUsers.length;
  }

  get hasSelectedNonGroupUsers() {
    return !!this.selectedNonGroupUsers.length;
  }

  get hasSomeSelectedGroupUsers() {
    return this.hasSelectedGroupUsers && this.groupUsers.length !== this.selectedGroupUsers.length;
  }

  get hasSomeSelectedNonGroupUsers() {
    return (
      this.hasSelectedNonGroupUsers &&
      this.nonGroupUsers.length !== this.selectedNonGroupUsers.length
    );
  }

  get hasAllSelectedGroupUsers() {
    return this.hasSelectedGroupUsers && this.groupUsers.length === this.selectedGroupUsers.length;
  }

  get hasAllSelectedNonGroupUsers() {
    return (
      this.hasSelectedNonGroupUsers &&
      this.nonGroupUsers.length === this.selectedNonGroupUsers.length
    );
  }

  @action
  setSortBy(what) {
    if (this.args.sortBy === what) {
      what += ':desc';
    }
    this.args.setSortBy(what);
  }

  @action
  toggleGroupUserSelection(user) {
    if (this.selectedGroupUsers.includes(user)) {
      this.selectedGroupUsers = this.selectedGroupUsers.filter(
        (selectedUser) => selectedUser !== user
      );
    } else {
      this.selectedGroupUsers = [...this.selectedGroupUsers, user];
    }
  }

  @action
  toggleNonGroupUserSelection(user) {
    if (this.selectedNonGroupUsers.includes(user)) {
      this.selectedNonGroupUsers = this.selectedNonGroupUsers.filter(
        (selectedUser) => selectedUser !== user
      );
    } else {
      this.selectedNonGroupUsers = [...this.selectedNonGroupUsers, user];
    }
  }

  @action
  toggleAllGroupUsersSelection() {
    if (!this.groupUsers.length) {
      return false;
    }
    if (this.hasAllSelectedGroupUsers) {
      this.selectedGroupUsers = [];
    } else {
      this.selectedGroupUsers = [...mapBy(this.groupUsers, 'content')];
    }
    return false;
  }

  @action
  toggleAllNonGroupUsersSelection() {
    if (!this.nonGroupUsers.length) {
      return false;
    }
    if (this.hasAllSelectedNonGroupUsers) {
      this.selectedNonGroupUsers = [];
    } else {
      this.selectedNonGroupUsers = [...mapBy(this.nonGroupUsers, 'content')];
    }
    return false;
  }

  @enqueueTask
  *addUserToGroup(user) {
    this.usersBeingAddedToGroup = [...this.usersBeingAddedToGroup, user];
    //timeout gives the spinner time to render
    yield timeout(1);
    yield this.args.addUserToGroup(user);
    this.usersBeingAddedToGroup = this.usersBeingAddedToGroup.filter(
      (movingUser) => movingUser !== user
    );
  }

  @enqueueTask
  *removeUserFromGroup(user) {
    this.usersBeingRemovedFromGroup = [...this.usersBeingRemovedFromGroup, user];
    //timeout gives the spinner time to render
    yield timeout(1);
    yield this.args.removeUserFromGroup(user);
    this.usersBeingRemovedFromGroup = this.usersBeingRemovedFromGroup.filter(
      (movingUser) => movingUser !== user
    );
  }

  @enqueueTask
  *addUsersToGroup() {
    this.usersBeingAddedToGroup = [...this.usersBeingAddedToGroup, ...this.selectedNonGroupUsers];
    //timeout gives the spinner time to render
    yield timeout(1);
    yield this.args.addUsersToGroup(this.selectedNonGroupUsers);
    this.usersBeingAddedToGroup = this.usersBeingAddedToGroup.filter((user) =>
      this.selectedNonGroupUsers.includes(user)
    );
    this.selectedNonGroupUsers = [];
  }

  @enqueueTask
  *removeUsersFromGroup() {
    this.usersBeingRemovedFromGroup = [
      ...this.usersBeingRemovedFromGroup,
      ...this.selectedGroupUsers,
    ];
    //timeout gives the spinner time to render
    yield timeout(1);
    yield this.args.removeUsersFromGroup(this.selectedGroupUsers);
    this.usersBeingRemovedFromGroup = this.usersBeingRemovedFromGroup.filter((user) =>
      this.selectedGroupUsers.includes(user)
    );
    this.selectedGroupUsers = [];
  }
}
