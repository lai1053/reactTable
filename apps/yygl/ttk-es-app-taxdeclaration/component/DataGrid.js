import React from "react"
import {
    DataGrid,
    Icon,
} from "edf-component"
import { fromJS, toJS } from "immutable"
import VirtualTable from "./VirtualTable/index"
const Cell = DataGrid.Cell;
let columns = [
    {
        width: 165,
        dataIndex: "name",
        title: "客户名称",
        align: 'left',
        isVisible: true,
        flexGrow: 0,
    },
    {
        width: 70,
        dataIndex: "helpCode",
        title: "助记码",
        align: 'center',
        isVisible: true,
        flexGrow: 1,
    },
    {
        width: 63, 
        dataIndex: "zzs",
        title: "增值税",
        align: 'center',
        isVisible: true,
        flexGrow: 1,
    },
    {
        dataIndex: "fjsf",
        title: "附加税（费）",
        isVisible: true,
        children: [
            {
                key:"cswhjsf",
                width: 63,
                dataIndex: "cswhjsf",
                align: 'center',
                title: "城建税",
                
            },{
                key:"jyffj",
                width: 63,
                align: 'center',
                dataIndex: "jyffj",
                title: "教育附加",
               
            },{
                key:"dfjyffj",
                width: 63,
                align: 'center',
                dataIndex: "dfjyffj",
                title: "地方附加",
               
            },
        ]
    },
    {
        width: 63,
        dataIndex: "yhs",
        title: "印花税",
        align: 'center',
        isVisible: true,
        flexGrow: 1,
    },
    {
        // dataIndex: "whjsf",
        dataIndex: "whsyjsfyl",
        title: "文化建设费",
        isVisible: true,
        children:[
            {
                width: 63,
                title: '娱乐',
                key: 'whsyjsfyl',
                dataIndex: "whsyjsfyl",
                align: 'center',
            },{
                width: 63,
                title: '广告',
                key: 'whsyjsfgg',
                dataIndex: "whsyjsfgg",
                align: 'center',
            }
        ]
    },
    {
        width: 63,
        dataIndex: "qysds",
        isVisible: true,
        title: "企业所得税",
        align: 'center',
        flexGrow: 1,
    },
    {
        dataIndex: "kjgrsds",
        title: "个税",
        isVisible: true,
        children:[
            {
                width: 63,
                dataIndex: "kjgrsds",
                title: '代扣代缴',
                key: 'kjgrsds',
                align: 'center',
            },{
                width: 63,
                dataIndex: "scjygrsds",
                title: '生产经营',
                key: 'scjygrsds',
                align: 'center',
            }
        ]
    },
    {
        width: 63,
        dataIndex: "xfs",
        align: 'center',
        title: "消费税",
        isVisible: true,
        flexGrow: 1,
    },
    {
        width: 63,
        dataIndex: "cwbb",
        align: 'center',
        title: "财务报表",
        isVisible: true,
        flexGrow: 1,
    },
    {
        width: 63,         
        dataIndex: "cbj",
        title: "残保金",
        align: 'center',
        isVisible: true,
        flexGrow: 1,
    },
    {
        width: 63,
        dataIndex: "sljj",
        title: "水利基金",
        align: 'center',
        isVisible: true,
        flexGrow: 1,
    },
    {
        width: 63,
        dataIndex: "ghjf",
        title: "工会经费",
        align: 'center',
        isVisible: true,
        flexGrow: 1,
    },
    {
        width: 63,
        dataIndex: "hzzt",
        title: "汇总状态",
        align: 'center',
        isVisible: true,
        flexGrow: 1,
    },
    {
        width: 80,
        dataIndex: "option",
        isVisible: true,
        align: 'center',
        flexGrow: 0,
        fixed: 'right'
    }
]  

class EditableTable extends React.Component {
    constructor(props){
        super(props)
        this.metaAction = this.props.metaAction
        this.sumWidth = 0;
        this.columnsData = [] ;
        this.state ={
            selectedRowKeys:[],
            tableSize: {
                width: 1340,
                height:
                    (
                        document.querySelector('.ttk-es-app-taxdeclaration-tablediv') ||
                        document.body
                    ).offsetHeight-
                    this.scrollHeight || 0
            },
            scrollTop:this.props.scrollTop,
            scrollRemember: this.props.scrollRemember
        },
        this.tableRef = React.createRef();
    }

    componentDidMount = () => {
        if (window.addEventListener) {
            window.addEventListener('resize', this.onResize, false)
        } else if (window.attachEvent) {
            window.attachEvent('onresize', this.onResize)
        } else {
            window.onresize = this.onResize
        }
        this.onResize()
    }

    //切换页签记住滚动条位置
    componentDidUpdate(prevProps,prevState) {
        if(prevProps.scrollTop>0 && prevProps.scrollRemember){
            if(this.tableRef && this.tableRef.current){
                this.tableRef.current.bodyRef.current.scrollTop = this.state.scrollTop;
            }
        }
    }

