# LiteObservable
Cold Observables for JS in a lightweight(<1kb) fashion.

## Why?
Unlike the proposed Observable interface as written here:
https://github.com/tc39/proposal-observable
LiteObservable is implemented in more-or-less 60 lines, has a single class with two methods (constructor and subscribe) and the implementation is Promise-like: you use functions for both the Observer and the SubscriptionObserver, and the subscribe method returns a cleanup function rather than a class which does the same thing.

## Usage
Creating an Observable
```js
  let observable = new LiteObservable((next, error, complete, closed) => {
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
    next => console.log(next),
    error => console.error(error),
    () => console.log("completed")
  );
```

## Installing
```
npm i lite-observable
```

## Example
```js
var LiteObservable = require("lite-observable")

LiteObservable.from = iterable => {
    if(iterable instanceof LiteObservable){
        return new LiteObservable((next, error, complete, closed) => {
            let cleanup;

            cleanup = iterable.subscribe(
                x => {
                    if(closed()){
                        cleanup();
                    } else {
                        next(x);
                    }
                },
                error,
                complete
            );

            return cleanup;
        })
    } else if(typeof iterable[Symbol.iterator] === 'function'){
        return new LiteObservable((next, error, complete, closed) => {
            for(let values of iterable){
                next(values);

                if(closed()) return;
            }
            complete();
        });
    }
    return new LiteObservable((next, error, complete, closed) => {
        complete();
    });
};

LiteObservable.of = function(){
    return LiteObservable.from([...arguments])
};

LiteObservable.of(1, 2, 3, 4, 5).subscribe(console.log);
```