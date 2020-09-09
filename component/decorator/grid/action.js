import utils from 'edf-utils'
import ReactDOM from 'react-dom'

export default class action {
    constructor(option) {
        this.metaAction = option.metaAction
        if (option.gridOption) {
            this.option = option.gridOption
        }
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
    }

    getColNames(gridName) {
        return this.option[gridName].getColNames(this.metaAction.gf)
    }

    isSelectAll = (gridName) => {
        if (!this.option)
            return

        if (!(typeof gridName == 'string' && gridName)) {
            gridName = Object.keys(this.option)[0]
        }
        let lst = this.metaAction.gf(this.option[gridName].path)
        if (this.component.props.appName == 'app-account-subjects') {
            lst = lst.filter(item => !(item.get('isSystem') && !item.get('isAllowDel')) && item.get('isEndNode') && item.get('isEnable'))

        }
        if (!lst || lst.size == 0)
            return false
        return lst.every(o => o.get(this.option[gridName].selectFieldName))
    }

    selectAll = (gridName) => (e) => {
        if (!this.option)
            return


        if (!(typeof gridName == 'string' && gridName)) {
            gridName = Object.keys(this.option)[0]
        }

        this.injections.reduce('selectAll', e.target.checked, gridName)
    }

    getSelectedCount = (gridName) => {
        if (!this.option)
            return


        if (!(typeof gridName == 'string' && gridName)) {
            gridName = Object.keys(this.option)[0]
        }

        var lst = this.metaAction.gf(this.option[gridName].path)

        if (!lst || lst.size == 0)
            return 0

        var ret = lst.filter(o => !!o.get(this.option[gridName].selectFieldName)).size

        return ret
    }

    getSelected = (gridName, name) => {
        if (!this.option) return

        if (!(typeof gridName == 'string' && gridName)) {
            gridName = Object.keys(this.option)[0]
        }

        let lst = this.metaAction.gf(this.option[gridName].path), ret = []

        if (!lst || lst.size == 0) return 0

        lst.map(m => {
            let obj = { id: m.get('id'), ts: m.get('ts') }
            if (name) { obj[name] = m.get(name) }
            if (m.get('selected')) ret.push(obj)
        })

        return ret
    }

    getSelectedInfo = (gridName) => {
        if (!this.option) return

        if (!(typeof gridName == 'string' && gridName)) {
            gridName = Object.keys(this.option)[0]
        }

        let lst = this.metaAction.gf(this.option[gridName].path), ret = []

        if (!lst || lst.size == 0) return 0

        lst.map(m => { if (m.get('selected')) ret.push(m.toJS()) })

        return ret
    }

    mousedown = (e) => {
        if (!this.option)
            return
        if (e && e.target) {
            if (e.target.className == 'linkApp') return
        }
        const path = utils.path.findPathByEvent(e)
        if (this.metaAction.isFocus(path)) return
        if (path.indexOf('cell.cell') != -1) {

            // this.focusCell(this.getCellInfo(path), path, e)
            let keyRandom = Math.floor(Math.random() * 10000)
            this.keyRandom = keyRandom
            clearTimeout(this.time)
            this.time = setTimeout(() => {
                if (keyRandom == this.keyRandom) {
                    this.focusCell(this.getCellInfo(path), path, e)
                }
            }, 16)
        }
        else {
            if (!this.metaAction.focusByEvent(e)) return

            let keyRandom = Math.floor(Math.random() * 10000)
            this.keyRandom = keyRandom
            clearTimeout(this.time)
            this.time = setTimeout(() => {
                if (keyRandom == this.keyRandom) {
                    this.cellAutoFocus()
                }
            }, 16)
        }
    }

