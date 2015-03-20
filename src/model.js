import Cycle from 'cyclejs';
import _ from 'lodash';
import mvp from 'mvp';

function save(model, forceSave) {

  if (!model.gathering._id && !forceSave) {
    return;
  }

  var request = new XMLHttpRequest();
  if (model.gathering._id) {
    request.open('PUT', '/' + model.gathering._id, true);
  } else {
    request.open('POST', '/', true);
  }
  request.setRequestHeader('Content-type', 'application/json; charset=utf-8');
  request.setRequestHeader('Accept', 'application/json');

  request.onreadystatechange = function () {
    if (request.readyState === 4) {
      if (request.status >= 200 && request.status < 300) {
        var response = JSON.parse(request.responseText);
        window.history.pushState(null, document.title, '/' + response._id);
        sink.onNext(response);
      }
    }
  };
  request.send(JSON.stringify(model.gathering));
}

var sink, serverUpdated$ = Cycle.Rx.Observable.create(_sink => sink = _sink);

var Model = Cycle.createModel((Intent, Initial) => {

  var sortByMod$ = Intent.get('sortBy$')
    .map(sortBy => model => {
      model.sortBy = sortBy;
      return model;
    });

  var menuMod$ = Intent.get('selectMenu$')
    .map(name => model => {
      model.gathering.menu = (_.find(model.menus, {name: name}) || model.menus[0])._id;
      save(model);
      return model;
    });

  var eaterAdd$ = Intent.get('eaterAdd$')
    .map(data => model => {
      model.gathering.eaters.push({name: data.name, servings: Math.max(data.servings, 0)});
      save(model);
      return model;
    });

  var eaterStartEdit$ = Intent.get('eaterStartEdit$')
    .map(index => model => {
      model.gathering.eaters[index].editing = true;
      return model;
    });

  var eaterFinishEdit$ = Intent.get('eaterFinishEdit$')
    .map(data => model => {
      model.gathering.eaters[data.index].name = data.name;
      model.gathering.eaters[data.index].servings = Math.max(data.servings, 0);
      model.gathering.eaters[data.index].editing = false;
      save(model);
      return model;
    });

  var eaterCancelEdit$ = Intent.get('eaterCancelEdit$')
    .map(index => model => {
      model.gathering.eaters[index].editing = false;
      return model;
    });

  var saveGathering$ = Intent.get('saveGathering$')
    .map(data => model => {
      save(model, true);
      return model;
    });

  var serverUpdate$ = serverUpdated$
    .map(data => model => {
      model.gathering._id = data._id;
      return model;
    });

  var modifications$ = Rx.Observable.merge(
    sortByMod$, menuMod$, eaterAdd$, saveGathering$, serverUpdate$, eaterCancelEdit$, eaterFinishEdit$, eaterStartEdit$
  );

  return {
    model$: modifications$
              .merge(Initial.get('model$'))
              .scan(function (model, modFn) { return modFn(model); })
              .tap(model => model.numServings = _(model.gathering.eaters).map('servings').reduce((sum, num) => sum + num) || 0)
              .tap(model => model.purchaseOptions = mvp(model.gathering.eaters, _.find(model.menus, {_id: model.gathering.menu}).pizzas, model.gathering.servingSize, model.sortBy))
              //.combineLatest(route$, determineFilter)
              .share()
  }
});

export default Model;