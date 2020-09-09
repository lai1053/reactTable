// import utils from 'edf-utils'
import React from 'react'

export default class action extends React.Component {
    constructor(props) {
        super(props);
        // console.log('props:', props)
        this.tableDecoratorOption = props.tableDecoratorOption
    }
    componentDidMount() {
        // console.log('tableDecorator did mount:', this.props)
        let tableDecoratorOption = this.tableDecoratorOption
        if (!tableDecoratorOption && this.props.tableDecoratorOption) {
            tableDecoratorOption = this.props.tableDecoratorOption
        }
        if (tableDecoratorOption && tableDecoratorOption.keyDownClass) {
            const tableDom = document.querySelector(tableDecoratorOption.keyDownClass)
            if (tableDom) {
                // tableDom.addEventListener('keydown',this.handleKeyDown,false)
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
        if (this.tableDecoratorOption && this.tableDecoratorOption.keyDownClass) {
            const tableDom = document.querySelector(this.tableDecoratorOption.keyDownClass)
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
        // console.log('handleKeyDown:', e)
        //37:左键
        if (e.keyCode == 37) {
            // if (!utils.dom.cursorAtBegin(e)) return
            // this.moveEditCell(path, 'left')
            return
        }

        //39:右键 13:回车 108回车 tab:9
        if (e.keyCode == 39 || e.keyCode == 13 || e.keyCode == 108 || e.keyCode == 9) {

            // 应该只有右键的时候，才会去判断光标是否已经到了文本的末端
            // 回车键、tab键不需要判断，直接切换
            // if (e.keyCode == 39 && !utils.dom.cursorAtEnd(e)) return
            // if (path) {
            //     let columnGetter = this.metaAction.gm(path)
            //     if (columnGetter) {
            //         if (columnGetter.noTabKey == true) {
            //             return
            //         }
            //     }
            // }
            console.log('enter:', this);
            // this.moveEditCell('right')
            return
        }

        //38:上键
        if (e.keyCode == 38) {
            // this.moveEditCell(path, 'up')
            return
        }

        //40:下键
        if (e.keyCode == 40) {
            // this.moveEditCell(path, 'down')
            return
        }
    }
}