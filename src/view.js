import Cycle from 'cyclejs';

function renderOption(servingSize, option) {
  return Cycle.h('tr', [
    Cycle.h('td', _(option.pizzas)
      .groupBy('name')
      .map((arr, name) => arr.length + ' ' + name)
      .value()
      .join(', ')),
    Cycle.h('td', '' + (Math.round(option.total / servingSize * 100) / 100)),
    Cycle.h('td', '' + (Math.round(option.cost * 100) / 100)),
    Cycle.h('td', '' + option.order),
    option.special ? Cycle.h('td', option.special) : undefined
  ]);
}

export default View = Cycle.createView(Model =>
    ({
      vtree$: Cycle.Rx.Observable.combineLatest(
        Model.get('purchaseOptions$'),
        Model.get('servingSize$'),
        Model.get('sortBy$'),
        function (options, servingSize, sort) {
          return Cycle.h('div', [
            Cycle.h('h1', 'Purchase options:'),
            Cycle.h('table', [
              Cycle.h('thead', [
                Cycle.h('tr', [
                  Cycle.h('th', 'Pizzas'),
                  Cycle.h('th', {
                    attributes: {'data-order': 'total'},
                    className: sort === 'total' ? 'active' : ''
                  }, 'Servings'),
                  Cycle.h('th', {
                    attributes: {'data-order': 'cost'},
                    className: sort === 'cost' ? 'active' : ''
                  }, 'Cost'),
                  Cycle.h('th', {
                    attributes: {'data-order': 'order'},
                    className: sort === 'order' ? 'active' : ''
                  }, 'PizzaRank™'),
                ])
              ]),
              Cycle.h('tbody', options.map(renderOption.bind(this, servingSize)))
            ])
          ]);
        })
    })
);