/* eslint-disable react/no-multi-comp */
import React from 'react';
import { mount } from 'enzyme';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import rrxjs from './main';

describe('rrxjs', () => {
  it('wraps another component', () => {
    const Wrapped = rrxjs(() => <span>Hello</span>);
    const subject$ = new Subject();
    const wrapper = mount(<Wrapped subject$={subject$} />);
    expect(wrapper.text()).toBe('Hello');
  });

  it('subscribes on the given observable when mounting', () => {
    const Wrapped = rrxjs(() => <span>Hello</span>);
    const subject$ = new Subject();
    const spy = jest.spyOn(subject$, 'subscribe');
    mount(<Wrapped subject$={subject$} />);
    expect(spy).toHaveBeenCalled();
  });

  it('passes the value of a subject to the props of the wrapped component', () => {
    const Wrapped = rrxjs(({ subject }) => <span>{ subject || 'null' }</span>);
    const subject$ = new Subject();
    const wrapper = mount(<Wrapped subject$={subject$} />);
    expect(wrapper.text()).toBe('null');
    subject$.next('Hello');
    expect(wrapper.text()).toBe('Hello');
    subject$.next('There');
    expect(wrapper.text()).toBe('There');
  });

  it('passes the value of a BehaviorSubject on initial state', () => {
    const Wrapped = rrxjs(({ subject }) => <span>{ subject || 'null' }</span>);
    const subject$ = new BehaviorSubject('Meh');
    const wrapper = mount(<Wrapped subject$={subject$} />);
    expect(wrapper.text()).toBe('Meh');
  });

  it('unsubscribes when unmounting', () => {
    const Wrapped = rrxjs(({ subject }) => <span>{ subject || 'null' }</span>);
    const subject$ = new Subject();
    const wrapper = mount(<Wrapped subject$={subject$} />);
    const spy = jest.spyOn(wrapper.instance().subscriptions.subject$.subscription, 'unsubscribe');
    wrapper.unmount();
    expect(subject$.observers.length).toBe(0);
    expect(spy).toHaveBeenCalled();
  });

  it('passes props to the wrapped component', () => {
    const Wrapped = rrxjs(({ subject, multiply, minus }) =>
      <span>{ (subject * multiply) - minus }</span>);
    const subject$ = new Subject();
    const multiply$ = new Subject();
    const wrapper = mount(<Wrapped minus={3} subject$={subject$} multiply$={multiply$} />);
    subject$.next(4);
    multiply$.next(5);
    expect(wrapper.text()).toBe('17');
  });

  it('accepts observables without the $ convention', () => {
    const Wrapped = rrxjs(({ subject }) => <span>{ subject || 'null' }</span>);
    const subject$ = new BehaviorSubject('Meh');
    const wrapper = mount(<Wrapped subject={subject$} />);
    expect(wrapper.text()).toBe('Meh');
  });

  it('removes subscriptions when props change', () => {
    const Wrapped = rrxjs(({ a, b }) =>
      <span>{ a || b }</span>);

    class Container extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          a$: new BehaviorSubject(123),
          b$: new BehaviorSubject(456),
        };
      }

      render() {
        const { a$, b$ } = this.state;
        return (
          <Wrapped a$={a$} b$={b$} />
        );
      }
    }

    const wrapper = mount(<Container />);
    expect(wrapper.text()).toBe('123');

    const instance = wrapper.instance();
    instance.state.a$.next(789);
    expect(wrapper.text()).toBe('789');

    const observable$ = instance.state.a$;
    instance.setState({
      a$: null,
    });
    expect(wrapper.text()).toBe('456');
    expect(observable$.observers.length).toBe(0);
  });

  it('can switch one observable to the other', () => {
    const a$ = new BehaviorSubject('aaa');
    const b$ = new BehaviorSubject('bbb');

    const Wrapped = rrxjs(({ a }) =>
      <span>{ a }</span>);

    class Container extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          a$,
        };
      }

      render() {
        return (
          <Wrapped a$={this.state.a$} />
        );
      }
    }

    const wrapper = mount(<Container />);
    expect(wrapper.text()).toBe('aaa');
    expect(a$.observers.length).toBe(1);
    expect(b$.observers.length).toBe(0);

    wrapper.instance().setState({
      a$: b$,
    });
    expect(wrapper.text()).toBe('bbb');
    expect(a$.observers.length).toBe(0);
    expect(b$.observers.length).toBe(1);
  });

  it('can switch a prop from observable to a normal value', () => {
    const a$ = new BehaviorSubject('aaa');
    const b = 'bbb';

    const Wrapped = rrxjs(({ subject }) =>
      <span>{ subject }</span>);

    class Container extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          subject: a$,
        };
      }

      render() {
        return (
          <Wrapped subject={this.state.subject} />
        );
      }
    }

    const wrapper = mount(<Container />);
    expect(wrapper.text()).toBe('aaa');
    expect(a$.observers.length).toBe(1);

    wrapper.instance().setState({
      subject: b,
    });
    expect(wrapper.text()).toBe('bbb');
    expect(a$.observers.length).toBe(0);
  });

  it('removes subscriptions when the props have been dynamically set', () => {
    const a$ = new BehaviorSubject('aaa');
    const b$ = new BehaviorSubject('bbb');

    const Wrapped = rrxjs(({ a, b }) =>
      <span>{ a || b }</span>);

    class Container extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          a$, b$,
        };
      }

      render() {
        const props = Object.keys(this.state).reduce((acc, key) => {
          if (this.state[key]) {
            acc[key] = this.state[key];
          }
          return acc;
        }, {});

        return (
          <Wrapped {...props} />
        );
      }
    }

    const wrapper = mount(<Container />);
    expect(wrapper.text()).toBe('aaa');
    expect(a$.observers.length).toBe(1);
    expect(b$.observers.length).toBe(1);

    wrapper.instance().setState({
      a$: null,
    });
    expect(wrapper.text()).toBe('bbb');
    expect(a$.observers.length).toBe(0);
    expect(b$.observers.length).toBe(1);
  });
});
