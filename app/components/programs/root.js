import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import PermissionChecker from 'ilios/classes/permission-checker';
import { dropTask } from 'ember-concurrency';

export default class ProgramRootComponent extends Component {
  @service currentUser;
  @tracked selectedSchoolId;
  @tracked showNewProgramForm = false;
  @tracked newProgram;

  @use user = new ResolveAsyncValue(() => [this.currentUser.getModel()]);
  @use canCreate = new PermissionChecker(() => ['canCreateProgram', this.bestSelectedSchool]);
  @use programs = new ResolveAsyncValue(() => [this.bestSelectedSchool.programs, []]);

  get bestSelectedSchool() {
    if (this.selectedSchoolId) {
      return this.args.schools.findBy('id', this.selectedSchoolId);
    }

    const schoolId = this.user?.belongsTo('school').id();
    return schoolId ? this.args.schools.findBy('id', schoolId) : this.args.schools.firstObject;
  }

  @dropTask
  *saveNewProgram(newProgram) {
    newProgram.set('school', this.bestSelectedSchool);
    newProgram.set('duration', 4);
    this.newProgram = yield newProgram.save();
    this.showNewProgramForm = false;
  }
}
