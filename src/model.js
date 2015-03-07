import Cycle from 'cyclejs';
import _ from 'lodash';

function calculatePurchaseOptions(model) {
  var {servingSize, sortBy} = model,
      pizzas = _.sortBy(model.selectedMenu, 'diameter').reverse(),
      numServings = _(model.eaters).map('servings').reduce((sum, num) => sum + num) || 0,
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

  model.numServings = numServings;
  model.purchaseOptions = _(addPizza({pizzas: [], total: 0}, []))
    .tap(options => console.log(`Found ${options.length} options`))
    .forEach(option => {
      option.cost = _(option.pizzas)
        .map('cost')
        .reduce((sum, cost) => sum + cost);
      option.ratio = option.cost / option.total;
    })
    .sortBy('ratio')
    .forEach((option, index) => option.order = index + 1)
    .sortBy('total')
    .forEach((option, index) => option.order += index)
    .sortBy(sortBy)
    .take(10)
    .sortBy('total')
    .tap(options => options.length && (options[options.length - 1].mostPizza = true))
    .sortBy('ratio')
    .tap(options => options.length && (options[0].bestDeal = true))
    .sortBy(sortBy)
    .value();
}

export default Model = Cycle.createModel((Intent, Initial) => {

  var sortByMod$ = Intent.get('sortBy$')
    .map(sortBy => model => {
      model.sortBy = sortBy;
      return model;
    });

  var menuMod$ = Intent.get('selectMenu$')
    .map(name => model => {
      model.selectedMenu = model.menus[name];
      return model;
    });

  var eaterMod$ = Intent.get('eaterUpdate$')
    .map(data => model => {
      model.eaters[data.id].servings = Math.max(data.servings, 0);
      return model;
    });

  var eaterAdd$ = Intent.get('eaterAdd$')
    .map(data => model => {
      model.eaters.push({name: data.name, servings: data.servings});
      return model;
    });

  var modifications$ = Rx.Observable.merge(
    sortByMod$, menuMod$, eaterMod$, eaterAdd$
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
