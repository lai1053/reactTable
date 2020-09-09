import { fetch } from 'edf-utils'

export default {
    mediation: {
        fetchMediationList: (option) => fetch.post('/v1/yygl/xdzsync/getAllAgencys', option),
        mediaOpen: (option) => fetch.post('/v1/yygl/xdzsync/agency', option)
    }
}