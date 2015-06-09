import {Rx} from 'cyclejs';

var socket = io.connect(window.location.origin);
var idSub = null;

function joinRoom(model) {
    if (model.gathering && model.gathering._id) {
        socket.emit('setRoom', model.gathering._id);
        socket.on('intent', function (event) {
            observers[event.event].onNext(event.data);
        });
        idSub.dispose();
        idSub = null;
    }
}

function replicate(intent, event) {
    intent[event].subscribe(data => {
        return !idSub && socket.emit('intent', {event, data});
    })
}

function createObservable(name) {
    var source = Rx.Observable.create(observer => {
        observers[name] = observer;
    });
    return source;
}

var observers = {},
    eaterAdd$ = createObservable('eaterAdd$'),
    eaterFinishEdit$ = createObservable('eaterFinishEdit$'),
    intents = {eaterAdd$, eaterFinishEdit$};

function WebSocketIntents() {
    return intents;
}

function WebSocketSinks(intent, model) {
    idSub = model.model$.subscribe(model => joinRoom(model));
    joinRoom({gathering: window && window.gathering});

    replicate(intent, 'eaterAdd$');
    replicate(intent, 'eaterFinishEdit$');
}

export {WebSocketSinks, WebSocketIntents}