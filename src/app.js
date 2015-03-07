import Cycle from 'cyclejs';

import Model from './model';
import View from './view';
import Intent from './intent';
import InitialModel from './initial';

var User = Cycle.createDOMUser(document.body);

User.inject(View);
View.inject(Model);
Model.inject(Intent, InitialModel);
Intent.inject(User);