/**
 * Created by cmg on 6/8/2015.
 */
class PropertyHook {
    constructor(fn) {
        this.fn = fn;
    }

    hook() {
        this.fn.apply(this, arguments);
    }
}

export default function propHook(fn) {
    return new PropertyHook(fn);
}
