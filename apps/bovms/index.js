import bovms_app_funds from  './bovms-app-funds'
import bovms_app_guidePage from  './bovms-app-guidePage'
import bovms_app_memory_bank from  './bovms-app-memory-bank'
import bovms_app_order_list from  './bovms-app-order-list'
import bovms_app_purchase_list from  './bovms-app-purchase-list'
import bovms_app_sale_list from  './bovms-app-sale-list'

const obj={
    [bovms_app_funds.name]: bovms_app_funds,
    [bovms_app_guidePage.name]: bovms_app_guidePage,
    [bovms_app_memory_bank.name]: bovms_app_memory_bank,
    [bovms_app_order_list.name]: bovms_app_order_list,
    [bovms_app_purchase_list.name]: bovms_app_purchase_list,
    [bovms_app_sale_list.name]: bovms_app_sale_list,
}

window.publicModule && window.publicModule.callback(obj, "bovms");

export default obj;