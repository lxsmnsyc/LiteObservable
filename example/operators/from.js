import LiteObservable from 'lite-observable';

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
};