    componentWillUnmount = () => {
        if(this.tableRef && this.tableRef.current){
            this.metaAction.sf('data.scrollTop',this.tableRef.current.bodyRef.current.scrollTop);
        }
        if (window.removeEventListener) {
            window.removeEventListener('resize', this.onResize, false)
            document.removeEventListener('keydown', this.keyDown, false)
        } else if (window.detachEvent) {
            window.detachEvent('onresize', this.onResize)
            document.detachEvent('keydown', this.keyDown)
        } else {
            window.onresize = undefined
        }
    }

    //重新计算宽高
    onResize = () => {
        const ele = document.querySelector('.ttk-es-app-taxdeclaration-tablediv')
        if(ele){
            let width = ele && ele.offsetWidth || 0
            let height = ele && ele.offsetHeight || 0
            // width = this.dealColWidth('1',width)
            const obj = {width, height}
            // console.log(obj)
            this.setState({
                tableSize:obj
            })
        }else{
            setTimeout(() => {
                this.onResize()
            }, 100)
            return
        }
    }

    dealColWidth = (type,tableW,columnsData) => {
        console.log('type',type);
        console.log('tableW',tableW);
        console.log('---------------------------');
        // 1340为初始宽度，16为总列数
        if(tableW && tableW < 1340) {
            return tableW
        }
        if(!(this.state.tableSize.width<1340) && type == '2'){
            return false
        }
        let sumWidthOne = 0, col = [], num = 0, columnsSumWidth = 0, increment = 0;
        if(!columnsData || !columnsData.length>0){
            col = columns
            num = 19
        }else{
            col = columnsData
            col.map(item=>{
                if(item.children){
                    item.children.map(el=>{
                        columnsSumWidth += el.width
                    })
                    num += item.children.length
                }else{
                    columnsSumWidth += item.width
                    num++
                }
            })
        }
        // increment = Math.floor((tableW - this.state.tableSize.width) / 19)
        if(type=='1'){
            increment = Math.floor((tableW - this.state.tableSize.width) / num)
        }else{
            
            columnsSumWidth += 50;
            increment = Math.floor((this.state.tableSize.width - columnsSumWidth) / num)
        }
        for(const item of columns) {
            if(item.children) {
                for(const el of item.children) {
                    el.width += increment
                    sumWidthOne += el.width
                }
            } else if(item.dataIndex=='name'){
                item.width += increment*3
                sumWidthOne += item.width
            } else if(item.dataIndex=='helpCode' || item.dataIndex=='option'){
                sumWidthOne += item.width
            }else{
                item.width += increment
                sumWidthOne += item.width
            }
        }
        if(type=='1'){
            return sumWidthOne+50
        }else{
            return col
        }   
        // return sumWidthOne+50   
	}

    renderIcon(text,record) {
        let type = null
        if(record.isText){
            switch(text) {
                case '100': type = '未申报'; break;//未申报
                case '210': type = '已申报'; break;
                case '310': type = '已完成'; break;
                default:  type = '无任务';
            }
    
            return <span>{type}</span>
        }else{
            switch(text) {
                case '100': type = 'XDZzhuangtai-wurenwu'; break;//未申报
                case '210': type = 'XDZzhuangtai-yishenbao'; break;
                case '310': type = 'XDZzhuangtai-yiwancheng'; break;
                default:  type = '';
            }
    
            return <Icon fontFamily='edficon' type={type} className={type}/>
        }
    }

    renderIcon1(text,record) {
        let type = null
        if(record.isText){
            switch(text) {
                case '100': type = '未完成'; break;//未申报
                case '310': type = '已完成'; break;
                default:  type = '无任务';
            }
    
            return <span>{type}</span>
        }else{
            switch(text) {
                case '100': type = 'XDZzhuangtai-wurenwu'; break;//未申报
                case '310': type = 'XDZzhuangtai-yiwancheng'; break;
                default:  type = '';
            }
    
            return <Icon fontFamily='edficon' type={type} className={type}/>
        }
    }

    showTableSetting = ({ value, data }) => {
        this.props.showTableSetting({ value, data });
    }

    //跳转单户带菜单
    handleAClick = (name,orgId,areaType) =>{
        this.props.handleAClick1(name,orgId,areaType);
    }

