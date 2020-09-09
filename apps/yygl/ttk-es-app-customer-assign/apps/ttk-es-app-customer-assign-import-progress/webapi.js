import { fetch } from 'edf-utils'

export default {
    getImportAsyncStatusNew: (option) => fetch.post('/v1/yygl/userCust/getImportAsyncStatusNew',option),
    stopImport: (option) => fetch.post('/v1/yygl/khzl/stopImport',option),
}