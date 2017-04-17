import React, { PureComponent } from 'react';

export function createWrappedComponent(authFetch) {
  class Wrapped extends PureComponent {
    static childContextTypes = { authFetch: React.PropTypes.object };

    getChildContext() {
      return { authFetch };
    }

    render() {
      return this.props.children;
    }
  }

  return Wrapped;
}
