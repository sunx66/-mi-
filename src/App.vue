<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useUserStore } from './store/user'

onLaunch(() => {
  const userStore = useUserStore()
  if (!userStore.isLoggedIn) {
    userStore.initMockUser()
  }
})

onShow(() => {})

onHide(() => {})
</script>

<style lang="scss">
@import './styles/global.scss';
</style>
