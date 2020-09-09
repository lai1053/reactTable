import { fetch } from 'edf-utils'

export default {
    getfpkh: (option) => fetch.post('/v1/yygl/person/getDepartMentList',option),
    plktList: (option) => fetch.post('/v1/yygl/khzl/plktList',option),
    plktzs: (option) => fetch.post('/v1/yygl/khzl/plktzs',option),//提交申请
}