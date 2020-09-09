import React from 'react'
import { Table, Radio, Checkbox, Button } from 'edf-component';
import { fromJS } from 'immutable';
import renderColumns from '../utils/renderColumns'
class AccountingPlatform extends React.Component {
    constructor(props){
        super(props)
        this.state={
            loading: false,
            tableOption: {},
            list:[],
            checked: 'view',
            tableOption: {},
            flag: '',
            num: 1, //菜单一共几级
            activeKey: '1',
            columns:[
                {filedName: 'modlue', filedTitle: '模块', filedParentName: null},
                // {filedName: 'permissions', filedTitle: '功能权限', filedParentName: null}
            ],
        }
        this.num= 1
    }

    componentDidMount = () => {
        this.load()
    }

    load = async() => {
        this.setState({
            loading: true
        })
        const result = await this.props.tabload()
        let {activeKey,columns} = this.props
        let list = this.props.list
        this.renderLoad(activeKey, columns, list)
    }

    renderLoad = (activeKey, columns,list) => {
        // 计算一共几级菜单this.num
        let arr = [], newColumns=[]
        let num=list.find(o=>o.code.length>5);
        if(num){
            num=3
        }else{
            num=2
        }
        for (let i = 0; i < num; i++) {
            let obj = {
                filedName: `content${i + 1}`, filedTitle: `模块${i + 1}`, filedParentName: 'modlue'
            }
            newColumns.push(obj)
        }

        this.setState({
            list,
            activeKey,
            columns: columns.concat(newColumns)
        })


        // 计算滚动条
        setTimeout(() => {
            const res = this.props.getTableScroll()
            this.setState({
                tableOption: res
            })
        },20)
        this.setState({
            loading: false
        })
    }

    handleList = (arr, list) => {
        let arr1 = []
        if (arr && arr.length) {
            arr.forEach(item => {
                const obj = list.find(ele => ele.parentId == item.id)
                arr1.push(obj)
            })

            if (arr1 && arr1.length) {
                this.num+=1
                this.handleList()
            }
        }
    }

    componentWillReceiveProps = async(nextProps)=> {
        let {flag, activeKey} = this.state
        this.num = 1
        if (nextProps.flag != flag) {
            let {activeKey, columns, list} = nextProps
            this.setState({
                loading: true
            })
            this.renderLoad(activeKey, columns, list)
        }

        if (nextProps.activeKey != activeKey) {

            let {activeKey, columns, list} = nextProps
            this.setState({
                loading: true
            })
            this.renderLoad(activeKey, columns, list)
        }
    }


    handleChange = (e, rowData, index) => {
        let list = this.state.list
        list.forEach(item => {
            if(item.id == rowData.id) {
                item.isWrite =e.target.value
            }
        })
        this.props.saveCurrentList(list)
        this.setState({
            list: list
        })
    }



    handleCheckChange = (e, rowData, index, name, colIndex) => {
        let {list, columns} = this.state
        list[index].isCheck = e.target.checked
        if (e.target.checked) {
            list[index].isWrite = 200 
        } else {
            list[index].isWrite = 100
        }

        // colIndex = colIndex || 0
        let arr = []
        list.forEach(o => {
            // if(o.code.slice(0, 2 * colIndex + 1) === rowData.code.slice(0, 2 * colIndex + 1)) {

            if(String(o.id).indexOf(rowData.id) > -1 && rowData.id != 1) {
                o.isCheck = e.target.checked
                if (e.target.checked) {
                    o.isWrite = 200 
                } else {
                    o.isWrite = 100
                }
            }

            if(o.parentId == rowData.parentId) {
                arr.push(o)
            }
        })

        let num = 0
        for(let i = 0;i<arr.length;i++) {
            if(arr[i].isWrite == 100) {
                num ++
            }
        }
        list.forEach(o => {
            if(num == arr.length) {
                if(o.id == arr[0].parentId) {
                    o.isWrite = 100 
                    o.isCheck = false 
                }
            }else {
                if(o.id == arr[0].parentId) {
                    o.isWrite = 200 
                    o.isCheck = true
                }
            }
        })

        this.props.saveCurrentList(list)
        this.setState({
            list: list
        })

        this.handleCascadeCheckChange(rowData,e.target.checked)
    }
    //级联保存 勾选认证 汇算清缴
    handleCascadeCheckChange = (rowData,checked) => {
        switch (rowData.id){
            case 650:this.props.saveCascadeList(12014,checked,'2');break;
            case 12014:this.props.saveCascadeList(650,checked,'1');break;
            case 30015:this.props.saveCascadeList(1200522,checked,'2');break;
            case 1200522:this.props.saveCascadeList(30015,checked,'1');break;
        }
    }


    tableColumns = () => {
        let {list, columns} = this.state, 
        jsbz = this.props.jsbz
        let {activeKey, treeSelectedKey} = this.props
        return renderColumns(this, columns, list, jsbz, activeKey)
    }

    handleSave = async() => {
        this.setState({
            loading: true
        })
        await this.props.handleSave()
        this.setState({
            loading: false
        })
    }

    handleClick = async () => {
        this.setState({
            loading: true
        })
        await this.props.handleClick()
        this.setState({
            loading: false
        })
    }

    render(){
        let {loading, tableOption} = this.state
        let {activeKey, treeSelectedKey, jsbz,list} = this.props

        let disable = jsbz == '001' ? false : true
        
        return(
            <div className='wrap1'>
                <Table 
                    emptyShowScroll={true}
                    className={`table${activeKey || 1}`}
                    // key={`table${activeKey || 1}${treeSelectedKey[0] || Math.random()*10000000}`}
                    key={`table${activeKey || 1}${treeSelectedKey[0]}`}
                    pagination= {false}
                    allowColResize= {false}
                    enableSequenceColumn={false}
                    loading={loading}
                    bordered={true}
                    scroll={tableOption}
                    dataSource={list}
                    noDelCheckbox={true}
                    columns={this.tableColumns()}
                />
                <div className='ttk-es-app-postauthority-footer'>
				{
					disable ? <span style={{ color: '#dedede' }}>恢复默认</span> :
						<a href="javascript:;" onClick={() => this.handleClick()}>恢复默认</a>
				}
				<Button type='primary' onClick={() => this.handleSave()}>保存</Button>
			</div>
            </div>
        )
    }
}

export default AccountingPlatform