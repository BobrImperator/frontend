import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { use } from 'ember-could-get-used-to-this';
import ResolveFlatMapBy from 'ilios-common/classes/resolve-flat-map-by';
import { uniqueValues } from 'ilios-common/utils/array-helpers';

export default class InstructorGroupModel extends Model {
  @attr('string')
  title;

  @belongsTo('school', { async: true, inverse: 'instructorGroups' })
  school;

  @hasMany('learner-group', { async: true, inverse: 'instructorGroups' })
  learnerGroups;

  @hasMany('ilm-session', { async: true, inverse: 'instructorGroups' })
  ilmSessions;

  @hasMany('user', { async: true, inverse: 'instructorGroups' })
  users;

  @hasMany('offering', { async: true, inverse: 'instructorGroups' })
  offerings;

  @use _offeringSessions = new ResolveFlatMapBy(() => [this.offerings, 'session']);
  @use coursesFromOfferings = new ResolveFlatMapBy(() => [this._offeringSessions, 'course']);
  @use _ilmSessionSessions = new ResolveFlatMapBy(() => [this.ilmSessions, 'session']);
  @use coursesFromIlmSessions = new ResolveFlatMapBy(() => [this._ilmSessionSessions, 'course']);

  get courses() {
    if (!this.coursesFromIlmSessions || !this.coursesFromOfferings) {
      return [];
    }
    return uniqueValues([...this.coursesFromIlmSessions, ...this.coursesFromOfferings]);
  }

  /**
   * A list of all sessions associated with this group, via offerings or via ILMs.
   */
  get sessions() {
    if (!this._offeringSessions || !this._ilmSessionSessions) {
      return [];
    }
    return uniqueValues([...this._offeringSessions, ...this._ilmSessionSessions]);
  }

  /**
   * Returns the number of users in this group
   */
  get usersCount() {
    return this.hasMany('users').ids().length;
  }
}
