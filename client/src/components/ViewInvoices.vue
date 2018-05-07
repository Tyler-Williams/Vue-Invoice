<template>
  <div>
    <div class="container">
      <div class="tab-pane fade show active">
        <div class="row">
          <div class="col-md-12">
            <h3>Here are a list of your invoices</h3>
            <table class="table">
              <thead>
                <tr>
                  <th scope="col">Invoice #</th>
                  <th scope="col">Invoice Name</th>
                  <th scope="col">Status</th>
                  <th scope="col"></th>
                </tr>
              </thead>
              <tbody>
                <template v-for="invoice in invoices">
                  <tr :key="invoice.id">
                    <th scope="row">{{ invoice.id }}</th>
                    <td>{{ invoice.name }}</td>
                    <td v-if="invoice.paid == 0">Unpaid</td>
                    <td v-else>Paid</td>
                    <td><button class="btn btn-success" @click="goToInvoice(invoice.id)">TO INVOICE</button></td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
//  import SingleInvoiceVue from './SingleInvoice.vue'
export default {
  name: 'ViewInvoices',
  data () {
    return {
      invoices: [],
      user: ''
    }
  },
  mounted () {
    this.user = JSON.parse(localStorage.getItem('user'))
    axios.get(`http://localhost:3128/invoice/user/${this.user.id}`,
      {
        headers: {'x-access-token': localStorage.getItem('token')}
      }
    ).then(res => {
      if (res.data.status === true) {
        console.log(res.data)
        this.invoices = res.data.invoices
      }
    })
  },
  methods: {
    goToInvoice (id) {
      this.$router.push({
        name: 'SingleInvoice',
        params: {
          invoice_id: id
        }
      })
    }
  }
}
</script>

<style scoped>
h1,
h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #ffffff;
}
.tab-pane {
  margin-top: 20px;
}
</style>
