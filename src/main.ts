import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
    faBars, 
    faXmark, 
    faSignOut, 
    faHouse, 
    faGraduationCap, 
    faUtensils, 
    faShirt, 
    faComments, 
    faBasketball, 
    faLeaf ,
    faUsers,
    faHeart,
    faShare,
    faLock,
    faUser,
    faRightToBracket,
    faFire,
    faClock,
    faSpinner,
    faSeedling,
    faPlus,
    faChartLine,
    faCheckCircle,
    faInfoCircle,
    faClipboardList,
    faInbox,
    faNewspaper,
    faImage,
    faSchool
} from '@fortawesome/free-solid-svg-icons'

library.add(
    faBars, 
    faXmark, 
    faSignOut, 
    faHouse, 
    faGraduationCap, 
    faUtensils, 
    faShirt, 
    faComments, 
    faBasketball, 
    faLeaf,
    faUsers,
    faHeart,
    faShare,
    faLock,
    faUser,
    faRightToBracket,
    faFire,
    faClock,
    faSpinner,
    faSeedling,
    faPlus,
    faChartLine,
    faCheckCircle,
    faInfoCircle,
    faClipboardList,
    faInbox,
    faNewspaper,
    faImage,
    faSchool
)

const app = createApp(App)
app.component('font-awesome-icon', FontAwesomeIcon)
app.use(router)
app.mount('#app')