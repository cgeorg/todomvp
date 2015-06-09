import Cycle from 'cyclejs';

import Model from './model';
import View from './view';
import Intent from './intent';
import InitialModel from './initial';
import {WebSocketSinks, WebSocketIntents} from './webSockets';

var computer = function (interactions) {
    const intent = Intent(interactions);
    const model = Model(intent, InitialModel(), WebSocketIntents());
    WebSocketSinks(intent, model);
    return View(model);
};

Cycle.applyToDOM(document.body, computer);