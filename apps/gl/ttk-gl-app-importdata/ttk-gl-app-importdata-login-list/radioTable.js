import React from 'react'
import { Table } from 'antd';

const columns = [
 {
        title:'序号',
        dataIndex: 'index',
        width:50,
        align:'center',
        className:'over',
    },{
        title:'账套编码',
        dataIndex: 'inventorycode',
        width: 90,
        align:'center',
        className:'over',
    },{
        title:'账套名称',
        width: 207,
        dataIndex: 'inventoryname',
        align:'center',
        className:'over',
    },{
        title:'年度',
        width: 150 - 64,
        dataIndex: 'inventoryClassName',
        align:'center',
        className:'over',
    }
];

class RadioTable extends React.Component {
    state = {
        // selectedRowKeys: [], // Check here to configure the default column
    };

    onSelectChange = selectedRowKeys => {
        // console.log('selectedRowKeys changed: ', selectedRowKeys);
        // this.setState({ selectedRowKeys });
        if (this.props.callback) {
            this.props.callback(selectedRowKeys)
        }
    };

    render() {
        let { selectedRowKeys, data, loading } = this.props;
        // const data = this.props.data || []
        const rowSelection = {
            selectedRowKeys,
            type: 'radio',
            title:"选择",
            onChange: this.onSelectChange,
            hideDefaultSelections: true,
            selections: false,
            onSelection: this.onSelection,
        };
        return <Table
            rowSelection={rowSelection}
            className = '-table'
            columns = { columns }
            dataSource = { data }
            scroll = { { y: 220 } }
            size = 'small'
            pagination = { false }
            loading={loading}
            onRow = {
                record => {
                    return {
                        onClick: event => { 
                            // console.log('onRow-click', record);
                            if(this.props.callback){
                                this.props.callback([Number(record.index)-1])
                            }
                            // this.setState({selectedRowKeys:[record.key]})
                        }
                    }
                }
            }
            bordered ></Table>;
    }
}
export default RadioTable