import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios/tests/pages/components/instructor-groups/list';
import Service from '@ember/service';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Integration | Component | instructor-groups/list', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const PermissionCheckerMock = class extends Service {
      async canDeleteInstructorGroup() {
        return true;
      }
    };
    this.owner.register('service:permissionChecker', PermissionCheckerMock);
  });

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    this.server.createList('instructor-group', 3, { school });
    const instructorGroupModels = await this.owner
      .lookup('service:store')
      .findAll('instructor-group');
    this.set('instructorGroups', instructorGroupModels);
    await render(hbs`<InstructorGroups::List @instructorGroups={{this.instructorGroups}} />`);

    assert.strictEqual(component.header.title.text, 'Instructor Group Title');
    assert.strictEqual(component.header.members.text, 'Members');
    assert.strictEqual(component.items.length, 3);
    assert.strictEqual(component.items[0].title, 'instructor group 0');
    assert.strictEqual(component.items[0].users, '0');
    assert.strictEqual(component.items[1].title, 'instructor group 1');
    assert.strictEqual(component.items[1].users, '0');
    assert.strictEqual(component.items[2].title, 'instructor group 2');
    assert.strictEqual(component.items[2].users, '0');
    await a11yAudit(this.element);
  });

  test('it renders empty', async function (assert) {
    await render(hbs`<InstructorGroups::List @programs={{(array)}} />`);

    assert.strictEqual(component.items.length, 0);
    assert.ok(component.isEmpty);
  });

  test('remove', async function (assert) {
    const school = this.server.create('school');
    this.server.createList('instructor-group', 3, { school });
    const instructorGroupModels = await this.owner
      .lookup('service:store')
      .findAll('instructor-group');
    this.set('instructorGroups', instructorGroupModels);
    await render(hbs`<InstructorGroups::List @instructorGroups={{this.instructorGroups}} />`);
    assert.strictEqual(this.server.db.instructorGroups.length, 3);
    assert.strictEqual(component.items.length, 3);
    assert.strictEqual(component.items[0].title, 'instructor group 0');
    await component.items[0].remove();
    await component.confirmRemoval.confirm();
    assert.strictEqual(this.server.db.instructorGroups.length, 2);
    assert.strictEqual(component.items.length, 2);
    assert.strictEqual(component.items[0].title, 'instructor group 1');
  });

  test('cancel remove', async function (assert) {
    const school = this.server.create('school');
    this.server.createList('instructor-group', 3, { school });
    const instructorGroupModels = await this.owner
      .lookup('service:store')
      .findAll('instructor-group');
    this.set('instructorGroups', instructorGroupModels);
    await render(hbs`<InstructorGroups::List @instructorGroups={{this.instructorGroups}} />`);
    assert.strictEqual(this.server.db.instructorGroups.length, 3);
    assert.strictEqual(component.items.length, 3);
    assert.strictEqual(component.items[0].title, 'instructor group 0');
    await component.items[0].remove();
    await component.confirmRemoval.cancel();
    assert.strictEqual(this.server.db.instructorGroups.length, 3);
    assert.strictEqual(component.items.length, 3);
    assert.strictEqual(component.items[0].title, 'instructor group 0');
  });

  test('sort', async function (assert) {
    const school = this.server.create('school');
    const users = this.server.createList('user', 5);
    this.server.create('instructor-group', { school, users: [users[0], users[1]] });
    this.server.create('instructor-group', { school });
    this.server.create('instructor-group', { school, users: [users[2], users[3], users[4]] });

    const instructorGroupModels = await this.owner
      .lookup('service:store')
      .findAll('instructor-group');
    this.set('instructorGroups', instructorGroupModels);
    await render(hbs`<InstructorGroups::List @instructorGroups={{this.instructorGroups}} />`);

    assert.strictEqual(component.items.length, 3);
    assert.ok(component.header.title.isSortedAscending);
    assert.ok(component.header.members.isNotSorted);
    assert.strictEqual(component.items[0].title, 'instructor group 0');
    assert.strictEqual(component.items[0].users, '2');
    assert.strictEqual(component.items[1].title, 'instructor group 1');
    assert.strictEqual(component.items[1].users, '0');
    assert.strictEqual(component.items[2].title, 'instructor group 2');
    assert.strictEqual(component.items[2].users, '3');

    await component.header.title.click();
    assert.ok(component.header.title.isSortedDescending);
    assert.ok(component.header.members.isNotSorted);
    assert.strictEqual(component.items[0].title, 'instructor group 2');
    assert.strictEqual(component.items[1].title, 'instructor group 1');
    assert.strictEqual(component.items[2].title, 'instructor group 0');

    await component.header.members.click();
    assert.ok(component.header.title.isNotSorted);
    assert.ok(component.header.members.isSortedAscending);
    assert.strictEqual(component.items[0].title, 'instructor group 1');
    assert.strictEqual(component.items[1].title, 'instructor group 0');
    assert.strictEqual(component.items[2].title, 'instructor group 2');

    await component.header.members.click();
    assert.ok(component.header.title.isNotSorted);
    assert.ok(component.header.members.isSortedDescending);
    assert.strictEqual(component.items[0].title, 'instructor group 2');
    assert.strictEqual(component.items[1].title, 'instructor group 0');
    assert.strictEqual(component.items[2].title, 'instructor group 1');
  });
});
