export const columnData = [
    {
        id:'hwmc',
        caption:'商品名称',
        width:290
    },{
        id:'ggxh',
        caption: '规格型号',
        
        width:120
    },{
        id:'dw',
        caption:'单位',
        
        width:120
    },{
        id:'xxfp',
        caption:'销项发票',
        width:240,
        children:[
            {
                caption:'金额',
                fieldName:'xxje',
                
                isSubTitle: true,
                wdith:120
            }, {
                caption:'数量',
                fieldName:'xxsl',
                
                isSubTitle: true,
                wdith:120
            }
        ]
    },{
        id:'jxfp',
        caption:'进项发票',
        width:240,
        children:[
            {
                caption:'金额',
                fieldName:'jxje',
                
                isSubTitle: true,
                wdith:120
            }, {
                caption:'数量',
                fieldName:'jxsl',
                
                isSubTitle: true,
                wdith:120
            }
        ]
    },{
        id:'balance',
        caption:'差额',
        width:240,
        children:[
            {
                caption:'金额',
                fieldName:'ceje',
                
                isSubTitle: true,
                wdith:120
            }, {
                caption:'数量',
                fieldName:'cesl',
                
                isSubTitle: true,
                wdith:120
            }
        ]
    }
]