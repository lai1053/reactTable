import React from "react"
import VirtualTable from "./VirtualTable/index"

class Vtable extends React.Component {
    constructor(props){
        super(props)
        this.metaAction = this.props.metaAction
        this.sumWidth = 0;
        this.columnsData = [] ;
        this.state ={
            tableSize: this.props.tableSize,
            scrollTop:this.props.scrollTop,
            scrollRemember: this.props.scrollRemember
        },
        this.tableRef = React.createRef();
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
    }

    render() {
        const {tableSize,tableSource,columns} = this.props;
        return (<VirtualTable
            ref={this.tableRef}
            width={tableSize.tableW}
            height={tableSize.tableH}
            className='ttk-es-app-sbselist-Body'
            bordered
            dataSource={tableSource}
            columns={columns}
            scroll={{ y: (tableSize.tableH-88), x: (tableSize.tableW<1340) ? 1340 : tableSize.tableW }}
            pagination={false}
        />)
    }
}

export default Vtable