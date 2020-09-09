import { fetch } from 'edf-utils'

export default {
    syndromes:{

    },
    customer:{
        findByEnumId: (option) => fetch.post('/v1/edf/enumDetail/findByEnumId', option),
        areaQuery: (option) => fetch.post('/v1/edf/area/query', option),
        query: (id) => fetch.post('/v1/yygl/khzl/queryById', id),
        update: (option) => fetch.post('/v1/yygl/khzl/edit', option),
        downLoadNSRXX:(option) => fetch.post('/v1/yygl/khzl/getNsrxx',option),//下载纳税人信息
        getNsrxxState:(option,date) => fetch.post2('/v1/yygl/khzl/getNsrxxAsyncStatus',option,date),//下载纳税人信息状态
        getNsrxxOther:(option,date) => fetch.post('/v1/yygl/khzl/getNsrxxOther',option,date),//三证合一更新纳税人信息并保存
    },
    CAState: {
        queryCAState: (option) => fetch.post('/v1/edf/dlxxca4proxy/isExistCa',option),
        getToolUrl: () => fetch.post('/v1/edf/org/getDownloadUrl'),
        getImportid: () => fetch.post('/v1/yygl/khzl/getOrgId'),
        queryCAName: (option) => fetch.post('/v1/yygl/khzl/queryCA',option),
        queryisCA:(option) => fetch.post('/v1/yygl/khzl/edfDlxxCaExistCa',option)
    }
}