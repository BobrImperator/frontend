import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default Service.extend({
  currentUser: service(),
  permissionMatrix: service(),
  async canDoInSchool(school, capability) {
    const currentUser = await this.get('currentUser');
    const isRoot = await currentUser.get('isRoot');
    if (isRoot) {
      return true;
    }
    const permissionMatrix = this.get('permissionMatrix');
    const rolesInSchool = await currentUser.getRolesInSchool(school);

    return permissionMatrix.hasPermission(school, capability, rolesInSchool);
  },
  async canUpdateCourse(course) {
    const currentUser = await this.get('currentUser');
    const permissionMatrix = this.get('permissionMatrix');
    if (course.get('locked') || course.get('archived')) {
      return false;
    }
    const school = await course.get('school');

    if (await this.canDoInSchool(school, 'CAN_UPDATE_ALL_COURSES')) {
      return true;
    }

    const rolesInCourse = await currentUser.getRolesInCourse(course);
    return await permissionMatrix.hasPermission(school, 'CAN_UPDATE_THEIR_COURSES', rolesInCourse);
  },
  async canDeleteCourse(course) {
    const currentUser = await this.get('currentUser');
    const permissionMatrix = this.get('permissionMatrix');
    if (course.get('locked') || course.get('archived')) {
      return false;
    }

    const school = await course.get('school');
    if (await this.canDoInSchool(school, 'CAN_DELETE_ALL_COURSES')) {
      return true;
    }

    const rolesInCourse = await currentUser.getRolesInCourse(course);
    return await permissionMatrix.hasPermission(school, 'CAN_DELETE_THEIR_COURSES', rolesInCourse);
  },
  async canCreateCourse(school) {
    return this.canDoInSchool(school, 'CAN_CREATE_COURSES');
  },
  async canUnlockCourse(course) {
    const currentUser = await this.get('currentUser');
    const permissionMatrix = this.get('permissionMatrix');

    const school = await course.get('school');
    if (await this.canDoInSchool(school, 'CAN_UNLOCK_ALL_COURSES')) {
      return true;
    }

    const rolesInCourse = await currentUser.getRolesInCourse(course);
    return await permissionMatrix.hasPermission(school, 'CAN_UNLOCK_THEIR_COURSES', rolesInCourse);
  },
  async canUpdateSession(session) {
    const currentUser = await this.get('currentUser');
    const permissionMatrix = this.get('permissionMatrix');

    const course = await session.get('course');

    if (course.get('locked') || course.get('archived')) {
      return false;
    }

    const school = await course.get('school');
    if (await this.canDoInSchool(school, 'CAN_UPDATE_ALL_SESSIONS')) {
      return true;
    }

    const rolesInSession = await currentUser.getRolesInSession(session);
    if (await permissionMatrix.hasPermission(school, 'CAN_UPDATE_THEIR_SESSIONS', rolesInSession)) {
      return true;
    }

    return this.canUpdateCourse(course);
  },
  async canDeleteSession(session) {
    const currentUser = await this.get('currentUser');
    const permissionMatrix = this.get('permissionMatrix');

    const course = await session.get('course');

    if (course.get('locked') || course.get('archived')) {
      return false;
    }

    const school = await course.get('school');
    if (await this.canDoInSchool(school, 'CAN_DELETE_ALL_SESSIONS')) {
      return true;
    }

    const rolesInSession = await currentUser.getRolesInSession(session);
    if (await permissionMatrix.hasPermission(school, 'CAN_DELETE_THEIR_SESSIONS', rolesInSession)) {
      return true;
    }

    return this.canUpdateCourse(course);
  },
  async canCreateSession(course) {
    if (course.get('locked') || course.get('archived')) {
      return false;
    }

    const school = await course.get('school');
    if (await this.canDoInSchool(school, 'CAN_CREATE_SESSIONS')) {
      return true;
    }

    return this.canUpdateCourse(course);
  },
  async canUpdateSessionType(sessionType) {
    const school = await sessionType.get('school');
    return this.canDoInSchool(school, 'CAN_UPDATE_SESSION_TYPES');
  },
  async canDeleteSessionType(sessionType) {
    const school = await sessionType.get('school');
    return this.canDoInSchool(school, 'CAN_DELETE_SESSION_TYPES');
  },
  async canCreateSessionType(school) {
    return this.canDoInSchool(school, 'CAN_CREATE_SESSION_TYPES');
  },
  async canUpdateDepartment(department) {
    const school = await department.get('school');
    return this.canDoInSchool(school, 'CAN_UPDATE_DEPARTMENTS');
  },
  async canDeleteDepartment(department) {
    const school = await department.get('school');
    return this.canDoInSchool(school, 'CAN_DELETE_DEPARTMENTS');
  },
  async canCreateDepartment(school) {
    return this.canDoInSchool(school, 'CAN_CREATE_DEPARTMENTS');
  },
  async canUpdateProgram(program) {
    const currentUser = await this.get('currentUser');
    const permissionMatrix = this.get('permissionMatrix');

    const school = await program.get('school');
    if (await this.canDoInSchool(school, 'CAN_UPDATE_ALL_PROGRAMS')) {
      return true;
    }

    const rolesInProgram = await currentUser.getRolesInProgram(program);
    return await permissionMatrix.hasPermission(school, 'CAN_UPDATE_THEIR_PROGRAMS', rolesInProgram);
  },
  async canDeleteProgram(program) {
    const currentUser = await this.get('currentUser');
    const permissionMatrix = this.get('permissionMatrix');
    const school = await program.get('school');
    if (await this.canDoInSchool(school, 'CAN_DELETE_ALL_PROGRAMS')) {
      return true;
    }

    const rolesInProgram = await currentUser.getRolesInProgram(program);
    return await permissionMatrix.hasPermission(school, 'CAN_DELETE_THEIR_PROGRAMS', rolesInProgram);
  },
  async canCreateProgram(school) {
    return this.canDoInSchool(school, 'CAN_CREATE_PROGRAMS');
  },
  async canUpdateProgramYear(programYear) {
    const currentUser = await this.get('currentUser');
    const permissionMatrix = this.get('permissionMatrix');

    const program = await programYear.get('program');
    const school = await program.get('school');
    if (await this.canDoInSchool(school, 'CAN_UPDATE_ALL_PROGRAM_YEARS')) {
      return true;
    }
    const rolesInProgramYear = await currentUser.getRolesInProgramYear(programYear);
    if (await permissionMatrix.hasPermission(school, 'CAN_UPDATE_THEIR_PROGRAM_YEARS', rolesInProgramYear)) {
      return true;
    }

    return this.canUpdateProgram(program);
  },
  async canDeleteProgramYear(programYear) {
    const currentUser = await this.get('currentUser');
    const permissionMatrix = this.get('permissionMatrix');

    const program = await programYear.get('program');
    const school = await program.get('school');
    if (await this.canDoInSchool(school, 'CAN_DELETE_ALL_PROGRAM_YEARS')) {
      return true;
    }
    const rolesInProgramYear = await currentUser.getRolesInProgramYear(programYear);
    if (await permissionMatrix.hasPermission(school, 'CAN_DELETE_THEIR_PROGRAM_YEARS', rolesInProgramYear)) {
      return true;
    }

    return this.canUpdateProgram(program);
  },
  async canCreateProgramYear(program) {
    const school = await program.get('school');
    if (await this.canDoInSchool(school, 'CAN_CREATE_PROGRAM_YEARS')) {
      return true;
    }
    return this.canUpdateProgram(program);
  },
  async canUnlockProgramYear(programYear) {
    const currentUser = await this.get('currentUser');
    const permissionMatrix = this.get('permissionMatrix');
    const program = await programYear.get('program');
    const school = await program.get('school');
    if (await this.canDoInSchool(school, 'CAN_UNLOCK_ALL_PROGRAM_YEARS')) {
      return true;
    }
    const rolesInProgramYear = await currentUser.getRolesInProgramYear(programYear);
    if (await permissionMatrix.hasPermission(school, 'CAN_UNLOCK_THEIR_PROGRAM_YEARS', rolesInProgramYear)) {
      return true;
    }

    return this.canUpdateProgram(program);
  },
  async canUpdateSchoolConfig(school) {
    return this.canDoInSchool(school, 'CAN_UPDATE_SCHOOL_CONFIGS');
  },
  async canUpdateSchool(school) {
    return this.canDoInSchool(school, 'CAN_UPDATE_SCHOOLS');
  },
  async canUpdateCompetency(competency) {
    const school = await competency.get('school');
    return this.canDoInSchool(school, 'CAN_UPDATE_COMPETENCIES');
  },
  async canDeleteCompetency(competency) {
    const school = await competency.get('school');
    return this.canDoInSchool(school, 'CAN_DELETE_COMPETENCIES');
  },
  async canCreateCompetency(school) {
    return this.canDoInSchool(school, 'CAN_CREATE_COMPETENCIES');
  },
  async canUpdateVocabulary(vocabulary) {
    const school = await vocabulary.get('school');
    return this.canDoInSchool(school, 'CAN_UPDATE_VOCABULARIES');
  },
  async canDeleteVocabulary(vocabulary) {
    const school = await vocabulary.get('school');
    return this.canDoInSchool(school, 'CAN_DELETE_VOCABULARIES');
  },
  async canCreateVocabulary(school) {
    return this.canDoInSchool(school, 'CAN_CREATE_VOCABULARIES');
  },
  async canUpdateTerm(term) {
    const school = await term.get('school');
    return this.canDoInSchool(school, 'CAN_UPDATE_TERMS');
  },
  async canDeleteTerm(term) {
    const school = await term.get('school');
    return this.canDoInSchool(school, 'CAN_DELETE_TERMS');
  },
  async canCreateTerm(school) {
    return this.canDoInSchool(school, 'CAN_CREATE_TERMS');
  },
  async canUpdateInstructorGroup(instructorGroup) {
    const school = await instructorGroup.get('school');
    return this.canDoInSchool(school, 'CAN_UPDATE_INSTRUCTOR_GROUPS');
  },
  async canDeleteInstructorGroup(instructorGroup) {
    const school = await instructorGroup.get('school');
    return this.canDoInSchool(school, 'CAN_DELETE_INSTRUCTOR_GROUPS');
  },
  async canCreateInstructorGroup(school) {
    return this.canDoInSchool(school, 'CAN_CREATE_INSTRUCTOR_GROUPS');
  },
  async canUpdateInstructorGroupInSchool(school) {
    return this.canDoInSchool(school, 'CAN_UPDATE_INSTRUCTOR_GROUPS');
  },
  async canDeleteInstructorGroupInSchool(school) {
    return this.canDoInSchool(school, 'CAN_DELETE_INSTRUCTOR_GROUPS');
  },
  async canUpdateCurriculumInventoryReport(curriculumInventoryReport) {
    const currentUser = await this.get('currentUser');
    const permissionMatrix = this.get('permissionMatrix');
    const program = await curriculumInventoryReport.get('program');
    const school = await program.get('school');
    if (await this.canDoInSchool(school, 'CAN_UPDATE_ALL_CURRICULUM_INVENTORY_REPORTS')) {
      return true;
    }
    const rolesInReport = await currentUser.getRolesInCurriculumInventoryReport(curriculumInventoryReport);

    return permissionMatrix.hasPermission(school, 'CAN_UPDATE_THEIR_CURRICULUM_INVENTORY_REPORTS', rolesInReport);
  },
  async canDeleteCurriculumInventoryReport(curriculumInventoryReport) {
    const currentUser = await this.get('currentUser');
    const permissionMatrix = this.get('permissionMatrix');
    const program = await curriculumInventoryReport.get('program');
    const school = await program.get('school');
    if (await this.canDoInSchool(school, 'CAN_DELETE_ALL_CURRICULUM_INVENTORY_REPORTS')) {
      return true;
    }

    const rolesInReport = await currentUser.getRolesInCurriculumInventoryReport(curriculumInventoryReport);
    return permissionMatrix.hasPermission(school, 'CAN_DELETE_THEIR_CURRICULUM_INVENTORY_REPORTS', rolesInReport);
  },
  async canCreateCurriculumInventoryReport(school) {
    return this.canDoInSchool(school, 'CAN_CREATE_CURRICULUM_INVENTORY_REPORTS');
  },
  async canUpdateLearnerGroup(learnerGroup) {
    const school = await learnerGroup.get('school');
    return this.canDoInSchool(school, 'CAN_UPDATE_LEARNER_GROUPS');
  },
  async canDeleteLearnerGroup(learnerGroup) {
    const school = await learnerGroup.get('school');
    return this.canDoInSchool(school, 'CAN_DELETE_LEARNER_GROUPS');
  },
  async canUpdateLearnerGroupInSchool(school) {
    return this.canDoInSchool(school, 'CAN_UPDATE_LEARNER_GROUPS');
  },
  async canDeleteLearnerGroupInSchool(school) {
    return this.canDoInSchool(school, 'CAN_DELETE_LEARNER_GROUPS');
  },
  async canCreateLearnerGroup(school) {
    return this.canDoInSchool(school, 'CAN_CREATE_LEARNER_GROUPS');
  },
  async canUpdateUser(user) {
    const school = await user.get('school');
    return this.canDoInSchool(school, 'CAN_UPDATE_USERS');
  },
  async canDeleteUser(user) {
    const school = await user.get('school');
    return this.canDoInSchool(school, 'CAN_DELETE_USERS');
  },
  async canCreateUser(school) {
    return this.canDoInSchool(school, 'CAN_CREATE_USERS');
  },
  async canUpdateUserInSchool(school) {
    return this.canDoInSchool(school, 'CAN_UPDATE_USERS');
  },
});
