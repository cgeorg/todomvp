import {Rx} from 'cyclejs';

export default function WebSocketEffects(intent, model) {
    // Create room joining observable
    // Once something fires, shut it down and start pumping intent events to the same stream
    const join = model.model$
        .map(model => model.gathering && model.gathering._id)
        .filter(modelId => modelId)
        .map(modelId => {
            return {type: 'join', room: modelId}
        })
        .first();

    return Rx.Observable.merge(
        ['eaterAdd$', 'eaterFinishEdit$']
            .map(name =>  intent[name].map(event => {
                return {type: 'emit', messageType: 'intent', message: {name, event}}
            })))
        .skipUntil(join).merge(join)
        .shareReplay(1);
}