import { fetch } from 'edf-utils'

export default {
    getImportAsyncStatusNew: (option) => fetch.post('/v1/yygl/khzl/getImportAsyncStatusNew',option),
    stopImport: (option) => fetch.post('/v1/yygl/khzl/stopImport',option),
}