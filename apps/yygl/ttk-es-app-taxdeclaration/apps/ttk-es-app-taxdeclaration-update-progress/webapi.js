import { fetch } from 'edf-utils'

export default {
    download:{
        updateTaxAppraisalYyglAsyncStatusHasReturn: (option) => fetch.post('/v1/yygl/statistic/updateTaxAppraisalYyglAsyncStatusHasReturn',option),
    },
}