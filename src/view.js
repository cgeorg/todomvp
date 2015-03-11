import Cycle from 'cyclejs';
import _ from 'lodash';

function renderOptions(model) {
  return [
    Cycle.h('h2', 'Let\'s get one of these:'),
    Cycle.h('table', [
      Cycle.h('thead', [
        Cycle.h('tr', [
          Cycle.h('th', 'Pizzas'),
          Cycle.h('th', {
            attributes: {'data-order': 'total'},
            className: model.sortBy === 'total' ? 'active' : ''
          }, 'Servings'),
          Cycle.h('th', {
            attributes: {'data-order': 'cost'},
            className: model.sortBy === 'cost' ? 'active' : ''
          }, 'Cost'),
          Cycle.h('th', {
            attributes: {'data-order': 'rank'},
            className: model.sortBy === 'rank' ? 'active' : ''
          }, 'PizzaRank™'),
        ])
      ]),
      Cycle.h('tbody', model.purchaseOptions.map(renderOption.bind(this, model.gathering.servingSize)))
    ])
  ];
}

function renderOption(servingSize, option) {
  return Cycle.h('tr', [
    Cycle.h('td', _(option.pizzas)
      .groupBy('name')
      .map((arr, name) => `${arr.length} ${name}`)
      .value()
      .join(', ')),
    Cycle.h('td', [
      option.mostPizza ? Cycle.h('span.most-pizza', {title: 'Most Pizza!'}) : null,
      `${Math.round(option.total / servingSize * 100) / 100}`
    ]),
    Cycle.h('td', `${Math.round(option.cost * 100) / 100}`),
    Cycle.h('td', [
        option.bestDeal ? Cycle.h('span.best-deal', {title: 'Best Deal!'}) : null,
        `${option.rank}`
      ])
    ]);
}

function renderMenuSelection(menus, gathering) {
  return [
    Cycle.h('h2', `Where are we ordering ${gathering.numServings} slices from?`),
    Cycle.h('select.menu', _.map(menus, (menu) =>
      Cycle.h('option', {selected: gathering.menu === menu._id}, menu.name)))
  ];
}

function renderSave(gathering) {
  return gathering._id ? [] : [
    Cycle.h('button.save', 'Save this gathering')
  ];
}

function renderEaters(gathering) {
  return [
    Cycle.h('h2', 'Who\'s eating?'),
    Cycle.h('ul', [
      gathering.eaters.map(renderEater),
      Cycle.h('li', Cycle.h('input.new-eater'))
    ])
  ];
}

function renderEater(eater) {
  return Cycle.h('li', [
    Cycle.h('span', `${eater.name}: ${eater.servings} slice${eater.servings === 1 ? '' : 's'}`)
  ]);
}

var View = Cycle.createView(Model =>
    ({
      vtree$: Model.get('model$').map(model =>
        Cycle.h('div', [
          Cycle.h('h1', 'TODO: Order Minimum Viable Pizza'),
          renderSave(model.gathering),
          renderEaters(model.gathering),
          renderMenuSelection(model.menus, model.gathering),
          renderOptions(model)
        ]))
    })
);

export default View;