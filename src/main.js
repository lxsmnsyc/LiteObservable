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

/**
 * 
 */
export default class LiteObservable{
    constructor(subscriber){
        this._subscriber = subscriber;
    }   
    

    /**
     * 
     * Subscribes to an Observable
     * 
     * @param {Function} next - Receives the emissions
     * @param {Function} error - Receives the error emission
     * @param {Function} complete - Receives the completion emission 
     * 
     * @return {Function} - Unsubscribes and cleanups the subscription
     */
    subscribe(next, error, complete){
        /**
         * 
         *  Tells whether to recognize the arguments.
         * 
         */
        const recognizeNext = typeof next === "function";
        const recognizeError = typeof error === "function";
        const recognizeComplete = typeof complete === "function";
        /**
         * 
         *  The state of the subscription
         * 
         */
        let closedState = false;
        let cleanup = _=>{};

        let subscriber = this._subscriber;

        if(typeof subscriber === "function"){
            /**
             * 
             *  Try executing the subscriber
             * 
             */
            try{
                let emptyCleanup = cleanup;
                /**
                 * 
                 *  Get the cleanup function returned by the subscriber.
                 * 
                 */
                cleanup = subscriber(
                    /**
                     * 
                     *  on next observer
                     * 
                     */
                    x => {
                        if(!closedState && recognizeNext){
                            next(x);
                        }
                    },
                    /**
                     * 
                     *  on error observer
                     * 
                     */
                    e => {
                        if(!closedState){
                            closedState = true;
                            if(recognizeError){
                                error(e);
                            }
                            cleanup();
                        }
                    },
                    /**
                     * 
                     *  on complete observer
                     * 
                     */
                    () => {
                        if(!closedState){
                            closedState = true;
                            if(recognizeComplete){
                                complete();
                            }
                            cleanup();
                        }
                    },
                    /**
                     * 
                     *  closed state
                     * 
                     */
                    () => closedState
                );

                cleanup = typeof cleanup === "function" ? cleanup : emptyCleanup;
            } catch(e){
                closedState = true;
                if(recognizeError){
                    error(e);
                }
            }
        }

        return () => {
            closedState = true;
            cleanup();
        }
    }
}