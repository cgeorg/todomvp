import Cycle from 'cyclejs';
import _ from 'lodash';

var mcPizza = [
  {name: 'Large', diameter: 16, cost: 12.95},
  {name: 'Medium', diameter: 14, cost: 9.95},
  {name: 'Small', diameter: 12, cost: 8.95}
];

var parmaPizza = [
  {name: 'XLarge', diameter: 18, cost: 13.99},
  {name: 'Large', diameter: 16, cost: 12.99},
  {name: 'Medium', diameter: 14, cost: 10.99},
  {name: 'Small', diameter: 10, cost: 8.99}
];

/*

 $('#pizza h4')
 .map(function(ind, e) { return e.innerText })
 .map(function(ind, txt) {
 var matches = txt.match(/(.+) - (\d+)"/);
 return matches && {name: matches[1], diameter: parseInt(matches[2], 10) };
 })
 .filter(function(ind, match) { return !!match; });

 */
export default Model = Cycle.createModel(Intent => ({
  'servingSize$':     Intent.get('servingSize$').startWith(20.1),
  'sortBy$':          Intent.get('sortBy$').startWith('order'),
  'purchaseOptions$': Cycle.Rx.Observable.combineLatest(
    Intent.get('numServings$').startWith(27),
    Intent.get('servingSize$').startWith(20.1),
    Intent.get('pizzas$').startWith(mcPizza),
    Intent.get('sortBy$').startWith('order'),
    function (numServings, servingSize, pizzas, sortBy) {
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
    })
}));
