import Cycle from 'cyclejs';

export default Intent = Cycle.createIntent(User => ({
  'numServings$': User.event$('body', 'load').map(ev => 36),
  'servingSize$': User.event$('body', 'load').map(ev => 20.1),
  'pizzas$': User.event$('body', 'load').map(ev => [
    {name: 'Large', diameter: 16, cost: 12.95},
    {name: 'Medium', diameter: 14, cost: 9.95},
    {name: 'Small', diameter: 12, cost: 8.95}
  ]),
  'sortBy$': User.event$('th', 'click').map(
      ev => ev.target.getAttribute('data-order')
  ).filter(order => !!order)
}));
