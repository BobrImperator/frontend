import { service } from '@ember/service';
import Route from '@ember/routing/route';

export default class SessionCopyRoute extends Route {
  @service permissionChecker;
  @service session;

  canUpdate = false;

  async afterModel(session) {
    this.canUpdate = await this.permissionChecker.canUpdateSession(session);
  }

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('canUpdate', this.canUpdate);
  }
}
