import { fetch, fetchCors } from 'edf-utils'

export default {
    desktop: {
        getEchart: (option) => fetch.post('/v1/dz/statistic/totalChart', option),
        getList: (option) => fetch.post('/v1/yygl/home/getOrgList', option),//dz/statistic/queryList
        getCode: (url, params, options) => fetchCors.post(`${url}/v1/edf/oauth2/getAuthCodeForDz`, params, options),
        getPersonList: (option) => fetch.post('/v1/ba/person/queryList', option),
        getTaxCalendar: (option) => fetch.post('/v1/edf/tax/calendar/query', option),
        getGGxx: (option) => fetch.post('/v1/yygl/home/queryListByUser',option),
        getGGrd: (option) => fetch.post('/v1/yygl/home/userRead',option),
        getbsrq: (option) => fetch.post('/v1/yygl/home/calendarQuery',option),
        getjzxx: (option) => fetch.post('/v1/yygl/home/getJzjdTj',option),
        getfpkh: (option) => fetch.post('/v1/yygl/person/getDepartMentList',option),
        getOrgListOnlyCus: (option) => fetch.post('/v1/yygl/home/getOrgListOnlyCus',option),
        getOrgListOnlyState: (option) => fetch.post('/v1/yygl/home/getOrgListOnlyState',option),
        portal: (option) => fetch.post('/v1/edf/dzgl/initPortal',option),
        judgeHomepageNum: (option) => fetch.post('/v1/yygl/home/judgeHomepageNum',option),
        getHomepageUserData: (option) => fetch.post('/v1/yygl/home/getHomepageUserData',option),
        getOrgListOnlyJzxx: (option) => fetch.post('/v1/yygl/home/getOrgListOnlyJzxx',option),
        queryTjkhOrgHome: (option) => fetch.post('/v1/yygl/home/queryTjkhOrgHome',option),
        getJzjdOrSbjdTj: (option) => fetch.post('/v1/yygl/home/getJzjdOrSbjdTj',option),
    }
}
