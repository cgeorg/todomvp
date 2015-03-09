# TODO: Minimum Viable Pizza

Let's face it: todo lists are overdone.  We know what we need to do - we need to order pizza.  But how much?

The TODO: MVP algorithm accepts the following inputs:

* A standard "slice" size
* Total number of slices that the group desires
* The pizza sizes and prices of the pizza shop

The TODO: MVP algorithm will in turn recommend several pizza ordering options that will satisfy the group's cravings.

## What can I do with it?

Well, you could use it to figure out what pizza to order.  You could also use it instead of TodoMVC to try out a new library/framework/etc.

## How does the MVP algorithm work?

It just generates permutations of all of the pizza configurations that order enough pizza, without ordering an extra pizza, and then ranks and sorts them on several axes.

## Reference Implementation

```javascript
var _ = require('lodash');

function mvp(numServings, servingSize, pizzas, sortBy) {
  var totalSize = numServings * servingSize;

  pizzas = _.sortBy(pizzas, 'diameter').reverse();

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

  return _(addPizza({pizzas: [], total: 0}, []))
    .flatten()
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
    .tap(options => options[options.length - 1].special = 'Most pizza! ')
    .sortBy('ratio')
    .tap(options => options[0].special = (options[0].special ? options[0].special : '') + 'Best deal!')
    .sortBy(sortBy)
    .value();
}

var topTenPizzas = mvp(20 /*slices of pizza*/, 20 /*square inches per slice*/, [
  {name: 'Large', diameter: 16, cost: 12.95},
  {name: 'Medium', diameter: 14, cost: 9.95},
  {name: 'Small', diameter: 12, cost: 8.95}
] /* Monte Cellos' pizza menu */, 'order' /* sort by PizzaRank */);
```