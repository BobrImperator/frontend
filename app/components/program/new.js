import Component from '@glimmer/component';
import { service } from '@ember/service';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { action } from '@ember/object';

@validatable
export default class NewProgramComponent extends Component {
  @service store;

  @tracked @Length(3, 200) @NotBlank() title;

  @dropTask
  *save() {
    this.addErrorDisplayFor('title');
    const isValid = yield this.isValid();
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('title');
    const program = this.store.createRecord('program', {
      title: this.title,
    });
    yield this.args.save(program);
  }

  @action
  async keyboard({ keyCode }) {
    if (13 === keyCode) {
      await this.save.perform();
      return;
    }

    if (27 === keyCode) {
      this.args.cancel();
    }
  }
}
