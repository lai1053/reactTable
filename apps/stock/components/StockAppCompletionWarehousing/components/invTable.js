import React from 'react'
import { Table } from 'edf-component'
import utils from 'edf-utils'

export default class invTable extends React.Component {
    constructor(props) {
        super(props)
        this.className = 'inv-table-' + new Date().valueOf()
    }
    componentDidMount() {
        if (this.className) {
            const tableDom = document.querySelector(`.${this.className}`)
            if (tableDom) {
                if (tableDom.addEventListener) {
                    tableDom.addEventListener('keydown', this.handleKeyDown.bind(this), false)
                } else if (tableDom.attachEvent) {
                    tableDom.attachEvent('onkeydown', this.handleKeyDown.bind(this))
                } else {
                    tableDom.keydown = this.handleKeyDown.bind(this)
                }
            }
        }
    }
    componentWillUnmount() {
        if (this.className) {
            const tableDom = document.querySelector(`.${this.className}`)
            if (tableDom) {
                if (tableDom.removeEventListener) {
                    tableDom.removeEventListener('keydown', this.handleKeyDown, false)
                } else if (tableDom.detachEvent) {
                    tableDom.detachEvent('onkeydown', this.handleKeyDown)
                } else {
                    tableDom.onkeydown = undefined
                }
            }
        }
    }
    handleKeyDown = (e) => {
        // console.log('handleKeyDown:', e.keyCode, e)
        var cellInfo = {}
        if (e.keyCode == 37 || e.keyCode == 39 || e.keyCode == 13 || e.keyCode == 108 || e.keyCode == 9 || e.keyCode == 38 || e.keyCode == 40) {
            cellInfo = this.getCellInfo(e)
            e.target && this.cellAutoFocusOut(e.target, cellInfo.rootDiv)
            e.preventDefault && e.preventDefault()
        }
        //37:左键
        if (e.keyCode == 37) {
            if (!utils.dom.cursorAtBegin(e)) return
            this.moveEditCell(cellInfo, 'left')
            return
        }
        //39:右键 13:回车 108回车 tab:9
        if (e.keyCode == 39 || e.keyCode == 13 || e.keyCode == 108 || e.keyCode == 9) {
            // 应该只有右键的时候，才会去判断光标是否已经到了文本的末端
            // 回车键、tab键不需要判断，直接切换
            if (e.keyCode == 39 && !utils.dom.cursorAtEnd(e)) return
            this.moveEditCell(cellInfo, 'right')
            return
        }
        //38:上键
        if (e.keyCode == 38) {
            this.moveEditCell(cellInfo, 'up')
            return
        }
        //40:下键
        if (e.keyCode == 40) {
            this.moveEditCell(cellInfo, 'down')
            return
        }
    }
    handleMouseOut = () => {
        const editCells = document.querySelectorAll(`.${this.className} .editable-cell`)
        (editCells || []).forEach(item => {
            if (item && item.className)
                item.className = item.className.split(' ').filter(f => f !== 'mouse-out').join(' ')
        })
    }
    moveEditCell = (cellInfo, action) => {
        let rowIndex = cellInfo.rowIndex,
            colIndex = cellInfo.colIndex,
            editCells = document.querySelectorAll(`.${this.className} .editable-cell`),
            dataRows = this.props.dataSource && this.props.dataSource.length || 1,
            colNums = Math.floor(editCells.length / dataRows),
            index = -1,
            container = null
        switch (action) {
            case 'up':
                rowIndex--
                break
            case 'down':
                rowIndex++
                break
            case 'left':
                colIndex--
                break
            case 'right':
                colIndex++
                break
        }
        index = (rowIndex) * colNums + colIndex - 5
        index = index < 0 ? 0 : index
        index = index >= dataRows*2 - 1 ? dataRows*2 - 1 : index
        if (index > -1 && editCells[index]) {
            container = editCells[index]
            if (container.attributes.disabled && (container.attributes.disabled.value === '' || container.attributes.disabled.value === 'disabled')) {
                this.moveEditCell({ rowIndex, colIndex }, action)
            } else {
                this.cellAutoFocus(container)
            }
        } else {
            return
        }
    }
    getCellInfo = (e) => {
        if (e && e.path && Array.isArray(e.path)) {
            let trObj = e.path.find(f => f.nodeName === 'TR'),
                tdObj = e.path.find(f => f.nodeName === 'TD')
            return {
                rowIndex: trObj && trObj.rowIndex || 0,
                colIndex: tdObj && tdObj.cellIndex || 0,
                rootDiv: tdObj.children && tdObj.children[0] || null,
            }
        }
        return {}
    }
    cellAutoFocus = (editorDOM) => {
        if (!editorDOM) return

        if (editorDOM.className.indexOf('input') != -1) {
            if (editorDOM.getAttribute('path')) {
                if (editorDOM.getAttribute('path').indexOf('creditAmount') > -1 || editorDOM.getAttribute('path').indexOf('debitAmount') > -1) {
                    window.setTimeout(function() {
                        editorDOM.blur()
                        editorDOM.select()
                        return
                    }, 10)

                }
            }
            if (editorDOM.select) {
                editorDOM.select()
            } else {
                const input = editorDOM.querySelector('input')
                input && input.select()
            }
            return
        }

        if (editorDOM.className.indexOf('select') != -1) {
            editorDOM.click()
            const input = editorDOM.querySelector('input')
            input && input.select()
            return
        }

        if (editorDOM.className.indexOf('datepicker') != -1) {
            const input = editorDOM.querySelector('input')
            input.click()
            return
        }

        if (editorDOM.className.indexOf('checkbox') != -1) {
            const input = editorDOM.querySelector('input')
            input.focus()
            return
        }

        if (editorDOM.className.indexOf('cascader') != -1) {
            editorDOM.click()
            const input = editorDOM.querySelector('input')
            input && input.select()
            return
        }
        if (editorDOM.className.indexOf('editable-cell') > -1) {
            editorDOM.className = editorDOM.className.split(' ').filter(f => f !== 'mouse-out').join(' ')
            const input = editorDOM.querySelector('.input_container_input')
            input && input.click()
            input && input.focus()
            return
        }
    }
    cellAutoFocusOut = (editorDOM, rootDiv) => {
        if (!editorDOM) return
        if (editorDOM.className.indexOf('input') != -1) {
            editorDOM.blur()
        }
        if (rootDiv) {
            rootDiv.className += ' mouse-out'
        }
    }
    render() {
        return (
            <Table 
                {...this.props}
                className={this.props.className+' '+this.className}
            />
        )
    }
}