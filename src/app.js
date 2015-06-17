import Cycle from 'cyclejs';

import Model from './model';
import View from './view';
import Intent from './intent';
import InitialModel from './initial';
import SocketIO from './wsDriver';
import WsIntent from './wsIntent';
import WsEffects from './wsEffects';

var computer = function (interactions) {
    const intent = Intent(interactions);
    const wsIntent = WsIntent(interactions);

    const model = Model(intent, InitialModel(), wsIntent);

    const wsEffects$ = WsEffects(intent, model);
    const vtree$ = View(model);

    return {dom: vtree$, socketIO: wsEffects$}
};

var socketIODriver = SocketIO.createSocketIODriver(window.location.origin);
var domDriver = Cycle.makeDOMDriver(document.body);
Cycle.run(computer, {
    dom: domDriver,
    socketIO: socketIODriver
});