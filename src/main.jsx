import React from 'react';
import { Observable } from 'rxjs/Observable';

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
        .forEach(prop => this.subscriptions[prop].subscription.unsubscribe());
    }

    checkSubscriptions(nextProps) {
      // Subscribe to all new observables
      Object.keys(nextProps).forEach((prop) => {
        const observable = nextProps[prop];
        if (observable instanceof Observable) {
          if (this.subscriptions[prop]) {
            if (this.subscriptions[prop].observable === observable) {
              return;
            }
            this.subscriptions[prop].subscription.unsubscribe();
          }
          const label = prop[prop.length - 1] === '$' ? prop.substr(0, prop.length - 1) : prop;
          this.state[label] = null;
          this.subscriptions[prop] = {
            observable,
            label,
            subscription: observable.subscribe(value => this.receiveValue(label, value)),
          };
        }
      });
      // Remove old subscriptions
      Object.keys(this.subscriptions).forEach((prop) => {
        if (!nextProps[prop]) {
          this.subscriptions[prop].subscription.unsubscribe();
          delete this.state[this.subscriptions[prop].label];
          delete this.subscriptions[prop];
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
