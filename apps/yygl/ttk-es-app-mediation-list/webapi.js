import { fetch } from 'edf-utils'

export default {
    mediation: {
        fetchMediationList: (option) => fetch.post('/v1/yygl/jcyysync/getAllAgencys', option),
        mediaOpen: (option) => fetch.post('/v1/yygl/jcyysync/agency', option)
    }
}