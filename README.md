# LiteObservable
Cold Observables for JS in a lightweight(<1kb) fashion.

## Why?
Unlike the proposed Observable interface as written here:
https://github.com/tc39/proposal-observable
LiteObservable is implemented in more-or-less 60 lines, has a single class with two methods (constructor and subscribe) and the implementation is Promise-like: you use functions for both the Observer and the SubscriptionObserver, and the subscribe method returns a cleanup function rather than a class which does the same thing.

## Usage
Creating an Observable
```js
  let observable = new Observable((next, error, complete, closed) => {
    // next: emits a value.
    // error: emits an error.
    // complete: completes the observable.
    // closed: returns the state of the observable.
    return () => {
      // cleanup function
    };
  });
```

Subscribing
```js
  let cleanup = observable.subscribe(
    x => console.log(x),
    e => console.error(e),
    () => console.log("completed")
  );
```
