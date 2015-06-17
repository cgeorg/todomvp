import {Rx} from 'cyclejs';

function createSocketIODriver(url) {

    const socket = io.connect(url);

    function join(room) {
        socket.emit('setRoom', room);
    }

    function get(eventName) {
        return Rx.Observable.create(observer => {
            const sub = socket.on(eventName, function (message) {
                observer.onNext(message);
            });
            return function dispose() {
                sub.dispose();
            };
        });
    }

    function publish(messageType, message) {
        socket.emit(messageType, message);
    }

    return function socketIODriver(events$) {
        events$.filter(event => event.type === 'join').map(event => event.room).forEach(join);
        events$.filter(event => event.type === 'emit').forEach(event => publish(event.messageType, event.message));
        return {
            get,
            dispose: socket.destroy.bind(socket)
        }
    };
}

export default {createSocketIODriver};