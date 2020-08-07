import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: {
    isEditing: 'edit',
    isBulkAssigning: 'bulkupload',
    sortUsersBy: 'usersBy',
  },
  isEditing: false,
  isBulkAssigning: false,
  sortUsersBy: 'fullName',
  canCreate: false,
  canUpdate: false,
  canDelete: false,
});
