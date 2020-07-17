/**
 * @license
 * MIT License
 *
 * Copyright (c) 2020 Alexis Munsayac
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 *
 * @author Alexis Munsayac <alexis.munsayac@gmail.com>
 * @copyright Alexis Munsayac 2020
 */
export type OnNext<T> = (value: T) => void;
export type OnError = (value: Error) => void;
export type OnComplete = () => void;

export interface Subscription {
  // Cancels the subscription
  dispose() : void;

  // A boolean value indicating whether the subscription is closed
  active(): boolean;
}

export interface BaseObserver<T> {
  // Receives the next value in the sequence
  next: OnNext<T>;

  // Receives the sequence error
  error: OnError;

  // Receives a completion notification
  complete: OnComplete;
}

export interface SubscriberObserver<T> extends BaseObserver<T> {
  readonly subscription: Subscription;
}

export interface Observer<T> extends BaseObserver<T> {
  // Receives the subscription object when `subscribe` is called
  subscribe(subscription : Subscription): void;
}

export type SubscriberFunction<T> =
  (observer: Observer<T>) => void | (() => void) | Subscription;

export type ObservableTransformer<T, R> =
  (observable: Observable<T>) => Observable<R>;

const DEFAULT_ERROR: OnError = (value) => {
  throw value;
};

const DEFAULT_COMPLETE: OnComplete = () => {
  // no action
};

export default class Observable<T> {
  private subscriber: SubscriberFunction<T>;

  /**
   * Creates an Observable with a subscriber function.
   *
   * This subscriber function receives an Observer object
   * in which is used to execute the actual subscription
   * logic.
   *
   * The purpose of this is to not repeatedly create
   * the subscription object.
   */
  constructor(subscriber: SubscriberFunction<T>) {
    this.subscriber = subscriber;
  }

  /**
   * Provides an API (via a cold Observable) that bridges
   * the reactive world with the callback-style world.
   */
  static create<T>(onSubscribe: (observer: SubscriberObserver<T>) => void): Observable<T> {
    return new Observable<T>((observer) => {
      let state = true;

      const subscription: Subscription = {
        active: () => state,
        dispose() {
          state = false;
        },
      };

      observer.subscribe(subscription);

      try {
        onSubscribe({
          next(x) {
            if (state) {
              observer.next(x);
            }
          },
          error(x) {
            if (state) {
              try {
                observer.error(x);
              } finally {
                state = false;
              }
            } else {
              throw x;
            }
          },
          complete() {
            if (state) {
              try {
                observer.complete();
              } finally {
                state = false;
              }
            }
          },
          subscription,
        });
      } catch (err) {
        try {
          observer.error(err);
        } finally {
          subscription.dispose();
          state = false;
        }
      }
    });
  }

  /**
   * Allow building operator pipelines for Observables.
   */
  pipe<A>(
    a: ObservableTransformer<T, A>,
  ): Observable<A>;

  pipe<A, B>(
    a: ObservableTransformer<T, A>,
    b: ObservableTransformer<A, B>,
  ): Observable<B>;

  pipe<A, B, C>(
    a: ObservableTransformer<T, A>,
    b: ObservableTransformer<A, B>,
    c: ObservableTransformer<B, C>,
  ): Observable<C>;

  pipe<A, B, C, D>(
    a: ObservableTransformer<T, A>,
    b: ObservableTransformer<A, B>,
    c: ObservableTransformer<B, C>,
    d: ObservableTransformer<C, D>,
  ): Observable<D>;

  pipe<A, B, C, D, E>(
    a: ObservableTransformer<T, A>,
    b: ObservableTransformer<A, B>,
    c: ObservableTransformer<B, C>,
    d: ObservableTransformer<C, D>,
    e: ObservableTransformer<D, E>,
  ): Observable<E>;

  pipe<A, B, C, D, E, F>(
    a: ObservableTransformer<T, A>,
    b: ObservableTransformer<A, B>,
    c: ObservableTransformer<B, C>,
    d: ObservableTransformer<C, D>,
    e: ObservableTransformer<D, E>,
    f: ObservableTransformer<E, F>,
  ): Observable<F>;

  pipe<A>(...curry: ObservableTransformer<any, any>[]): Observable<A> {
    return curry.reduce<Observable<any>>(
      (current, transform) => transform(current),
      this,
    ) as Observable<A>;
  }

  subscribe(
    next: OnNext<T>,
    error = DEFAULT_ERROR,
    complete = DEFAULT_COMPLETE,
  ): Subscription {
    let state = true;
    let internal: Subscription | undefined;

    const subscription: Subscription = {
      active: () => state,
      dispose() {
        if (state) {
          if (internal) {
            internal.dispose();
          }
          state = false;
        }
      },
    };

    this.subscriber({
      subscribe(ac) {
        if (internal) {
          ac.dispose();
        } else {
          internal = ac;
        }
      },
      next(value) {
        if (state) {
          next(value);
        }
      },
      error(value) {
        if (state) {
          try {
            error(value);
          } finally {
            state = false;
          }
        } else {
          throw value;
        }
      },
      complete() {
        if (state) {
          try {
            complete();
          } finally {
            state = false;
          }
        }
      },
    });

    return subscription;
  }
}