    gridKeydown = (e) => {
        if (!this.option)
            return
        //某些条件下可能需要禁用, 不需要移动单元格
        if (this.option && this.option.details && this.option.details.needBreak && this.option.details.needBreak()) {
            return
        }
        var path = ''

        if (e.keyCode == 37 || e.keyCode == 39 || e.keyCode == 13 || e.keyCode == 108 || e.keyCode == 9 || e.keyCode == 38 || e.keyCode == 40) {
            path = utils.path.findPathByEvent(e)
            if (!path || path.indexOf(',') == -1) return
        }

        //37:左键
        if (e.keyCode == 37) {
            if (!utils.dom.cursorAtBegin(e)) return
            this.moveEditCell(path, 'left')
            return
        }

        //39:右键 13:回车 108回车 tab:9
        if (e.keyCode == 39 || e.keyCode == 13 || e.keyCode == 108 || e.keyCode == 9) {

            // 应该只有右键的时候，才会去判断光标是否已经到了文本的末端
            // 回车键、tab键不需要判断，直接切换
            if (e.keyCode == 39 && !utils.dom.cursorAtEnd(e)) return
            if (path) {
                let columnGetter = this.metaAction.gm(path)
                if (columnGetter) {
                    if (columnGetter.noTabKey == true) {
                        return
                    }
                }
            }

            console.log('decoratorpath:' + path)
            this.moveEditCell(path, 'right')
            return
        }

        //38:上键
        if (e.keyCode == 38) {
            this.moveEditCell(path, 'up')
            return
        }

        //40:下键
        if (e.keyCode == 40) {
            this.moveEditCell(path, 'down')
            return
        }

    }

    moveEditCell(path, action) {
        const cellInfo = this.getCellInfo(path)
        this.moveCell(cellInfo, action, path)
    }

    moveCell(cellInfo, action, path) {
        var cellIsReadonly = () => {
            return false
        }

        const gridNames = Object.keys(this.option)

        for (var name of gridNames) {
            if (path.indexOf(name) != -1 && this.option[name].cellIsReadonly) {
                cellIsReadonly = this.option[name].cellIsReadonly
            }
        }

        const position = utils.matrix.move(cellInfo.rowCount, cellInfo.colCount, { x: cellInfo.x, y: cellInfo.y }, action)

        if (position.x === cellInfo.x && position.y === cellInfo.y) {
            return
        }
        if (cellIsReadonly(position, path, this.metaAction.gf)) {
            this.moveCell({ ...cellInfo, ...position }, action, path)
        } else {
            this.focusCell({ ...cellInfo, ...position }, path)
        }
    }

    /**
     * focus前，需要手动触发onblur，否则在fixed-data-table下，Onblur失效
     */

    compareFocusCell(path) {
        let oldFocusFieldPath = this.metaAction.gf('data.other.focusFieldPath')
        return path != oldFocusFieldPath
    }

    focusCell(position, path, e) {
        const gridNames = Object.keys(this.option)
        let colPathPrefix, other
        for (let name of gridNames) {
            if (path.indexOf(name) != -1) {
                colPathPrefix = this.getColPathPrefix(path, name)
                other = {
                    'data.other.focusFieldPath': `${colPathPrefix}${this.getColNames(name)[position.x]}.cell.cell,${position.y}`,
                    [`data.other.${name}ScrollToRow`]: position.y,
                    [`data.other.${name}ScrollToColumn`]: position.x + 1
                }
                this.injections.reduce('setOther', other)
            }
        }
        this.cellAutoFocus(position, path)
        return false
    }

    getColPathPrefix(path, gridName) {
        return path.substring(0, path.indexOf(gridName)) + gridName + '.columns.'
    }

    getCellInfo(path) {
        if (!this.option)
            return

        const parsedPath = utils.path.parsePath(path)
        const gridNames = Object.keys(this.option)

        for (var name of gridNames) {
            if (path.indexOf(name) != -1) {
                let colPathPrefix = this.getColPathPrefix(path, name)
                const rowCount = this.metaAction.gf(this.option[name].path).size
                const colCount = this.getColNames(name).length
                var colName = parsedPath.path
                    .replace(colPathPrefix, '')
                    .replace('.cell.cell', '')
                    .replace(/\s/g, '')

                return {
                    x: this.getColNames(name).findIndex(o => o == colName),
                    y: Number(parsedPath.vars[0]),
                    colCount,
                    rowCount,
                }
            }
        }
    }


