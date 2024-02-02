import { service } from '@ember/service';
import Route from '@ember/routing/route';

export default class DashboardWeekRoute extends Route {
  @service session;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }
}
