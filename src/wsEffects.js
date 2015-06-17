import {Rx} from 'cyclejs';

export default function WebSocketEffects(intent, model) {
    // Create room joining observable
    // Once something fires, shut it down and start pumping intent events to the same stream
    const joinRoom = model.model$
        .map(model => model.gathering && model.gathering._id)
        .filter(modelId => modelId)
        .map(modelId => {
            return {messageType: 'setRoom', message: modelId}
        })
        .first();

    return Rx.Observable.merge(
        ['eaterAdd$', 'eaterFinishEdit$']
            .map(name =>  intent[name].map(event => {
                return {messageType: 'intent', message: {name, event}}
            })))
        .skipUntil(joinRoom).merge(joinRoom)
        .shareReplay(1);
}