    getColumns() {
        let resArr = [],isSaveTableCol = this.metaAction.gf('data.isSaveTableCol');
        columns.forEach((item, index) => {
            if(item.children){
                const child = [] // 多表头
                item.children.map(subItem=>{
                    child.push({
                        title: subItem.title,
                        dataIndex: subItem.dataIndex,
                        key: subItem.dataIndex,
                        width: subItem.width,
                        align: subItem.align,
                        isVisible: item.isVisible,
                        flexGrow: item.flexGrow,
                        render: (text, record) => (
                            this.renderIcon(text,record)
                        ),
                    })
                })
                resArr.push({
                    title: item.title,
                    key: item.dataIndex,
                    align: 'center',
                    children: child,
                    isVisible: item.isVisible,
                    flexGrow: item.flexGrow,
                })
            }else{
                // if(item.dataIndex != 'name' || item.dataIndex != 'helpCode' || item.dataIndex != 'hzzt')
                if(item.dataIndex == 'option'){
                    let obj = {
                        name: item.dataIndex,
                        title: (
                            <div>
                                <span>{'操作'}</span>
                                    <Icon
                                        name="columnset"
                                        fontFamily='edficon'
                                        className='columnset'
                                        // type="shezhi"
                                        type='shezhi'
                                        onClick={() => this.showTableSetting({ value: true })}
                                    />
                            </div>
                        ),
                        dataIndex: item.dataIndex,
                        width: item.width,
                        key: item.dataIndex,
                        align: item.align,
                        isVisible: item.isVisible,
                        flexGrow: item.flexGrow,
                        fixed: 'right',
                        render: (text, row, index) => {
                            const { editable } = row
                            return (
                                <a href='javascript:;' onClick={() => this.handleAClick(row.name,row.orgId,row.areaType)}>进入清册</a>       
                            )
                        }
                    }
                    resArr.push(obj)
                }else if(item.dataIndex == 'hzzt'){
                    let obj = {
                        name: item.dataIndex,
                        title: item.title,
                        dataIndex: item.dataIndex,
                        width: item.width,
                        key: item.dataIndex,
                        align: item.align,
                        isVisible: item.isVisible,
                        flexGrow: item.flexGrow,
                        render: (text, record) => (
                            this.renderIcon1(text,record)
                        )
                    }
                    resArr.push(obj)
                }else if(item.dataIndex == 'name' || item.dataIndex == 'helpCode'){
                    let obj = {
                        name: item.dataIndex,
                        title: item.title,
                        dataIndex: item.dataIndex,
                        width: item.width,
                        key: item.dataIndex,
                        align: item.align,
                        isVisible: item.isVisible,
                        flexGrow: item.flexGrow,
                        render: (text, record) => (
                            <div
                            style={{
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                overflow:'hidden',
                                textAlign:'left'
                            }}
                            title={text || ""}
                            >
                                {text}
                            </div>
                        )
                    }
                    resArr.push(obj)
                }else{
                    let obj = {
                        name: item.dataIndex,
                        title: item.title,
                        dataIndex: item.dataIndex,
                        width: item.width,
                        key: item.dataIndex,
                        align: item.align,
                        isVisible: item.isVisible,
                        flexGrow: item.flexGrow,
                        render: (text, record) => (
                            this.renderIcon(text,record)
                        )
                    }
                    resArr.push(obj)
                }
            }
        })
        const tableSettingData = this.props.tableSettingData;
        if (Array.isArray(tableSettingData) && tableSettingData.length > 0) {
            let cols = []
            resArr.forEach(item => {
                let cell =
                    item.key === "id" || item.key === "option"
                        ? item
                        : tableSettingData.find(
                            f => f.fieldName === item.key && f.isVisible
                        )
                if (cell) {
                    // item.props.width = cell.width || item.props.width
                    cols.push(item)
                }
            })
            this.metaAction.sf('data.isSaveTableCol',false);
            return cols
        }
        this.metaAction.sf('data.isSaveTableCol',false);
        return resArr
    }

    onSelectChange = (selectedRowKeys, allArr, checked) => {
        this.setState({
            selectedRowKeys
        })
        let itemArr = [];
        selectedRowKeys.map(id=>{
            allArr.map((item,index)=>{
                if(item.id == id){
                    itemArr.push(allArr[index]);
                }
            })
        })
        this.props.checkboxChange(selectedRowKeys,itemArr);
    }

    render() {
        const {tableSize} = this.state,
            selectedRowKeys = this.props.selectedRowKeys,
            _columns = this.getColumns(),
            className = this.props.className,
            tableSource = this.props.data;
        const rowSelection = {
            selectedRowKeys,
            columnWidth: 40,
            onChange: e => this.onSelectChange(e,tableSource),
            hideDefaultSelections: true,
            getCheckboxProps: record => ({
                ...record,
                disabled: record.editable ? true : false
            })
        }
        const onRow = record => ({
            onClick: () => {
                console.log('click');
            }
        })
        return (<VirtualTable
             ref={this.tableRef}
             width={tableSize.width}
             height={tableSize.height}
             rowSelection={rowSelection}
             className={className}
             bordered
             dataSource={tableSource}
             columns={_columns}
             scroll={{ y: (tableSize.height-88), x: tableSize.width<1340 ? 1340 : tableSize.width }}
             pagination={false}
             rowKey="id"
             onRow={this.onRow}
        />)
    }
}

export default EditableTable