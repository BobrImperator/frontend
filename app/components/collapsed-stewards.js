import Component from '@ember/component';
import { computed } from '@ember/object';
import { isEmpty, isPresent } from '@ember/utils';
import { map } from 'rsvp';

export default Component.extend({
  classNames: ['collapsed-stewards'],
  tagName: 'section',

  programYear: null,

  schoolData: computed('programYear.stewards.[]', async function(){
    const programYear = this.programYear;
    if (isEmpty(programYear)) {
      return [];
    }

    const stewards = await programYear.get('stewards');
    const stewardObjects = await map(stewards.toArray(), async steward => {
      const school = await steward.get('school');
      const department = await steward.get('department');
      const departmentId = isPresent(department)?department.get('id'):0;
      return {
        schoolId: school.get('id'),
        schoolTitle: school.get('title'),
        departmentId
      };
    });
    const schools = stewardObjects.uniqBy('schoolId');
    const schoolData = schools.map(obj => {
      const departments = stewardObjects.filterBy('schoolId', obj.schoolId);
      delete obj.departmentId;
      obj.departmentCount = departments.length;

      return obj;
    });

    return schoolData;
  })
});
