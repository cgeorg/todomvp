import {Rx} from 'cyclejs';

export default function Intent(interactions) {
    return {
        sortBy$: interactions.get('DOM', 'th', 'click')
            .map(ev => ev.target.getAttribute('data-order'))
            .filter(order => !!order)
            .shareReplay(1),

        selectMenu$: interactions.get('DOM', '.menu', 'change')
            .map(ev => ev.target.options[ev.target.selectedIndex].value)
            .shareReplay(1),

        eaterAdd$: interactions.get('DOM', '.new-eater', 'keypress')
            .filter(ev => ev.keyCode === 13)
            .map(ev => ev.target.value.match(/^([^:]*)[:\s]+(\d+(\.\d*)?)$/))
            .filter(match => match)
            .map(match => ({name: match[1], servings: parseInt(match[2], 10)}))
            .shareReplay(1),

        eaterStartEdit$: Rx.Observable.merge(
            interactions.get('DOM', '.init-edit', 'click'),
            interactions.get('DOM', '.eater-name', 'dblclick'))
            .map(ev => ev.target.getAttribute('data-index'))
            .shareReplay(1),

        eaterFinishEdit$: interactions.get('DOM', '.edit-eater', 'keypress')
            .filter(ev => ev.keyCode === 13)
            .merge(interactions.get('DOM', '.edit-eater', 'blur'))
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

        eaterCancelEdit$: interactions.get('DOM', '.edit-eater', 'keypress')
            .filter(ev => ev.keyCode === 27)
            .map(ev => ev.target.getAttribute('data-index'))
            .shareReplay(1),

        saveGathering$: interactions.get('DOM', 'button.save', 'click')
            .map(ev => true)
            .shareReplay(1)

    };
};