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

    init = (state, option = {}) => {
        const initState = getInitState()
        initState.data.other.stepEnabled = false //option.isGuide

        return this.metaReducer.init(state, initState)
    }
    selectRow = (state, rowIndex, checked) => {
		state = this.metaReducer.sf(state, `data.list.${rowIndex}.selected`, checked);
		return state;
	};
    load = (state, response) => {
        let calcDict = response.other.calcDict,
            list = response.list.map((item) => {
                api.TransSubject(item, calcDict)
            })

        const fieldValue = {
            'data.list': fromJS(response.list),
            'data.filter': fromJS(response.filter),
            'data.gradeSetting': fromJS(response.gradeSetting),
            'data.other': fromJS(response.other)
        }
        state = this.metaReducer.sfs(state, fieldValue)

        let condition = this.metaReducer.gf(state, 'data.other.positionCondition')

        condition = (condition && condition.trim()) + ''

        if (condition != '') {
            state = this.fixPosition(state, condition)
        }

        return state
    }

    fixPosition = (state, condition) => {
        let list = this.metaReducer.gf(state, 'data.list'),
            matchIndex = this.metaReducer.gf(state, 'data.other.matchIndex'),
            matchBacktoZero = this.metaReducer.gf(state, 'data.other.matchBacktoZero'),
            firstMatchIndex = -1, aryMatch = []

        condition = (condition && condition.trim()) + ''
        if (condition != '') {
            list = list.map((item, index) => {
                // 编码按照左匹配，名称按照模糊匹配
                if (item.get('code').indexOf(condition) ==0 ||
                    item.get('name').indexOf(condition) > -1){
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
            state = this.metaReducer.sf(state, 'data.other.searchFlag', true)
        } else {
            state = this.metaReducer.sf(state, 'data.other.detailsScrollToRow', -9)
        }

        return this.metaReducer.sf(state, 'data.other.matchIndex', matchIndex)
    }

    // fixPosition = (state, condition) => {
    //     state = this.setMatchStatus(state, condition)
    //     state = this.metaReducer.sf(state, 'data.other.matchBacktoZero', true)
    //     state = this.metaReducer.sf(state, 'data.other.matchIndex', -1)
    //     state = this.metaReducer.sf(state, 'data.other.positionCondition', condition)
    //     return this.metaReducer.sf(state, 'data.other.searchFlag', true)
    // }

    searchChange = (state, value) => {
        state = this.metaReducer.sf(state, 'data.other.matchBacktoZero', true)
        state = this.metaReducer.sf(state, 'data.other.matchIndex', -1)
        return state
        // return this.metaReducer.sf(state, 'data.other.positionCondition', value)
    }
    updateGrade = (state, name, value) => {
        return this.metaReducer.sf(state, name, value)
    }
    loading = (state, loading) => {
        return this.metaReducer.sf(state, 'data.other.loading', loading)
    }
    financeInitBtnShow = (state, appExtendParams) => {
        //是否显示财务初始化按钮 上一步 、下一步
        if (appExtendParams) {
            state = this.metaReducer.sf(state, 'data.other.isShowBtn', true)
        } else {
            state = this.metaReducer.sf(state, 'data.other.isShowBtn', false)
        }
        return state
    }
    //新增
    addSubject = (state, subject, parentSubjectId) => {

        let list = this.metaReducer.gf(state, 'data.list'),
            other = this.metaReducer.gf(state, 'data.other').toJS()
        //科目展示化处理
        subject = api.TransSubject(subject, other.calcDict)

        //获取父级科目的行号
        let rowIndex = list.toJS().findIndex((x) => x.id == parentSubjectId)
        //更新父级科目为非末级科目
        list = list.update(rowIndex, item => {
            item = item.set('isEndNode', false)
            return item
        })

        //获取新增科目的同级科目的最大rowindex，作为list的插入起始位置
        let sameGradeSubjects = list.filter(subItem => {
            return subItem.get('parentId') == parentSubjectId
        }).toArray()
        if (sameGradeSubjects && sameGradeSubjects.length > 0) {
            let subjectId = sameGradeSubjects[sameGradeSubjects.length - 1].get('id')

            rowIndex = list.toJS().findIndex((x) => x.id == subjectId)
        }

        //插入新增的科目
        rowIndex++

        list = list.insert(rowIndex, Map(subject))

        list = list.sortBy(subItem => subItem.code)

        return state = this.metaReducer.sf(state, 'data.list', list)
    }

    //删除数据
    deleteSubject = (state, accountId, parentId, isDelCurSubject) => {
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

    //修改
    updateSubject = (state, selectedRow) => {
        if (!selectedRow) {
            return
        }
        let list = this.metaReducer.gf(state, 'data.list'),
            other = this.metaReducer.gf(state, 'data.other').toJS()

        //科目展示化处理
        selectedRow = api.TransSubject(selectedRow, other.calcDict)

        //获取修改科目的行号
        let rowIndex = list.toJS().findIndex((x) => x.id == selectedRow.id)
        //更新修改科目
        list = list.update(rowIndex, item => {
            item = selectedRow
            return item
        })
        return state = this.metaReducer.sf(state, 'data.list', list)

    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        extendReducer = extend.reducerCreator({ ...option, metaReducer }),
        o = new reducer({ ...option, metaReducer, extendReducer })
    return { ...metaReducer, ...extendReducer.gridReducer, ...o }
}
