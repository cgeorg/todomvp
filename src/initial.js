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

var menus = (window && window.menus) || [
    {
      _id:    '54fca86fe976eead6c54544c',
      name:   'Monte Cellos Pittsburgh',
      pizzas: [
        {name: 'Large', diameter: 16, cuts: 10, cost: 12.95},
        {name: 'Medium', diameter: 14, cost: 9.95},
        {name: 'Small', diameter: 12, cost: 8.95}
      ]
    }
  ];

var gathering = (window && window.gathering) || {
    eaters:      [],
    servingSize: getDefaultServing(),
    menu:        menus[0]._id
  };

function getDefaultServing() {
  return Math.floor(Math.pow(menus[0].pizzas[0].diameter / 2, 2) * Math.PI * 1000 / menus[0].pizzas[0].cuts) / 1000;
}

var ModelSource = Cycle.createDataFlowSource({
  model$: Rx.Observable.just({menus, gathering, sortBy: 'rank'})
});

export default ModelSource;