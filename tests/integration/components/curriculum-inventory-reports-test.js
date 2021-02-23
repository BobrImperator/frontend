import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import Service from '@ember/service';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios/tests/pages/components/curriculum-inventory-reports';

module('Integration | Component | curriculum-inventory-reports', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    const school1 = this.server.create('school');
    const school2 = this.server.create('school');
    const school3 = this.server.create('school');
    const program1 = this.server.create('program', { school: school1 });
    const program2 = this.server.create('program', { school: school1 });
    const program3 = this.server.create('program', { school: school2 });
    const user = this.server.create('user', { school: school1, administeredSchools: [ school1 ] });
    this.schoolWithMultiplePrograms = await this.owner.lookup('service:store').find('school', school1.id);
    this.schoolWithOneProgram = await this.owner.lookup('service:store').find('school', school2.id);
    this.schoolWithoutPrograms = await this.owner.lookup('service:store').find('school', school3.id);
    this.schools = [ this.schoolWithMultiplePrograms, this.schoolWithOneProgram, this.schoolWithoutPrograms ];
    this.program1 = await this.owner.lookup('service:store').find('program', program1.id);
    this.program2 = await this.owner.lookup('service:store').find('program', program2.id);
    this.program3 = await this.owner.lookup('service:store').find('program', program3.id);
    this.user = await this.owner.lookup('service:store').find('user', user.id);
    const currentUserMock = Service.extend({
      model: this.user
    });
    this.owner.register('service:currentUser', currentUserMock);
    const permissionCheckerMock = Service.extend({
      async canCreateCurriculumInventoryReport() {
        return true;
      }
    });
    this.owner.register('service:permissionChecker', permissionCheckerMock);
  });

  test('it renders', async function(assert) {
    await render(hbs`<CurriculumInventoryReports
      @editCurriculumInventoryReport={{noop}}
      @schools={{this.schools}}
      @sortReportsBy="name"
      @setSortBy={{noop}}
      @setSchoolId={{noop}}
      @setProgramId={{noop}}
    />`);
    assert.notOk(component.newReport.isVisible);
    assert.ok(component.reports.isVisible);
    assert.equal(component.schools.options.length, 3);
    assert.equal(component.programs.options.length, 2);
  });

  test('selected school with multiple programs', async function(assert) {
    await render(hbs`<CurriculumInventoryReports
      @editCurriculumInventoryReport={{noop}}
      @schools={{this.schools}}
      @schoolId={{this.schoolWithMultiplePrograms.id}}
      @programId={{this.program1.id}}
      @sortReportsBy="name"
      @setSortBy={{noop}}
      @setSchoolId={{noop}}
      @setProgramId={{noop}}
    />`);
    assert.equal(component.schools.options.length, 3);
    assert.ok(component.schools.options[0].isSelected);
    assert.equal(component.programs.options.length, 2);
    assert.ok(component.programs.options[0].isSelected);
  });

  test('selected school with one program', async function(assert) {
    await render(hbs`<CurriculumInventoryReports
      @editCurriculumInventoryReport={{noop}}
      @schools={{this.schools}}
      @schoolId={{this.schoolWithOneProgram.id}}
      @programId={{this.program3.id}}
      @sortReportsBy="name"
      @setSortBy={{noop}}
      @setSchoolId={{noop}}
      @setProgramId={{noop}}
    />`);
    assert.equal(component.schools.options.length, 3);
    assert.ok(component.schools.options[1].isSelected);
    assert.equal(component.programs.options.length, 1);
    assert.ok(component.programs.options[0].isSelected);
  });

  test('selected school without programs', async function(assert) {
    await render(hbs`<CurriculumInventoryReports
      @editCurriculumInventoryReport={{noop}}
      @schools={{this.schools}}
      @schoolId={{this.schoolWithoutPrograms.id}}
      @sortReportsBy="name"
      @setSortBy={{noop}}
      @setSchoolId={{noop}}
      @setProgramId={{noop}}
    />`);
    assert.equal(component.schools.options.length, 3);
    assert.ok(component.schools.options[2].isSelected);
    assert.equal(component.programs.options.length, 0);
    assert.equal(component.programs.text, 'None');
  });

  test('changing school', async function(assert) {
    assert.expect(1);
    this.set('setSchoolId', (id) => {
      assert.equal(id, this.schoolWithOneProgram.id);
    });
    await render(hbs`<CurriculumInventoryReports
      @editCurriculumInventoryReport={{noop}}
      @schools={{this.schools}}
      @sortReportsBy="name"
      @setSortBy={{noop}}
      @setSchoolId={{this.setSchoolId}}
      @setProgramId={{noop}}
    />`);
    await component.schools.select(this.schoolWithOneProgram.id);
  });

  test('changing program', async function(assert) {
    assert.expect(1);
    this.set('setProgramId', (programId) => {
      assert.equal(programId, this.program2.id);
    });
    await render(hbs`<CurriculumInventoryReports
      @editCurriculumInventoryReport={{noop}}
      @schools={{this.schools}}
      @sortReportsBy="name"
      @setSortBy={{noop}}
      @setSchoolId={{noop}}
      @setProgramId={{this.setProgramId}}
    />`);
    await component.programs.select(this.program2.id);
  });

  test('click expand button to show new report form', async function(assert){
    await render(hbs`<CurriculumInventoryReports
      @editCurriculumInventoryReport={{noop}}
      @schools={{this.schools}}
      @sortReportsBy="name"
      @setSortBy={{noop}}
      @setSchoolId={{noop}}
      @setProgramId={{noop}}
    />`);
    assert.notOk(component.newReport.isVisible);
    await component.toggleNewReportForm();
    assert.ok(component.newReport.isVisible);
  });
});
