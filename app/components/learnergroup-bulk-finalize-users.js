import Component from '@glimmer/component';
import { dropTask, timeout } from 'ember-concurrency';
import { map } from 'rsvp';
import { inject as service } from '@ember/service';
import { all } from 'rsvp';

export default class LearnergroupBulkFinalizeUsersComponent extends Component {
  @service flashMessages;

  get finalData() {
    return this.args.users.map((obj) => {
      let selectedGroup = this.args.learnerGroup;
      if (obj.subGroupName) {
        const match = this.args.matchedGroups.findBy('name', obj.subGroupName);
        if (match) {
          selectedGroup = match.group;
        }
      }
      return {
        user: obj.userRecord,
        learnerGroup: selectedGroup,
      };
    });
  }

  @dropTask
  *save() {
    yield timeout(10);
    const treeGroups = yield map(this.finalData, async ({ learnerGroup, user }) => {
      return learnerGroup.addUserToGroupAndAllParents(user);
    });

    const flat = treeGroups.reduce((flattened, arr) => {
      return flattened.pushObjects(arr);
    }, []);

    yield all(flat.uniq().invoke('save'));
    this.flashMessages.success('general.savedSuccessfully');
    this.args.done();
  }
}
