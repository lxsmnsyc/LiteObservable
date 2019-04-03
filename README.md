# LiteObservable

Cold Observables for JS in just 617 bytes.

## Usage

### Installing

As a node module

```bash
npm i lite-observable
```

Or in browser:

```html
<!-- jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/lite-observable/dist/index.min.js"></script>
<!-- unpkg -->
<script src="https://unpkg.com/lite-observable/dist/index.min.js"></script>
```

### Creating an Observable

```js
const observable = Observable.create(emitter => {
  emitter.next('Hello');
  emitter.next('World');
  emitter.complete();
});
```

Emitters have the following properties:

| Field | Type | Description |
| --- | --- | --- |
| next | ```function``` | Emits a value. |
| error | ```function``` | Emits an error signal. |
| complete | ```function``` | Emits a completion signal. |
| subscription | ```object``` | The subscription context. |

### Subscribing

```js
observable.subscribe({
  next(x) {
    console.log(`Next: ${x}`);
  },
  error(e) {
    console.log(`Error: ${e}`);
  },
  complete(e) {
    console.log('Completed');
  }
});
```

Subscriptions have the following properties:

| Field | Type | Description |
| --- | --- | --- |
| active | ```function``` | Returns the current state of the subscription. Returns false if the subscription is disposed or finished. |
| dispose | ```function``` | Disposes the subscription. |

### Creating your own operators

With the ```pipe``` method, it is easy to create and use your own custom operators.

When constructing operators, it is recommended to use the constructor instead of ```create``` method to prevent subscription overhead, and to directly access the unabstracted Observer object.

Example below is a map and filter operators:

```js
const map = mapper => source => new Observable((o) => {
  const {
    subscribe, complete, error, next,
  } = o;
  source.sub({
    subscribe,
    next: x => next(mapper(x)),
    error,
    complete,
  });
});

const filter = predicate => source => new Observable((o) => {
  const {
    subscribe, complete, error, next,
  } = o;
  source.sub({
    subscribe,
    next: x => predicate(x) && next(x),
    error,
    complete,
  });
});
```

Example usage:

```js
const observable = Observable.create((e) => {
  for (let i = 0; i < 10; i += 1) {
    e.next(i);
  }
  e.complete();
});

observable.pipe(
  filter(x => x % 2 === 0),
  map(x => x * 2),
  map(x => `Next: ${x}`),
).subscribe(
  console.log,
);
```

which outputs:

```
Next: 0
Next: 4
Next: 8
Next: 12
Next: 16
```