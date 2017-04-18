import fetch from 'isomorphic-fetch';

export default class AuthFetch {
  constructor(dispatch) {
    this.apiPrefix = '/api';
    this.cookies = {};
    this.dispatch = dispatch;
  }

  setApiPrefix(apiPrefix) {
    this.apiPrefix = apiPrefix;
  }

  setCookie(key, value) {
    this.cookies[key] = value;
  }

  getCookies(key, value) {
    return Object.keys(this.cookies).map(k => {
      return `${k}=${this.cookies[k]}`;
    }).join('; ');
  }

  request(endpoint, options) {
    options = options || {};
    options.credentials = 'include';
    options.headers = options.headers || {};

    options.headers.cookie = this.getCookies();

    return fetch(`${this.apiPrefix}${endpoint}`, options)
      .then(response => {
        const headers = response.headers._headers;
        const setCookieHeaders = headers && headers['set-cookie'];
        if (setCookieHeaders) {
          setCookieHeaders.forEach(h => {
            const [key, value] = h.split('=');
            this.setCookie(key, value);
          });
        }

        if (response.status === 401) {
          this.dispatch({ type: 'UNAUTHORIZED' });
        }

        if (response.status / 100 >> 0 !== 2) {
          throw new Error(`Request failed with status: ${response.status}.`);
        }

        const contentType = response.headers.get('content-type');

        return (contentType && contentType.indexOf('application/json') !== -1)
          ? response.json()
          : response.text();
      });
  }

  del(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  get(endpoint) {
    return this.request(endpoint);
  }

  post(endpoint, json) {
    return this.request(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: json && JSON.stringify(json)
    });
  }

  put(endpoint, json) {
    return this.request(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: json && JSON.stringify(json)
    });
  }
}
