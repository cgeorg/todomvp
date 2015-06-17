import _ from 'lodash';

export default function WsIntent({socketIO}) {
    var wsIntent = socketIO.get('intent').shareReplay(1);
        return _(['eaterAdd$', 'eaterFinishEdit$'])
        .indexBy(name => name)
        .mapValues(name => wsIntent.filter(message => message.name === name).map(message => message.event))
        .value()
}