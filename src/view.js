/** @jsx */
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
          }, 'Leftovers'),
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
      Cycle.h('tbody', model.purchaseOptions.map(renderOption.bind(this, model.gathering.servingSize, model.numServings)))
    ])
  ];
}

function renderOption(servingSize, servings, option) {
  return <tr>
    <td>{_(option.pizzas)
      .groupBy('name')
      .map((arr, name) => `${arr.length} ${name}`)
      .value()
      .join(', ')}</td>
    <td>
      {option.mostPizza ? Cycle.h('span.most-pizza', {title: 'Most Pizza!'}) : null}
      {Math.round((option.total / servingSize - servings) * 100) / 100 + ' slices'}
    </td>
    <td>
      {option.cheapest ? Cycle.h('span.low-price', {title: 'Lowest Price!'}) : null}
      ${'' + Math.round(option.cost * 100) / 100}
    </td>
    <td>
      {option.bestDeal ? Cycle.h('span.best-deal', {title: 'Best Deal!'}) : null}
      {'' + option.rank}
    </td>
  </tr>
}

function renderMenuSelection(menus, gathering, numServings) {
  return [
    <h2>Where are we ordering {''+numServings} slices from?</h2>,
    <select className='menu'>
    {_.map(menus, (menu) =>
        <option selected={gathering.menu === menu._id}>{menu.name}</option>
    )}
    </select>
  ];
}

function renderSave(gathering) {
  return gathering._id ? [] : [
    Cycle.h('button.save', 'Save this gathering')
  ];
}

function renderEaters(gathering) {
  return [
    <h2>Who's eating?</h2>,
    <ul>
    {gathering.eaters.map(renderEater)}
      <li>
        <input className="new-eater" />
      </li>
    </ul>
  ];
}

function renderEater(eater, index) {
  function propHook(element) {
    if (eater.editing) {
      element.focus();
      element.selectionStart = element.value.length;
    }
  }
  return <li className={eater.editing ? 'editing' : ''}>
    <span className='eater-name' attributes={{'data-index': index}}>{`${eater.name}: ${eater.servings} slice${eater.servings === 1 ? '' : 's'}`}</span>
    <span className='init-edit' attributes={{'data-index': index}}> edit</span>
    <input className='edit-eater' value={`${eater.name}: ${eater.servings}`} attributes={{'data-index': index}} vdomPropHook={Cycle.vdomPropHook(propHook)}/>
  </li>
}

var View = Cycle.createView(Model =>
    ({
      vtree$: Model.get('model$').map(model =>
        Cycle.h('div', [
          Cycle.h('h1', 'TODO: Minimum Viable Pizza'),
          renderSave(model.gathering),
          renderEaters(model.gathering),
          renderMenuSelection(model.menus, model.gathering, model.numServings),
          renderOptions(model)
        ]))
    })
);

export default View;