/** @jsx */
import Cycle from 'cyclejs';
import _ from 'lodash';

function renderOptions(model) {
    return [
        <h2>Let's get one of these:</h2>,
        <table>
            <thead>
            <tr>
                <th>Pizzas</th>
                <th attributes={{'data-order': 'total'}}
                    className={model.sortBy === 'total' ? 'active' : ''}>Leftovers
                </th>
                <th attributes={{'data-order': 'cost'}}
                    className={model.sortBy === 'cost' ? 'active' : ''}>Cost
                </th>
                <th attributes={{'data-order': 'rank'}}
                    className={model.sortBy === 'rank' ? 'active' : ''}>PizzaRank™
                </th>
            </tr>
            </thead>
            <tbody>
            {model.purchaseOptions.map(renderOption.bind(this, model.gathering.servingSize, model.numServings))}
            </tbody>
        </table>
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
            {option.mostPizza ? <span className='most-pizza' title='Most Pizza!'/> : null}
            {(option.total / servingSize - servings).toFixed(1) + ' slices'}
        </td>
        <td>
            {option.cheapest ? <span className='low-price' title='Lowest Price!'/> : null}
            ${'' + option.cost.toFixed(2)}
        </td>
        <td>
            {option.bestDeal ? <span className='best-deal' title='Best Deal!'/> : null}
            {'' + option.rank}
        </td>
    </tr>
}

function renderMenuDetail(menu, sliceSize) {
    return [
        <h3>{menu.name}'s Menu</h3>,
        <dl>
            {menu.pizzas.map(pizza =>
                    [
                        <dt>{pizza.name}</dt>,
                        <dd>{'' + pizza.diameter}", {'' + pizza.cuts} cuts</dd>,
                        <dd>{(Math.pow(pizza.diameter / 2, 2) * Math.PI / pizza.cuts / sliceSize).toFixed(2)} 'slices'
                            per slice</dd>
                    ]
            )}
        </dl>
    ]
}

function renderMenuSelection(menus, gathering, numServings) {
    return [
        <h2>Where are we ordering {'' + numServings} slices from?</h2>,
        <select className='menu'>
            {menus.map(menu =>
                    <option selected={gathering.menu === menu._id}>{menu.name}</option>
            )}
        </select>,
        _.filter(menus, {_id: gathering.menu}).map(menu => renderMenuDetail(menu, gathering.servingSize))

    ];
}

function renderSave(gathering) {
    return gathering._id ? [] : [
        <button className='save'>Save this gathering</button>
    ];
}

function renderEaters(gathering) {
    return [
        <h2>Who's eating?</h2>,
        <ul>
            {gathering.eaters.map(renderEater)}
            <li>
                <input className="new-eater"/>
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

    return (
        <li className={eater.editing ? 'editing' : ''}>
            <span className='eater-name'
                  attributes={{'data-index': index}}>{`${eater.name}: ${eater.servings} slice${eater.servings === 1 ? '' : 's'}`}</span>
            <span className='init-edit' attributes={{'data-index': index}}> edit</span>
            <input className='edit-eater' value={`${eater.name}: ${eater.servings}`} attributes={{'data-index': index}}
                   vdomPropHook={Cycle.vdomPropHook(propHook)}/>
        </li>
    );
}

var View = Cycle.createView(Model =>
        ({
            vtree$: Model.get('model$').map(model =>
                    <div>
                        <h1>TODO: Order Minimum Viable Pizza</h1>
                        {renderSave(model.gathering)}
                        {renderEaters(model.gathering)}
                        {renderMenuSelection(model.menus, model.gathering, model.numServings)}
                        {renderOptions(model)}
                    </div>
            )
        })
);

export default View;