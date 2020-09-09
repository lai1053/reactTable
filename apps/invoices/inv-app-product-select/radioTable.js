import React from 'react'
import { Table } from 'antd';

const columns = [{
        title: '商品名称',
        dataIndex: 'spmc',
        width: 276,
        className: 'center',
    },
    {
        title: '商品编码',
        dataIndex: 'spbm',
        width: 207,
        className: 'center',
    },
    {
        title: '税率(%)',
        dataIndex: 'mrslv',
        width: 206 - 64,
        className: 'right',
    },
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
        const { selectedRowKeys, data } = this.props;
        // const data = this.props.data || []
        // console.log('selectedRowKeys', data)
        const rowSelection = {
            selectedRowKeys,
            type: 'radio',
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
            scroll = { { y: 340 } }
            size = 'small'
            pagination = { false }
            onRow = {
                record => {
                    return {
                        onClick: event => { 
                            // console.log('onRow-click', record);
                            if(this.props.callback){
                                this.props.callback([record.key])
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