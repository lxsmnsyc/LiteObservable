import LiteObservable from 'lite-observable';

LiteObservable.prototype.take = function(amount){
    return new LiteObservable((next, error, complete, closed) => {
        let cleanup;
        
        cleanup = this.subscribe(
            x => {
                if(closed()){
                    cleanup();
                } else {
                    if(amount-- > 0){
                        next(x);
                        if(amount == 0){
                            complete();
                            cleanup();
                        }
                    }
                }
            },
            error,
            complete
        );
    });
};