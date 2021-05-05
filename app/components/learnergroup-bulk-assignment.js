import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isEmpty, isPresent } from '@ember/utils';

export default class LearnergroupBulkAssignmentComponent extends Component {
  @service store;
  @tracked user;
  @tracked validUsers = [];
  @tracked matchedGroups = [];

  get unmatchedGroups() {
    return this.validUsers
      .mapBy('subGroupName')
      .uniq()
      .filter((str) => isPresent(str));
  }

  get allUnmatchedGroupsMatched() {
    return !this.unmatchedGroups.filter((groupName) => {
      return isEmpty(this.matchedGroups.findBy('name', groupName));
    }).length;
  }

  @action
  async addMatch(name, groupId) {
    const group = await this.store.find('learner-group', groupId);
    const matchedGroups = this.matchedGroups.toArray();
    const match = matchedGroups.findBy('name', name);
    if (match) {
      match.group = group;
    } else {
      this.matchedGroups = [...this.matchedGroups, { name, group }];
    }
  }

  @action
  removeMatch(name) {
    this.matchedGroups = this.matchedGroups.filter((group) => {
      group.name !== name;
    });
  }

  @action
  async createGroup(title) {
    const learnerGroup = this.args.learnerGroup;
    const cohort = await learnerGroup.cohort;
    const group = this.store.createRecord('learner-group', {
      title,
      cohort,
      parent: learnerGroup,
    });
    const savedGroup = await group.save();
    learnerGroup.get('children').pushObject(savedGroup);
    this.matchedGroups = [...this.matchedGroups, { name: title, group: savedGroup }];
  }

  @action
  clear() {
    this.validUsers = [];
    this.matchedGroups = [];
  }
}
