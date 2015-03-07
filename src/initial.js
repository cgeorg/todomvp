import Cycle from 'cyclejs';

/* Monte Cellos scrape function - doesn't grab cost

 $('#pizza h4')
 .map(function(ind, e) { return e.innerText })
 .map(function(ind, txt) {
 var matches = txt.match(/(.+) - (\d+)"/);
 return matches && {name: matches[1], diameter: parseInt(matches[2], 10) };
 })
 .filter(function(ind, match) { return !!match; });

 */

var menus = {
  'Monte Cellos': [
    {name: 'Large', diameter: 16, cuts: 10, cost: 12.95},
    {name: 'Medium', diameter: 14, cost: 9.95},
    {name: 'Small', diameter: 12, cost: 8.95}
  ],
    'Pizza Parma': [
    {name: 'XLarge', diameter: 18, cost: 13.99},
    {name: 'Large', diameter: 16, cost: 12.99},
    {name: 'Medium', diameter: 14, cost: 10.99},
    {name: 'Small', diameter: 10, cost: 8.99}
  ]
};

function getDefaultServing() {
  return Math.floor(Math.pow(menus['Monte Cellos'][0].diameter/2, 2) * Math.PI * 100 / menus['Monte Cellos'][0].cuts)/100;
}

var ModelSource = Cycle.createDataFlowSource({
  model$: Rx.Observable.just({
    menus: menus,
    eaters: [
      {name: 'Doug', servings: 3},
      {name: 'Woolner', servings: 4},
      {name: 'CMG', servings: 4},
      {name: 'Gabo', servings: 3}
    ],
    servingSize: getDefaultServing(),
    selectedMenu: menus['Monte Cellos'],
    sortBy: 'order'
  })
});

export default ModelSource;