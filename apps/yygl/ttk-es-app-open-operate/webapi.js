import { fetch } from 'edf-utils'

export default {
    openOperate: (option) => fetch.post('/v1/yygl/jcyysync/opening',option),
    openOperateStatus: (option) => fetch.post2('/v1/yygl/jcyysync/getAgencyAsyncStatus',option,5000),
    dzCode: () => fetch.post('/v1/edf/connector/getJcyyCodeFromUc'),
    ifManager: () => fetch.post('/v1/dataapi/jcdz/ifManager'),
    ifUsedFerEs: () => fetch.post('/v1/dataapi/jcdz/ifUsedFerEs'),
    applyOpenOperate: (option) => fetch.post('/v1/yygl/jcyysync/agencyQueue',option),
}