import React from 'react';

const getDisplayName = WrappedComponent =>
  WrappedComponent.displayName ||
  WrappedComponent.name ||
  'Component';

export default (WrappedComponent) => {
  class ReactiveWrapper extends React.Component {
    constructor(props) {
      super(props);
      this.state = {};
      this.subscriptions = {};
    }

    componentWillMount() {
      this.checkSubscriptions(this.props);
    }

    componentWillReceiveProps(nextProps) {
      this.checkSubscriptions(nextProps);
    }

    componentWillUnmount() {
      Object.keys(this.subscriptions)
        .forEach(prop => this.subscriptions[prop].unsubscribe());
    }

    checkSubscriptions(nextProps) {
      // Subscribe to all new observables
      Object.keys(nextProps).forEach((prop) => {
        if (!this.subscriptions[prop] && nextProps[prop] && prop[prop.length - 1] === '$') {
          const label = prop.substr(0, prop.length - 1);
          this.state[label] = null;
          this.subscriptions[prop] =
            nextProps[prop].subscribe(value => this.receiveValue(label, value));
        }
      });
      // Remove old subscriptions
      Object.keys(this.subscriptions).forEach((prop) => {
        if (!nextProps[prop]) {
          this.subscriptions[prop].unsubscribe();
          delete this.subscriptions[prop];
          delete this.state[prop.substr(0, prop.length - 1)];
        }
      });
    }

    receiveValue(label, value) {
      this.setState({ [label]: value });
    }

    render() {
      return (
        <WrappedComponent
          {...this.props}
          {...this.state}
        />
      );
    }
  }

  ReactiveWrapper.displayName =
    `ReactiveWrapper(${getDisplayName(WrappedComponent)})`;

  return ReactiveWrapper;
};
