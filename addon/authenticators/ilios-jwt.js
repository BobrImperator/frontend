import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import JwtTokenAuthenticator from 'ember-simple-auth-token/authenticators/jwt';

export default JwtTokenAuthenticator.extend({
  iliosConfig: service(),
  /**
    Extend the JwtTokenAuthenticator to accept a token in liu of credentials
    This allows authentication of an already existing session.
    @method authenticate
    @param {Object} credentials The credentials to authenticate the session with
    @param {Object} headers Request headers.
    @return {Promise} A promise that resolves when an auth token is
                                 successfully acquired from the server and rejects
                                 otherwise
  */
  async authenticate(credentials, headers) {
    if(this.tokenPropertyName in credentials){
      const token = get(credentials, this.tokenPropertyName);
      const tokenData = this.getTokenData(token);
      const expiresAt = get(tokenData, this.tokenExpireName);

      this.scheduleAccessTokenRefresh(expiresAt, token);

      const response  = {};
      response[this.tokenPropertyName] = token;
      response[this.tokenExpireName] = expiresAt;

      return response;
    }

    return this._super(credentials, headers);
  },

  /**
   * Extend the default make request in order use a custom
   * hostname instead of just '/'
   *
   * @method makeRequest
   * @param {string} url The URL to post to.
   * @param {Object} data The POST data.
   * @param {Object} headers Request headers.
   * @return {Promise} The result of the request.
  */
  makeRequest(url, data, headers) {
    const host = this.iliosConfig.apiHost ? this.iliosConfig.apiHost : '';
    return this._super(`${host}${url}`, data, headers);
  },
});
