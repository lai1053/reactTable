import React from 'react'
import { Tree, Input } from 'antd';
import cloneDeep from 'lodash.clonedeep'
const { TreeNode } = Tree;
const Search = Input.Search;
// import { fromJS, toJS } from 'immutable'
const getChildByKey = (array, key, id = 'spbm', pid = 'parentSpbm') => {
    let data = cloneDeep(array)
    let result = [],
        hash = {}
    data.forEach((item, index) => {
        if (item[id] == item[pid]) {
            item[pid] = null
        }
        if (item[id] == key) {

            hash[item[id]] = { ...item }
        }
    })

    data.forEach((item, index) => {
        let hashVP = hash[item[pid]]
        if (hashVP) {
            result.push({ ...item })
            hash[item[id]] = { ...item }
        }
    })
    return result
}

const arrayToTree = (array, id = 'spbm', pid = 'parentSpbm', title = 'spmc', children = 'children') => {
    let data = cloneDeep(array)
    let result = []
    let hash = {}
    data.forEach((item, index) => {
        if (item[id] == item[pid]) {
            item[pid] = null
        }
        hash[data[index][id]] = data[index]
    })
    data.forEach((item) => {
        let hashVP = hash[item[pid]]
        if (hashVP) {
            !hashVP[children] && (hashVP[children] = [])
            hashVP[children].push(item)
        } else {
            result.push(item)
        }
    })
    return result
};
const getParentKey = (key, tree) => {
    let parentKey;
    for (let i = 0; i < tree.length; i++) {
        const node = tree[i];
        if (node.children) {
            if (node.children.some(item => item.key === key)) {
                parentKey = node.key;
            } else if (getParentKey(key, node.children)) {
                parentKey = getParentKey(key, node.children);
            }
        }
    }
    return parentKey;
};

class SearchTree extends React.Component {
    state = {
        expandedKeys: [],
        searchValue: '',
        autoExpandParent: true,
        treeData: arrayToTree(this.props.data)
    };

    onExpand = expandedKeys => {
        this.setState({
            expandedKeys,
            autoExpandParent: false,
        });
    };

    onChange = e => {
        const value = e.target.value;
        const expandedKeys = this.props.data
            .map(item => {
                if (item.title.indexOf(value) > -1) {
                    return getParentKey(item.key, this.state.treeData);
                }
                return null;
            })
            .filter((item, i, self) => item && self.indexOf(item) === i);
        this.setState({
            expandedKeys,
            searchValue: value,
            autoExpandParent: true,
        });
    };
    onSelect = (selectedKeys, info) => {
        const { onSelect, data } = this.props
        if (selectedKeys[0] && onSelect) {
            if (info.node.props.sfyxj == 'N') {
                onSelect(data.filter(f => f.spbm == selectedKeys[0]))
                return
            }
            let result = getChildByKey(data, selectedKeys[0])
            // console.log('selected1', info.node.props.sfyxj)
            onSelect(result.filter(f => f.sfyxj == "N"))
        }
    };
    render() {
        const { searchValue, expandedKeys, autoExpandParent, treeData } = this.state;

        const loop = data => data.map(item => {
            const index = item.title.indexOf(searchValue);
            const beforeStr = item.title.substr(0, index);
            const afterStr = item.title.substr(index + searchValue.length);
            const title = index > -1 ? (
                <span>
                    {beforeStr}
                    <span 
                        style={{
                          color: '#f50'
                        }}>
                        {searchValue}
                    </span>
                    {afterStr}
                </span>
            ) : (
                <span>{item.title}</span>
            );
            if (item.children) {
                return (
                    <TreeNode key={item.key} title={title} sfyxj={item.sfyxj}>
                        {loop(item.children)}
                    </TreeNode>
                );
            }
            return <TreeNode key={item.key} title={title} sfyxj={item.sfyxj}/>;
        });
        return (
            <div className="-search-tree">
                <Search style={{
                    marginBottom: 8
                }} placeholder="Search" onChange={this.onChange} />
                <Tree
                    showLine
                    onExpand={this.onExpand}
                    expandedKeys={expandedKeys}
                    autoExpandParent={autoExpandParent}
                    onSelect={this.onSelect}
                >
                    {loop(treeData)}
                </Tree>
            </div>
        );
    }
}
export default SearchTree