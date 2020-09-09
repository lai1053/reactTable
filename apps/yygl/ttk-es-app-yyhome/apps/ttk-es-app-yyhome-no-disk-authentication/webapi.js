import { fetch } from 'edf-utils'

export default {
    download:{
        getNsrxxAsyncStatusHasReturn: (option) => fetch.post('/v1/yygl/khzl/getNsrxxAsyncStatusHasReturn',option),
    },
}