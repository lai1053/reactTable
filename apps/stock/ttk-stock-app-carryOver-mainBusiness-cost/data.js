export function getMeta() {
    return {
        name: "root",
        component: "::div",
        className:
            "ttk-stock-app-carryOver-mainBusiness-cost ttk-stock-app-inventory-saleOutStock1 ",
        children: ["{{$renderPage()}}"],
    }
}

export function getInitState() {
    return {
        data: {},
    }
}
