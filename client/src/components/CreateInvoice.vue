<template>
<div>
  <div class="container">
    <div class="tab-pane fade show active">
      <div class="row">
        <div class="col-md-12">
          <h3>Enter Details below to Create Invoice</h3>
          <form @submit.prevent="onSubmit">
            <div class="form-group">
              <label for="">Invoice Name:</label>
              <input type="text" required class="form-control" placeholder="eg Seller's Invoice" v-model="invoice.name">
            </div>

            <div class="form-group">
              <label for="">Invoice Price:</label>
              <span> $ {{ invoice.total_price }}</span>
            </div>

            <hr />
            <h3> Transactions </h3>
            <div class="form-group">
              <label for="">Add Transaction:</label>
              <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#transactionModal">
                +
              </button>
              <!-- Modal -->
              <div class="modal fade" id="transactionModal" tabindex="-1" role="dialog" aria-labelledby="transactionModalLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title" id="exampleModalLabel">Add Transaction</h5>
                      <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div class="modal-body">
                      <div class="form-group">
                        <label for="">Transaction name</label>
                        <input type="text" id="txn_name_modal" class="form-control">
                      </div>

                      <div class="form-group">
                        <label for="">Price ($)</label>
                        <input type="numeric" id="txn_price_modal" class="form-control">
                      </div>
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-dismiss="modal">Discard Transaction</button>
                      <button type="button" class="btn btn-primary" data-dismiss="modal" v-on:click="saveTransaction()">Save transaction</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-md-12">
              <table class="table">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Transaction Name</th>
                    <th scope="col">Price ($)</th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="txn in transactions">
                    <tr :key="txn.id">
                      <th>{{ txn.id }}</th>
                      <td>{{ txn.name }}</td>
                      <td>{{ txn.price }} </td>
                      <td>
                        <button type="button" class="btn btn-danger" v-on:click="deleteTransaction(txn.id)">X</button>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>

            <div class="form-group">
              <button class="btn btn-primary">Create Invoice</button>
              {{ loading }} {{ status }}
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>

</template>

<script>
import axios from 'axios'
export default {
  name: 'createInvoice',
  data () {
    return {
      invoice: {
        name: '',
        total_price: 0
      },
      transactions: [],
      nextTxnId: 1,
      loading: '',
      status: ''
    }
  },
  methods: {
    saveTransaction () {
      let name = document.getElementById('txn_name_modal').value
      let price = document.getElementById('txn_price_modal').value

      if (name.length !== 0 && price > 0) {
        this.transactions.push({
          id: this.nextTxnId,
          name: name,
          price: price
        })
        this.nextTxnId++
        this.calcTotal()

        document.getElementById('txn_name_modal').value = ''
        document.getElementById('txn_price_modal').value = ''
      }
    },
    deleteTransaction (id) {
      let newList = this.transactions.filter((el) => {
        return el.id !== id
      })
      this.nextTxnId--
      this.transactions = newList
      this.calcTotal()
    },
    calcTotal () {
      let total = 0
      this.transactions.forEach(transaction => {
        total += parseInt(transaction.price)
      })
      this.invoice.total_price = total
    },
    onSubmit () {
      let txnNames = []
      let txnPrices = []
      const user = JSON.parse(localStorage.getItem('user'))
      this.transactions.forEach(transaction => {
        txnNames.push(transaction.name)
        txnPrices.push(transaction.price)
      })
      const formData = {
        name: this.invoice.name,
        txn_names: txnNames,
        txn_prices: txnPrices,
        user_id: user.id
      }
      this.loading = 'Creating Invoice, please wait.'

      axios.post('http://localhost:3128/invoice', formData, {
        headers: {'x-access-token': localStorage.getItem('token')}}
      ).then(res => {
        this.loading = ''
        this.status = res.data.message
      })
    }
  },
  mounted () {
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
  color: #426cb9;
}
.tab-pane {
  margin-top: 20px;
}
</style>
