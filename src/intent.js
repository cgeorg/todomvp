import {Rx} from 'cyclejs';

export default function Intent(interactions) {
    return {
        sortBy$: interactions.get('th', 'click')
            .map(ev => ev.target.getAttribute('data-order'))
            .filter(order => !!order),

        selectMenu$: interactions.get('.menu', 'change')
            .map(ev => ev.target.options[ev.target.selectedIndex].value),

        eaterAdd$: interactions.get('.new-eater', 'keypress')
            .filter(ev => ev.keyCode === 13)
            .map(ev => ev.target.value.match(/^([^:]*)[:\s]+(\d+(\.\d*)?)$/))
            .filter(match => match)
            .map(match => ({name: match[1], servings: parseInt(match[2], 10)})),

        eaterStartEdit$: Rx.Observable.merge(
            interactions.get('.init-edit', 'click'),
            interactions.get('.eater-name', 'dblclick'))
            .map(ev => ev.target.getAttribute('data-index')),

        eaterFinishEdit$: interactions.get('.edit-eater', 'keypress')
            .filter(ev => ev.keyCode === 13)
            .merge(interactions.get('.edit-eater', 'blur'))
            .map(ev => ({
                index: ev.target.getAttribute('data-index'),
                match: ev.target.value.match(/^([^:]*)[:\s]+(\d+(\.\d*)?)$/)
            }))
            .filter(match => match.match)
            .map(match => ({
                index: match.index,
                name: match.match[1],
                servings: parseInt(match.match[2], 10)
            })),

        eaterCancelEdit$: interactions.get('.edit-eater', 'keypress')
            .filter(ev => ev.keyCode === 27)
            .map(ev => ev.target.getAttribute('data-index')),

        saveGathering$: interactions.get('button.save', 'click')
            .map(ev => true)

    };
};