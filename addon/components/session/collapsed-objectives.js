import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency-decorators';

export default class SessionCollapsedObjectivesComponent extends Component {
  @tracked objectives;
  @tracked objectivesWithParents;
  @tracked objectivesWithMesh;
  @tracked objectivesWithTerms;

  @restartableTask
  *load(element, [objectivePromise]) {
    if (!objectivePromise) {
      return false;
    }
    this.objectives = yield objectivePromise;

    this.objectivesWithParents = this.objectives.filter(objective => {
      const parentIds = objective.hasMany('courseObjectives').ids();

      return parentIds.length > 0;
    });
    this.objectivesWithMesh = this.objectives.filter(objective => {
      const meshDescriptorIds = objective.hasMany('meshDescriptors').ids();

      return meshDescriptorIds.length > 0;
    });
    this.objectivesWithTerms = this.objectives.filter(objective => {
      const termIds = objective.hasMany('terms').ids();
      return termIds.length > 0;
    });

    return true;
  }
}
