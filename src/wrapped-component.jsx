import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

export function createWrappedComponent(authFetch) {
  class Wrapped extends PureComponent {
    static childContextTypes = { authFetch: PropTypes.object };

    getChildContext() {
      return { authFetch };
    }

    render() {
      return this.props.children;
    }
  }

  return Wrapped;
}
