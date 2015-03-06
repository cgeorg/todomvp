import Cycle from 'cyclejs';

import Model from './model';
import View from './view';
import Intent from './intent';

var User = Cycle.createDOMUser(document.body);

User.inject(View).inject(Model).inject(Intent).inject(User);