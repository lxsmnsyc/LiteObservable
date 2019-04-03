var Observable = (function () {
  'use strict';

  /* eslint-disable no-restricted-syntax */
  /**
   *
   *  Lite (Cold) Observables
   *
   *  MIT License
   *  Copyright (c) 2019 Alexis Munsayac
   *  Permission is hereby granted, free of charge, to any person obtaining a copy
   *  of this software and associated documentation files (the "Software"), to deal
   *  in the Software without restriction, including without limitation the rights
   *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   *  copies of the Software, and to permit persons to whom the Software is
   *  furnished to do so, subject to the following conditions:
   *  The above copyright notice and this permission notice shall be included in all
   *  copies or substantial portions of the Software.
   *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   *  SOFTWARE.
   *
   */
  const isFunction = x => typeof x === 'function';
  /**
   *
   */
  class Observable {
    /**
     * Creates an Observable with a subscriber function.
     *
     * This subscriber function receives an Observer object
     * in which is used to execute the actual subscription
     * logic.
     *
     * The purpose of this is to not repeatedly create
     * the subscription object.
     * @param {function(x: Observer)} subscriber
     * @returns {Observable}
     */
    constructor(subscriber) {
      this.sub = subscriber;
    }

    /**
     * Provides an API (via a cold Observable) that bridges
     * the reactive world with the callback-style world.
     * @param {function(x: Observer)} onSubscribe
     * @returns {Observable}
     */
    static create(onSubscribe) {
      return new Observable((observer) => {
        let state = true;
        const subscription = {
          active: () => state,
          dispose() {
            state = false;
          },
        };
        const {
          subscribe, next, error, complete,
        } = observer;

        subscribe(subscription);

        try {
          onSubscribe({
            next(x) {
              if (isFunction(next) && state) next(x);
            },
            error(x) {
              if (state) {
                if (isFunction(error)) error(x);
                state = false;
              } else {
                throw x;
              }
            },
            complete() {
              if (state) {
                if (isFunction(complete)) complete();
                state = false;
              }
            },
            subscription,
          });
        } catch (err) {
          error(err);
          subscription.dispose();
        }
      });
    }

    /**
     * Allow building operator pipelines for Observables.
     * @param  {...function(x: Observable):Observable} curry
     * @returns {Observable}
     */
    pipe(...curry) {
      let result = this;
      for (const c of curry) {
        if (isFunction(c)) result = c(result);
      }
      return result;
    }

    /**
     * Subscribes to an Observable
     * @param {Function} subscribe - Receives the subscription
     * @param {Function} next - Receives the emissions
     * @param {Function} error - Receives the error emission
     * @param {Function} complete - Receives the completion emission
     *
     * @return {Object} - Subscription object
     */
    subscribe(next, error, complete) {
      let state = true;
      const subscription = {
        active: () => state,
        dispose() {
          state = false;
        },
      };

      this.sub({
        subscribe(ac) {
          subscription.active = () => ac.active();
          subscription.dispose = ac.dispose;
        },
        next,
        error,
        complete,
      });

      return subscription;
    }
  }

  return Observable;

}());
