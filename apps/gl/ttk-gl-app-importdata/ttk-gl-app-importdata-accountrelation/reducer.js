import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
import extend from './extend'
import * as api from './api'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
    }
    init = (state, option) => {
        const initState = getInitState()
        return this.metaReducer.init(state, initState)
    }

    load = (state, matchList, accountList, isCanNotToNextStep, accountGrade) => {
        // let list = response.matchList.map((item) => {
        //         //api.TransSubject(item.accountDto, calcDict)
        //         return { item, ...item.accountDto }
        //     })
        if (matchList) {
            state = this.metaReducer.sf(state, 'data.list', fromJS(matchList.data))
            state = this.metaReducer.sf(state, 'data.pagination', fromJS(matchList.page))
        }
        state = this.metaReducer.sf(state, 'data.accountList', fromJS(accountList && accountList.glAccounts))
        state = this.metaReducer.sf(state, 'data.other.isCanNotToNextStep', fromJS(isCanNotToNextStep))
        state = this.metaReducer.sf(state, 'data.other.gradeList', fromJS(accountGrade))
        return state
    }
    /**
     * 加载load状态
     */
    loading = (state, loading) => {
        return this.metaReducer.sf(state, 'data.other.loading', loading)
    }

    setMatchStatus = (state, condition) => {
        let list = this.metaReducer.gf(state, 'data.list'),
            matchIndex = this.metaReducer.gf(state, 'data.other.matchIndex'),
            matchBacktoZero = this.metaReducer.gf(state, 'data.other.matchBacktoZero'),
            firstMatchIndex = -1, aryMatch = []

        condition = (condition && condition.trim()) + ''
        if (condition != '') {
            list = list.map((item, index) => {
                // 编码按照左匹配，名称按照模糊匹配
                if (item.get('sourceCode') && item.get('sourceCode').indexOf(condition) == 0 ||
                    item.get('sourceName') && item.get('sourceName').indexOf(condition) > -1 ||
                    item.get('accountDto') && item.get('accountDto').get('code') && item.get('accountDto').get('code').indexOf(condition) == 0 ||
                    item.get('accountDto') && item.get('accountDto').get('name') && item.get('accountDto').get('name').indexOf(condition) > -1
                ) {

                    aryMatch.push(index)
                    if (firstMatchIndex == -1) {
                        firstMatchIndex = index
                    }
                }

                return item
            })

            if (matchBacktoZero) {
                matchIndex = firstMatchIndex
            } else {
                let aryIndex = aryMatch.findIndex((x) => x > matchIndex)

                if (aryIndex == -1) {
                    matchIndex = firstMatchIndex
                } else {
                    matchIndex = parseInt(aryMatch[aryIndex])
                }
            }
            state = this.metaReducer.sf(state, 'data.list', list)
        }

        if (matchIndex > -1) {
            state = this.metaReducer.sf(state, 'data.other.detailsScrollToRow', matchIndex)
            state = this.metaReducer.sf(state, 'data.other.matchBacktoZero', false)
        } else {
            state = this.metaReducer.sf(state, 'data.other.detailsScrollToRow', -9)
        }

        return this.metaReducer.sf(state, 'data.other.matchIndex', matchIndex)
    }
    fixPosition = (state, condition) => {
        state = this.setMatchStatus(state, condition)

        return this.metaReducer.sf(state, 'data.other.searchFlag', true)
    }
    searchChange = (state, value) => {
        state = this.metaReducer.sf(state, 'data.other.matchBacktoZero', true)
        state = this.metaReducer.sf(state, 'data.other.matchIndex', -1)

        return this.metaReducer.sf(state, 'data.other.positionCondition', value)
    }
    setScroll = (state, condition) => {
        let list = this.metaReducer.gf(state, 'data.list'),
            matchIndex = this.metaReducer.gf(state, 'data.other.matchIndex'),
            matchBacktoZero = this.metaReducer.gf(state, 'data.other.matchBacktoZero'),
            firstMatchIndex = -1, aryMatch = [],
            dom = document.getElementsByClassName('ant-table-body')[0]

        condition = (condition && condition.trim()) + ''
        if (condition != '') {
            list = list.map((item, index) => {
                // 编码按照左匹配，名称按照模糊匹配
                // 编码按照左匹配，名称按照模糊匹配
                if (item.get('sourceCode') && item.get('sourceCode').indexOf(condition) == 0 ||
                    item.get('sourceName') && item.get('sourceName').indexOf(condition) > -1 ||
                    item.get('accountDto') && item.get('accountDto').get('code') && item.get('accountDto').get('code').indexOf(condition) == 0 ||
                    item.get('accountDto') && item.get('accountDto').get('name') && item.get('accountDto').get('name').indexOf(condition) > -1
                ) {
                    item = item.set('isMatch', true)
                    aryMatch.push(index)
                    if (firstMatchIndex == -1) {
                        firstMatchIndex = index
                    }
                } else {
                    if (item.get('isMatch') == true) {
                        item = item.set('isMatch', false)
                    }
                }
                return item
            })

            if (matchBacktoZero) {
                matchIndex = firstMatchIndex
            } else {
                let aryIndex = aryMatch.findIndex((x) => x > matchIndex)

                if (aryIndex == -1) {
                    matchIndex = firstMatchIndex
                } else {
                    matchIndex = parseInt(aryMatch[aryIndex])
                }
            }
            state = this.metaReducer.sf(state, 'data.list', list)
        }

        if (matchIndex > -1) {
            state = this.metaReducer.sf(state, 'data.other.detailsScrollToRow', matchIndex)
            state = this.metaReducer.sf(state, 'data.other.matchBacktoZero', false)
            state = this.metaReducer.sf(state, 'data.other.searchFlag', true)
        } else {
            if (condition == undefined) {
                state = this.metaReducer.sf(state, 'data.other.searchFlag', true)
            }
            state = this.metaReducer.sf(state, 'data.other.detailsScrollToRow', -9)
        }

        dom.scrollTop = matchIndex * 37 - dom.offsetHeight + 375
        return this.metaReducer.sf(state, 'data.other.matchIndex', matchIndex)
    }
    /**
     * 删除数据
     */
    deleteAccount = (state, accountId, parentId, isDelCurSubject) => {
        let list = this.metaReducer.gf(state, 'data.list')
        //获取父级科目的行号
        let rowIndex = list.toJS().findIndex((x) => x.id == accountId)
        if (isDelCurSubject) {
            let sameGradeSubjects = list.filter(subItem => {
                return subItem.parentId == parentId && subItem.id != accountId
            })
            //还存在同级科目时，则不更改父级科目为末级科目
            if (sameGradeSubjects && sameGradeSubjects.size === 0) {
                let parentSubject = list.filter(subItem => subItem.id == parentId)  //父级科目列表
                if (parentSubject && parentSubject.size == 1) {
                    let parentSubjectRowIndex = list.toJS().findIndex((x) => x.id == parentId)
                    list = list.update(parentSubjectRowIndex, item => {
                        item = item.set('isEndNode', true)
                        return item
                    })
                }
            }
            list = list.delete(rowIndex)
        } else {

        }
        return state = this.metaReducer.sf(state, 'data.list', list)
    }
    //初始化税检宝数据
    initsjb = (state, res) => {
        return this.metaReducer.sf(state, 'data.sjb', res)
    }
    update = (state, { path, value }) => {
        return this.metaReducer.sf(state, path, fromJS(value))
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        extendReducer = extend.reducerCreator({ ...option, metaReducer }),
        o = new reducer({ ...option, metaReducer, extendReducer })
    return { ...metaReducer, ...extendReducer.gridReducer, ...o }
}