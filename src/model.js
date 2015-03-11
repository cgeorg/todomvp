import Cycle from 'cyclejs';
import _ from 'lodash';

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

function calculatePurchaseOptions(model) {
  var {servingSize, sortBy} = model.gathering,
      pizzas = _.sortBy(_.find(model.menus, {_id: model.gathering.menu}).pizzas, 'diameter').reverse(),
      numServings = _(model.gathering.eaters).map('servings').reduce((sum, num) => sum + num) || 0,
      totalSize = numServings * servingSize;

  function updateTotal(option) {
    option.total = _(option.pizzas)
      .map('diameter')
      .map(d => d / 2)
      .map(r => r * r)
      .map(r2 => r2 * Math.PI)
      .reduce((sum, area) => area + sum);
  }

  function addPizza(option, options, index) {
    index = index || 0;
    if (option.total > totalSize) {
      options.push(option);
    } else {
      for (let i = index; i < pizzas.length; ++i) {
        var newOp = {pizzas: _.clone(option.pizzas)};
        newOp.pizzas.push(pizzas[i]);
        updateTotal(newOp);
        addPizza(newOp, options, i);
      }
    }
    return options;
  }

  model.gathering.numServings = numServings;
  model.gathering.purchaseOptions = _(addPizza({pizzas: [], total: 0}, []))
    .tap(options => console.log(`Found ${options.length} options`))
    .forEach(option => {
      option.cost = _(option.pizzas)
        .map('cost')
        .reduce((sum, cost) => sum + cost);
      option.ratio = option.cost / option.total;
    })
    .sortBy('ratio')
    .forEach((option, index) => option.rank = index + 1)
    .sortBy('total')
    .forEach((option, index) => option.rank += index)
    .sortBy(sortBy)
    .take(10)
    .sortBy('total')
    .tap(options => options.length && (options[options.length - 1].mostPizza = true))
    .sortBy('ratio')
    .tap(options => options.length && (options[0].bestDeal = true))
    .sortBy(model.sortBy)
    .value();
}

var Model = Cycle.createModel((Intent, Initial) => {

  var sortByMod$ = Intent.get('sortBy$')
    .map(sortBy => model => {
      model.sortBy = sortBy;
      return model;
    });

  var menuMod$ = Intent.get('selectMenu$')
    .map(name => model => {
      model.gathering.selectedMenu = model.menus[name];
      save(model);
      return model;
    });

  var eaterMod$ = Intent.get('eaterUpdate$')
    .map(data => model => {
      model.gathering.eaters[data.id].servings = Math.max(data.servings, 0);
      save(model);
      return model;
    });

  var eaterAdd$ = Intent.get('eaterAdd$')
    .map(data => model => {
      model.gathering.eaters.push({name: data.name, servings: data.servings});
      save(model);
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
    sortByMod$, menuMod$, eaterMod$, eaterAdd$, saveGathering$, serverUpdate$
  );

  return {
    model$: modifications$
              .merge(Initial.get('model$'))
              .scan(function (model, modFn) { return modFn(model); })
              .tap(calculatePurchaseOptions)
              //.combineLatest(route$, determineFilter)
              .share()
  }
});

export default Model;