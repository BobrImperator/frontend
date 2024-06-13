import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import AsyncProcess from 'ilios-common/classes/async-process';
import { TrackedAsyncData } from 'ember-async-data';
import { use } from 'ember-could-get-used-to-this';

export default class DetailLearningMaterialsItemComponent extends Component {
  @tracked showRemoveConfirmation = false;

  @use owningUser = new AsyncProcess(() => [this.getOwningUser.bind(this), this.args.lm]);

  @cached
  get meshDescriptorsData() {
    return new TrackedAsyncData(this.args.lm.meshDescriptors);
  }

  get meshDescriptors() {
    return this.meshDescriptorsData.isResolved ? this.meshDescriptorsData.value.slice() : [];
  }

  get meshDescriptorsLoaded() {
    return this.meshDescriptorsData.isResolved;
  }

  async getOwningUser(lm) {
    const learningMaterial = await lm.learningMaterial;
    return await learningMaterial.owningUser;
  }

  remove = dropTask(async (lm) => {
    await this.args.remove.perform(lm);
  });
}
