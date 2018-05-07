<template>
  <div class="container-fluid" style="padding: 0px;">
    <header v-bind:user="user"/>
    <template v-if="this.isactive == 'create'">
      <view-invoices />
      <create-invoice />
    </template>
    <template v-else>

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
      user: JSON.parse(localStorage.getItem('user')) || null
    }
  },
  mounted () {
    this.user = JSON.parse(localStorage.getItem('user'))
  }
}
</script>

<style scoped>

</style>
