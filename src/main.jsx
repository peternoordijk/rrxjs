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
      // Check for new observables
      Object.keys(nextProps).forEach((prop) => {
        const observable = nextProps[prop];
        // Remove the old subscription if a new observable is provided
        if (this.subscriptions[prop]) {
          if (this.subscriptions[prop].observable === observable) {
            return;
          }
          this.subscriptions[prop].subscription.unsubscribe();
          // The old value must be deleted entirely, as the new value might
          // also not be an observable
          delete this.state[this.subscriptions[prop].label];
          delete this.subscriptions[prop];
        }
        // Now subscribe to the new observable
        if (observable instanceof Observable) {
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
