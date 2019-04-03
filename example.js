const Observable = require('./index');

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
