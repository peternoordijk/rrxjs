import React from 'react';
import PropTypes from 'prop-types'; // eslint-disable-line
import ReactDOM from 'react-dom'; // eslint-disable-line
import { Subject } from 'rxjs/Subject';
import rrxjs from '..';

let MyChildComponent = ({ subject }) => (
  <span>{subject}</span>
);

MyChildComponent.propTypes = {
  subject: PropTypes.string.isRequired,
};

MyChildComponent = rrxjs(MyChildComponent);

const mySubject$ = new Subject();

const MyParentComponent = () => (
  <MyChildComponent subject$={mySubject$} />
);

ReactDOM.render(<MyParentComponent />, document.getElementById('main'));
