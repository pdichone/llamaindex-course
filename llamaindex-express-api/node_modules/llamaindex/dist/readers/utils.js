// Note: this code is taken from p-limit 5.0.0 and modified to work with non NodeJS envs by removing AsyncResource which seems not be needed in our case and also it's not recommended to used anymore. If we need to preserve some state between async calls better use `AsyncLocalStorage`.
// Also removed dependency to yocto-queue by using normal Array
export default function pLimit(concurrency) {
    if (!((Number.isInteger(concurrency) || concurrency === Number.POSITIVE_INFINITY) && concurrency > 0)) {
        throw new TypeError("Expected `concurrency` to be a number from 1 and up");
    }
    const queue = new Array();
    let activeCount = 0;
    const next = ()=>{
        activeCount--;
        if (queue.length > 0) {
            queue.shift()();
        }
    };
    const run = async (function_, resolve, arguments_)=>{
        activeCount++;
        const result = (async ()=>function_(...arguments_))();
        resolve(result);
        try {
            await result;
        } catch  {}
        next();
    };
    const enqueue = (function_, resolve, arguments_)=>{
        queue.push(run.bind(undefined, function_, resolve, arguments_));
        (async ()=>{
            // This function needs to wait until the next microtask before comparing
            // `activeCount` to `concurrency`, because `activeCount` is updated asynchronously
            // when the run function is dequeued and called. The comparison in the if-statement
            // needs to happen asynchronously as well to get an up-to-date value for `activeCount`.
            await Promise.resolve();
            if (activeCount < concurrency && queue.length > 0) {
                queue.shift()();
            }
        })();
    };
    const generator = (function_, ...arguments_)=>new Promise((resolve)=>{
            enqueue(function_, resolve, arguments_);
        });
    Object.defineProperties(generator, {
        activeCount: {
            get: ()=>activeCount
        },
        pendingCount: {
            get: ()=>queue.length
        },
        clearQueue: {
            value () {
                queue.length = 0;
            }
        }
    });
    return generator;
}
