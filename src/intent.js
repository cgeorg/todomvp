import Cycle from 'cyclejs';

var Intent = Cycle.createIntent(User => ({

  sortBy$: User.event$('th', 'click').map(
      ev => ev.target.getAttribute('data-order')
  ).filter(order => !!order),

  selectMenu$: User.event$('.menu', 'change').map(
      ev => ev.target.options[ev.target.selectedIndex].value
  ),

  eaterAdd$:   User.event$('.new-eater', 'keypress').filter(ev => ev.keyCode === 13).map(
      ev => ev.target.value.match(/(.*):\s*(\d+)/)
  ).filter(match => match).map(
      match => ({name: match[1], servings: parseInt(match[2], 10)})
  ),

  eaterUpdate$: User.event$('.edit-servings', 'keypress').filter(ev => ev.keyCode === 13).map(
      ev => ({id: ev.target.getAttribute('data-id'), servings: parseInt(ev.target.value, 10)})
  ).filter(update => !isNan(update.servings)),

  saveGathering$: User.event$('button.save', 'click')

}));

export default Intent;