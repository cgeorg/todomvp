import Cycle from 'cyclejs';

var Intent = Cycle.createIntent(User => ({

  sortBy$: User.event$('th', 'click').map(
      ev => ev.target.getAttribute('data-order')
  ).filter(order => !!order),

  selectMenu$: User.event$('.menu', 'change').map(
      ev => ev.target.options[ev.target.selectedIndex].value
  ),

  eaterAdd$: User.event$('.new-eater', 'keypress').filter(ev => ev.keyCode === 13).map(
      ev => ev.target.value.match(/^(.*):?\s*(\d+(\.\d*)?)$/)
  ).filter(match => match).map(
      match => ({name: match[1], servings: parseInt(match[2], 10)})
  ),

  eaterStartEdit$: Cycle.Rx.Observable.merge(
    User.event$('.init-edit', 'click'),
    User.event$('.eater-name', 'dblclick')
  ).map(
      ev => ev.target.getAttribute('data-index')
  ),

  eaterFinishEdit$: Cycle.Rx.Observable.merge(
    User.event$('.edit-eater', 'keypress').filter(ev => ev.keyCode === 13),
    User.event$('.edit-eater', 'blur')
  ).map(ev => ({
      index: ev.target.getAttribute('data-index'),
      match: ev.target.value.match(/^([^:]*)[:\s]+(\d+(\.\d*)?)$/)
    })
  ).filter(
      match => match.match
  ).map(match => ({
      index:    match.index,
      name:     match.match[1],
      servings: parseInt(match.match[2], 10)
    })
  ),

  eaterCancelEdit$: User.event$('.edit-eater', 'keypress').filter(ev => ev.keyCode === 27).map(
      ev => ev.target.getAttribute('data-index')
  ),

  saveGathering$: User.event$('button.save', 'click').map(ev => true)

}));

export default Intent;