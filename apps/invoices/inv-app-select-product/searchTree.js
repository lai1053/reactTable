import React from "react"
import { Tree, Input, Spin } from "antd"
import cloneDeep from "lodash.clonedeep"
const { TreeNode } = Tree
const Search = Input.Search
import debounce from "lodash.debounce"
// import { fromJS, toJS } from 'immutable'

const getChildByKey = (array, key, id = "spbm", pid = "parentSpbm") => {
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

const arrayToTree = (
    array,
    id = "spbm",
    pid = "parentSpbm",
    title = "spmc",
    children = "children"
) => {
    let data = cloneDeep(array)
    let result = []
    let hash = {}
    data.forEach((item, index) => {
        if (item[id] == item[pid]) {
            item[pid] = null
        }
        hash[data[index][id]] = data[index]
    })
    data.forEach(item => {
        let hashVP = hash[item[pid]]
        if (hashVP) {
            !hashVP[children] && (hashVP[children] = [])
            hashVP[children].push(item)
        } else {
            result.push(item)
        }
    })
    return result
}
const getParentKey = (key, tree) => {
    let parentKey
    for (let i = 0; i < tree.length; i++) {
        const node = tree[i]
        if (node.children) {
            if (node.children.some(item => item.key === key)) {
                parentKey = node.key
            } else if (getParentKey(key, node.children)) {
                parentKey = getParentKey(key, node.children)
            }
        }
    }
    return parentKey
}

function tco(f) {
    var value
    var active = false
    var accumulated = []
    return function accumulator() {
        accumulated.push(arguments)
        if (!active) {
            active = true
            while (accumulated.length) {
                value = f.apply(this, accumulated.shift())
            }
            active = false
            return value
        }
    }
}
const treeToArray = tco((tree, arr) => {
    // let temp = JSON.parse(JSON.stringify(tree));
    // delete temp.children;
    tree.forEach(obj => {
        let item = {}
        if (obj.props && obj.props.spbm) item = obj.props
        else item = obj
        if (item.sfyxj === "N") {
            arr.push({
                key: item.spbm,
                title: item.spmc,
                spmcJc: item.spmcJc,
                kyzt: item.kyzt,
                parentSpbm: item.parentSpbm,
                sfyxj: item.sfyxj,
                spbm: item.spbm,
                spmc: item.spmc,
                mrslv: item.mrslv,
                zzssl: item.zzssl,
                slv: item.slv,
            })
        }
        if (Array.isArray(item.children)) treeToArray(item.children, arr)
    })
})

class SearchTree extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            expandedKeys: [],
            searchValue: "",
            autoExpandParent: true,
            treeData: arrayToTree(this.props.data),
            loading: false,
        }
        // this.onChangeDebounce = debounce(this.onChangeDebounce, 300)
        this.onSelectDebounce = debounce(this.onSelectDebounce, 500)
    }

    onExpand = expandedKeys => {
        this.setState({
            expandedKeys,
            autoExpandParent: false,
        })
    }
    onChangeDebounce = value => {
        // 找匹配项及其所有父级项
        // let expandedKeys = []
        // if (value) {
        //     expandedKeys = this.props.data.map(item => {
        //         if (item.title.indexOf(value) > -1) {
        //             return getParentKey(item.key, this.state.treeData);
        //         }
        //         return null;
        //     }).filter((item, i, self) => item && self.indexOf(item) === i);;
        // }
        // 只找匹配项
        let treeData = []
        if (value) {
            treeData = arrayToTree(
                this.props.data.filter(
                    f => f.title.indexOf(value) > -1 || f.spmcJc.indexOf(value) > -1
                )
            )
        } else {
            treeData = arrayToTree(this.props.data)
        }
        this.setState({
            expandedKeys: [],
            searchValue: value,
            autoExpandParent: false,
            treeData,
        })
    }
    onPressEnter = (value, event) => {
        this.onChangeDebounce(value)
    }
    onChange = e => {
        e.persist()
        this.onChangeDebounce(e.target.value)
    }
    onSelectDebounce = (selectedKeys, info) => {
        const { onSelect, data } = this.props
        if (selectedKeys[0] && onSelect) {
            let result = []
            if (info.node.props.sfyxj == "N") {
                result = data.filter(f => f.spbm == selectedKeys[0])
            } else {
                console.time("treeToArray")
                // treeToArray([info.node.props], result)
                result = getChildByKey(data, selectedKeys[0]).filter(f => f.sfyxj == "N")
                console.timeEnd("treeToArray")
            }
            this.setState({
                loading: false,
            })
            onSelect(result)
        }
    }
    onSelect = (selectedKeys, info) => {
        if (selectedKeys && selectedKeys[0] && info.selected) {
            this.setState({
                loading: true,
            })
            this.props.onSelect && this.props.onSelect(null)
            this.onSelectDebounce(selectedKeys, info)
        }
    }
    render() {
        const { searchValue, expandedKeys, autoExpandParent, treeData, loading } = this.state

        const loop = data =>
            data.map(item => {
                const index = item.title.indexOf(searchValue)
                const beforeStr = item.title.substr(0, index)
                const afterStr = item.title.substr(index + searchValue.length)
                const title =
                    index > -1 ? (
                        <span>
                            {beforeStr}
                            <span
                                style={{
                                    color: "#f50",
                                }}>
                                {searchValue}
                            </span>
                            {afterStr}
                        </span>
                    ) : (
                        <span>{item.title}</span>
                    )
                if (item.children) {
                    return (
                        <TreeNode {...item} key={item.key} title={title}>
                            {loop(item.children)}
                        </TreeNode>
                    )
                }
                return <TreeNode {...item} key={item.key} title={title} />
            })
        return (
            <div className="-search-tree">
                <Spin spinning={loading} delay={100} tip="正在查找...">
                    <Search
                        style={{
                            marginBottom: 8,
                        }}
                        placeholder="请输入商品名称或简称"
                        onSearch={this.onPressEnter}
                    />
                    <Tree
                        showLine
                        onExpand={this.onExpand}
                        expandedKeys={expandedKeys}
                        autoExpandParent={autoExpandParent}
                        onSelect={this.onSelect}>
                        {loop(treeData)}
                    </Tree>
                </Spin>
            </div>
        )
    }
}
export default SearchTree
