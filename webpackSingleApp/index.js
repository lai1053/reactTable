import singleApp1 from '../apps/invoices/inv-app-pu-toll-invoice-card'
import singleApp2 from '../apps/invoices/inv-app-pu-agricultural-invoice-card'
import singleApp3 from '../apps/invoices/inv-app-pu-cdpi-invoice-card'
import singleApp4 from '../apps/invoices/inv-app-pu-mvs-invoice-card'
import singleApp5 from '../apps/invoices/inv-app-pu-uniform-invoice-card'
import singleApp6 from '../apps/invoices/inv-app-pu-vato-invoice-card'
import singleApp7 from '../apps/invoices/inv-app-pu-vats-invoice-card'
import singleApp8 from '../apps/invoices/inv-app-pu-withhold-invoice-card'
import singleApp9 from '../apps/invoices/inv-app-select-product'
const target = {
    [singleApp1.name]: singleApp1,
    [singleApp2.name]: singleApp2,
    [singleApp3.name]: singleApp3,
    [singleApp4.name]: singleApp4,
    [singleApp5.name]: singleApp5,
    [singleApp6.name]: singleApp6,
    [singleApp7.name]: singleApp7,
    [singleApp8.name]: singleApp8,
    [singleApp9.name]: singleApp9,
}



window.singleApp = target