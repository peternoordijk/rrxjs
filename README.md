# Reactive React Extensions for JavaScript

[![Build Status](https://travis-ci.org/peternoordijk/rrxjs.svg?branch=master)](https://travis-ci.org/peternoordijk/rrxjs) [![Coverage Status](https://coveralls.io/repos/github/peternoordijk/rrxjs/badge.svg?branch=master)](https://coveralls.io/github/peternoordijk/rrxjs?branch=master)

This library provides a simple wrapper to use RxJS in your React applications. It maps observables to their current values. It manages all necessary subscriptions automatically.

```sh
$ npm install rrxjs
```

If you don't use a package manager you can include this script:

```html
<script crossorigin src="https://unpkg.com/rrxjs@0.1/lib/index.umd.js"></script>
```

```html
<script crossorigin src="https://unpkg.com/rrxjs@0.1/lib/index.umd.min.js"></script>
```

## Usage

```js
import React from 'react';
import rrxjs from 'rrxjs';
import { Subject } from 'rxjs/Subject';

// 1. Define your component like any other
let MyComponent = (props) => (
  <span>{ props.myObservable }</span>
);

// 2. Wrap it in the rrxjs function
MyComponent = rrxjs(MyComponent);

// 3. Provide an observable as prop from the parent component. You must use the
// dollar sign in the prop name to indicate an observable

const MyParentComponent = () => (
  <div>
    <MyComponent myObservable$={new Subject()} />
  </div>
);
```

For more examples check out the [unit tests](src/main.spec.jsx).
