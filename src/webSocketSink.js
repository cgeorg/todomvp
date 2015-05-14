import Cycle from 'cyclejs';

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

function replicate(Intent, event) {
  Intent.get(event).subscribe(data => {
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
    eaterAdd$        = createObservable('eaterAdd$'),
    eaterFinishEdit$ = createObservable('eaterFinishEdit$'),
    intents          = {eaterAdd$, eaterFinishEdit$};

var WebSocketNode = Cycle.createDataFlowNode((Intent, Model) => {
  idSub = Model.get('model$').subscribe(model => joinRoom(model));
  joinRoom({gathering: window && window.gathering});

  replicate(Intent, 'eaterAdd$');
  replicate(Intent, 'eaterFinishEdit$');

  return intents;
});

export default WebSocketNode;