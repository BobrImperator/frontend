/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import FileField from 'ember-uploader/components/file-field';
import Uploader from 'ember-uploader/uploaders/uploader';

import readableFileSize from 'ilios/utils/readable-file-size';
import { task, timeout } from 'ember-concurrency';

const MAXIMUM_UPLOAD_ATTEMPTS = 3;

let IliosUploader = Uploader.extend({
  iliosHeaders: null,
  ajaxSettings: computed('iliosHeaders.[]', function() {
    return {
      headers: this.get('iliosHeaders')
    };
  }),

});

export default FileField.extend({
  session: service(),
  iliosConfig: service(),
  intl: service(),
  url: '',

  headers: computed('session.isAuthenticated', function () {
    const session = this.get('session');
    const { jwt } = session.data.authenticated;
    let headers = {};
    if (jwt) {
      headers['X-JWT-Authorization'] = `Token ${jwt}`;
    }

    return headers;
  }),

  filesDidChange(files) {
    if (isEmpty(files)) {
      return;
    }
    const file = files[0];
    const iliosConfig = this.get('iliosConfig');
    iliosConfig.get('maxUploadSize').then(maxUploadSize => {
      if (file.size > maxUploadSize) {
        const intl = this.get('intl');
        const maxSize = readableFileSize(maxUploadSize);
        this.get('setErrorMessage')(intl.t('general.fileSizeError', {maxSize}));
      } else {
        this.get('startUploading')();
        const uploadUrl = this.get('url');
        const uploader = IliosUploader.create({
          url: uploadUrl,
          iliosHeaders: this.get('headers')
        });


        uploader.on('didUpload', (e) => {
          this.get('finishedUploading')(e);
        });

        uploader.on('progress', (e) => {
          this.get('setUploadPercentage')(e.percent);
        });

        return this.get('upload').perform(uploader, file, 0);
      }

    });

  },

  upload: task(function * (uploader, file, attempt) {
    try {
      let data = yield uploader.upload(file);
      return data;
    } catch (error) {
      this.get('setUploadPercentage')(0);
      yield timeout(attempt * 1000);
      if (attempt < MAXIMUM_UPLOAD_ATTEMPTS) {
        this.get('upload').perform(uploader, file, attempt+1);
      } else {
        const intl = this.get('intl');
        throw new Error(intl.t('general.fileUploadError'));
      }
    }
  }).restartable()
});
