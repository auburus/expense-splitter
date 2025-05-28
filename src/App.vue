<script setup lang="ts">
// import HelloWorld from './components/HelloWorld.vue'
// import TheWelcome from './components/TheWelcome.vue'
import { ref, watch } from 'vue'

// Global
const participants = ref([])
const expenses = ref([])
const debts = ref({})
const transfers = ref([])

// New participant
const newParticipant = defineModel()
// New expense
const payee = ref('')
const expenseValue = ref(0)
const expenseSplit = ref([])
const customSplit = ref(false)

// Global
const error_msg = ref('')

// Load previous state
if (localStorage.participants) {
  participants.value = JSON.parse(localStorage.participants)
}

watch(
  participants,
  () => {
    localStorage.participants = JSON.stringify(participants.value)
  },
  { deep: true },
)

watch(expenseValue, () => {
  splitExpense()
})

watch(
  () => participants.value.length + expenses.value.length,
  () => {
    calculateDebts()
    calculateTransfers()
  },
)

function splitExpense() {
  expenseSplit.value = participants.value.map((participant) => ({
    participant: participant,
    amount: parseFloat(expenseValue.value) / participants.value.length,
  }))
}

function addExpense() {
  expenses.value.push({
    amount: expenseValue.value,
    payee: payee.value,
    split: expenseSplit.value.map((split) => ({
      amount: split.amount,
      participant: split.participant,
    })),
  })

  payee.value = 0
  expenseValue.value = 0
  expenseSplit.value = []
  customSplit.value = false
}

function clearErrors() {
  error_msg.value = ''
}

function calculateDebts() {
  participants.value.forEach((name) => {
    debts.value[name] = {
      paid: getAmountPaid(name, expenses.value),
      received: getAmountReceived(name, expenses.value),
    }

    debts.value[name]['balance'] = debts.value[name]['received'] - debts.value[name]['paid']
  })
}

function calculateTransfers() {
  transfers.value = []

  participants.value.forEach((name) => {
    while (debts.value[name]['balance'] > 0) {
      const name2 = participants.value.find((name2) => debts.value[name2]['balance'] < 0)
      const amount = Math.min(debts.value[name]['balance'], Math.abs(debts.value[name2]['balance']))
      transfers.value.push({
        src: name,
        dst: name2,
        amount: amount,
      })
      debts.value[name]['balance'] -= amount
      debts.value[name2]['balance'] += amount
    }
  })
}

function getAmountPaid(name, expenses) {
  return expenses.reduce((acc, expense) => {
    if (expense.payee === name) {
      return acc + parseFloat(expense.amount)
    }
    return acc
  }, 0)
}

function getAmountReceived(name, expenses) {
  return expenses.reduce((acc, expense) => {
    return (
      acc +
      expense.split.reduce((acc, split) => {
        if (split.participant === name) {
          return acc + parseFloat(split.amount)
        }
        return acc
      }, 0)
    )
  }, 0)
}

function addParticipant() {
  if (newParticipant.value.trim() == '') {
    return
  }
  if (participants.value.includes(newParticipant.value)) {
    error_msg.value = 'Error: There is already someone called ' + newParticipant.value
    return
  }

  participants.value.push(newParticipant.value)
  newParticipant.value = ''
  clearErrors()
}

function removeParticipant(participant_idx) {
  participants.value.splice(participant_idx, 1)
  clearErrors()
}
</script>

<template>
  <h1>Expenses Splitter</h1>
  <div>
    <h3>Participants</h3>
    <span v-if="error_msg != ''">{{ error_msg }}</span>
    <ul>
      <li v-for="(participant, index) in participants" :key="participant">
        {{ participant }} <span @click="removeParticipant(index)">X</span>
      </li>
    </ul>
    <label>New participant: </label>
    <input v-model="newParticipant" @keyup.enter="addParticipant" />
    <button @click="addParticipant">Add</button>
  </div>
  <div>
    <h3>Expenses</h3>
    <h4>Summary</h4>
    <ul>
      <li v-for="expense in expenses" :key="expense">
        <i>{{ expense.payee }}</i> has paid <b>{{ expense.amount }}</b> (<span
          v-for="split in expense.split"
          :key="split.participant"
        >
          {{ split.amount }} for <i>{{ split.participant }}</i
          >,&nbsp; </span
        >)
        <!--{{ expense }} <span @click="removeExpense(index)">X</span>-->
      </li>
    </ul>
    <div>
      <h4>New Expense</h4>
      <label for="payee">Payee</label>
      <select id="payee" v-model="payee">
        <option disabled value=""></option>
        <option v-for="participant in participants" :key="participant" :value="participant">
          {{ participant }}
        </option>
      </select>
      <br />
      <label for="expenseValue">Amount</label>
      <input id="expenseValue" v-model="expenseValue" @focus="$event.target.select()" />
      <br />
      <input
        type="checkbox"
        id="customSplit"
        name="customSplit"
        v-model="customSplit"
        @click="splitExpense"
      />
      <label for="customSplit">Custom split?</label>
      <br />
      <div v-if="customSplit">
        <div v-for="(split, index) in expenseSplit" :key="split.participant">
          <label :for="'split-' + index">{{ split.participant }}</label>
          <input :name="'split-' + index" v-model="split.amount" />
        </div>
      </div>
      <br />
      <button @click="addExpense">Add</button>
    </div>
  </div>
  <div>
    <h3>Result</h3>
    <div>
      <h4>Debts</h4>
      <ul>
        <li v-for="(debt, name) in debts" :key="name">
          <i>{{ name }}</i> has paid <b>{{ debt.paid }}</b> and received <b>{{ debt.received }}</b>
        </li>
      </ul>
      <h4>Transfers</h4>
      <ul>
        <li v-for="transfer in transfers" :key="transfer.src">
          <i>{{ transfer.src }}</i> owes <i>{{ transfer.dst }}</i> <b>{{ transfer.amount }}</b> Eur
        </li>
      </ul>
    </div>
  </div>
</template>
