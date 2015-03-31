import Cycle from 'cyclejs';

import Model from './model';
import View from './view';
import Intent from './intent';
import InitialModel from './initial';
import WebSocketNode from './webSocketSink';

var User = Cycle.createDOMUser(document.body);

User.inject(View);
View.inject(Model);
Model.inject(Intent, InitialModel, WebSocketNode);
Intent.inject(User);
WebSocketNode.inject(Intent, Model);