    cellAutoFocusOut = (position, path) => {
        utils.dom.gridCellAutoFocusOut(this.component, '.editable-cell', position, path)
    }

    cellAutoFocus = (position, path) => {
        window.setTimeout(() => {
            utils.dom.gridCellAutoFocus(this.component, '.editable-cell', position, path)
        }, 0)
    }

    getCellClassName = (path, align, gridName) => {
        if (!this.option)
            return
        if (!(typeof gridName == 'string' && gridName)) {
            gridName = Object.keys(this.option)[0]
        }

        const defaultClsName = this.option[gridName].cellClassName
        let clsName = this.metaAction.isFocus(path) ? `${defaultClsName} editable-cell` : ''
        if (typeof (align) == "string") {
            clsName += ` ${defaultClsName}-${align}`
        }
        //console.log('test:' + clsName)
        return clsName
    }

    dateOpenChange = (status) => {
        if (status) return
        const editorDOM = ReactDOM.findDOMNode(this.component).querySelector(".editable-cell")
        if (!editorDOM) return

        if (editorDOM.className.indexOf('datepicker') != -1) {
            const input = editorDOM.querySelector('input')
            input.focus()
        }
    }

    initColumnResize = (appPath, meta) => {
        if (window.localStorage) {
            if (appPath) {
                appPath = appPath.replace(/\//g, '-')
            }
            else return
            let htCols = JSON.parse(localStorage.getItem(appPath))

            if (htCols && htCols.cols) {
                htCols.cols.map((ele, i) => {
                    if (htCols.width[i] && ele) {
                    }

                })
            }

            return meta
        }
    }

    setColumnResize = (option) => {
        this.injections.reduce('setColumnResize', option)
    }

    addRow = (gridName) => (ps) => {
        this.injections.reduce('addRowBefore', gridName, ps.rowIndex)
        this.injections.reduce('addRow', gridName, ps.rowIndex)
    }

    //增行在所在行下侧
    addBottomRow = (gridName, maxLength) => (ps) => {
        if (typeof (maxLength) == "number") {
            let details = this.metaAction.gf(`data.form.${gridName}`).toJS()
            if (details.length >= maxLength) {
                this.metaAction.toast('warning', '表单已达最大行数')
                return false
            }
        }
        this.injections.reduce('addRowBefore', gridName, ps.rowIndex)
        this.injections.reduce('addBottomRow', gridName, ps.rowIndex)
    }

    delRow = (gridName, delControl) => (ps) => {
        if (typeof (delControl) == "boolean") {
            let details = this.metaAction.gf(`data.form.${gridName}`).toJS()
            if (details.length < 2) {
                this.metaAction.toast('warning', '初始行无法删除')
                return false
            }
        }
        this.injections.reduce('delRowBefore', gridName, ps.rowIndex)
        if (typeof (delControl) == "boolean") {
            this.injections.reduce('delRow', gridName, ps.rowIndex, delControl)
            return false
        }
        this.injections.reduce('delRow', gridName, ps.rowIndex)
    }

    upRow = (gridName) => (ps) => {        
        if (ps.rowIndex == 0) {
            this.metaAction.toast('warning', '当前行已经是第一行')
            return
        }
        this.injections.reduce('moveRowToUpOrDown', gridName, ps.rowIndex, 0)
    }

    downRow = (gridName) => (ps) => {        
        let details = this.metaAction.gf(`data.form.${gridName}`)
        if (ps.rowIndex == details.size - 1) {
            this.metaAction.toast('warning', '当前行已经是最后一行')
            return
        }
        this.injections.reduce('moveRowToUpOrDown', gridName, ps.rowIndex, 1)
    }
}
