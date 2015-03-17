function updateTotal(option) {
  option.total = _(option.pizzas)
    .map('diameter')
    .map(d => d / 2)
    .map(r => r * r)
    .map(r2 => r2 * Math.PI)
    .reduce((sum, area) => area + sum);
}

function addPizza(totalSize, pizzas, option, options, index) {
  index = index || 0;
  if (option.total > totalSize) {
    options.push(option);
  } else {
    for (let i = index; i < pizzas.length; ++i) {
      var newOp = {pizzas: _.clone(option.pizzas)};
      newOp.pizzas.push(pizzas[i]);
      updateTotal(newOp);
      addPizza(totalSize, pizzas, newOp, options, i);
    }
  }
  return options;
}

export default function calculatePurchaseOptions(eaters, pizzas, servingSize, sortBy) {
  var pizzas = _.sortBy(_.cloneDeep(pizzas), 'diameter').reverse(),
      numServings = _(eaters).map('servings').reduce((sum, num) => sum + num) || 0,
      totalSize = numServings * servingSize;

  return _(addPizza(totalSize, pizzas, {pizzas: [], total: 0}, []))
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
    .sortBy('cost')
    .tap(options => options.length && (options[0].cheapest = true))
    .sortBy(sortBy)
    .value();
}