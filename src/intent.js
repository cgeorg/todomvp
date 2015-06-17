import {Rx} from 'cyclejs';

export default function Intent({dom}) {
    return {
        sortBy$: dom.get('th', 'click')
            .map(ev => ev.target.getAttribute('data-order'))
            .filter(order => !!order)
            .shareReplay(1),

        selectMenu$: dom.get('.menu', 'change')
            .map(ev => ev.target.options[ev.target.selectedIndex].value)
            .shareReplay(1),

        eaterAdd$: dom.get('.new-eater', 'keypress')
            .filter(ev => ev.keyCode === 13)
            .map(ev => ev.target.value.match(/^([^:]*)[:\s]+(\d+(\.\d*)?)$/))
            .filter(match => match)
            .map(match => ({name: match[1], servings: parseInt(match[2], 10)}))
            .shareReplay(1),

        eaterStartEdit$: Rx.Observable.merge(
            dom.get('.init-edit', 'click'),
            dom.get('.eater-name', 'dblclick'))
            .map(ev => ev.target.getAttribute('data-index'))
            .shareReplay(1),

        eaterFinishEdit$: dom.get('.edit-eater', 'keypress')
            .filter(ev => ev.keyCode === 13)
            .merge(dom.get('.edit-eater', 'blur'))
            .map(ev => ({
                index: ev.target.getAttribute('data-index'),
                match: ev.target.value.match(/^([^:]*)[:\s]+(\d+(\.\d*)?)$/)
            }))
            .filter(match => match.match)
            .map(match => ({
                index: match.index,
                name: match.match[1],
                servings: parseInt(match.match[2], 10)
            }))
            .shareReplay(1),

        eaterCancelEdit$: dom.get('.edit-eater', 'keypress')
            .filter(ev => ev.keyCode === 27)
            .map(ev => ev.target.getAttribute('data-index'))
            .shareReplay(1),

        saveGathering$: dom.get('button.save', 'click')
            .map(ev => true)
            .shareReplay(1)

    };
};