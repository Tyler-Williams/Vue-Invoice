<template>
  <div class="container-fluid" style="padding: 0px;">
    <Header v-bind:user="user"/>
    <template v-if="this.isactive == 'create'">
      <create-invoice />
    </template>
    <template v-else>
      <view-invoices />
    </template>
  </div>
</template>

<script>
import Header from '@/components/Header'
import ViewInvoices from '@/components/ViewInvoices'
import CreateInvoice from '@/components/CreateInvoice'
export default {
  name: 'Dashboard',
  components: {
    Header,
    CreateInvoice,
    ViewInvoices
  },
  data () {
    return {
      isactive: 'create',
      title: 'Invoicing App',
      user: this.$route.params.user || null
    }
  },
  mounted () {
    this.user = JSON.parse(localStorage.getItem('user'))
    //  FOR DEBUG console.log('User: ', JSON.parse(localStorage.getItem('user')))
  }
}
</script>
