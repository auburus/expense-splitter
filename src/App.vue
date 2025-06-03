<script setup lang="ts">
// import HelloWorld from './components/HelloWorld.vue'
// import TheWelcome from './components/TheWelcome.vue'
import { ref, watch, computed } from 'vue'
import type { Ref } from 'vue'

interface User {
  id: number
  name: string
}

interface Split {
  amount: number
  participant: User
}

interface Expense {
  amount: number
  payee: User
  split: Split[]
}

interface Debt {
  [index: string]: {
    paid: number
    received: number
    balance: number
  }
}

interface Transfer {
  src: User
  dst: User
  amount: number
}

// Global
const participants: Ref<User[]> = ref([])
const expenses: Ref<Expense[]> = ref([])

// New participant
const newParticipant: Ref<string> = ref('')
let newUserIdx = 0

// New expense
const payee: Ref<User> = ref({ id: -1, name: '' })
const expenseValue: Ref<string> = ref('')
const expenseSplit: Ref<Split[]> = ref([])
const customSplit = ref(false)

// Global
const error_msg = ref('')

// Load previous state
if (localStorage.participants) {
  const savedState = JSON.parse(localStorage.savedState)
  if ('version' in savedState && savedState['version'] === 1) {
    participants.value = savedState.participants
  }
}

watch(
  participants,
  () => {
    localStorage.savedState = JSON.stringify({
      version: 1,
      participants: participants.value,
    })
  },
  { deep: true },
)

watch(expenseValue, () => {
  splitExpense()
})

function splitExpense() {
  expenseSplit.value = participants.value.map((participant: User) => ({
    participant: participant,
    amount: parseFloat(expenseValue.value) / participants.value.length,
  }))
}

function addExpense() {
  expenses.value.push({
    amount: parseFloat(expenseValue.value),
    payee: payee.value,
    split: expenseSplit.value.map((split) => ({
      amount: split.amount,
      participant: split.participant,
    })),
  })

  // Clear form
  payee.value = { id: -1, name: '' }
  expenseValue.value = ''
  expenseSplit.value = []
  customSplit.value = false
}

function clearErrors() {
  error_msg.value = ''
}

const debts = computed(() => {
  const debts: Debt = {}
  participants.value.forEach((participant: User) => {
    const paid = getAmountPaid(participant, expenses.value)
    const received = getAmountReceived(participant, expenses.value)
    debts[participant.id] = {
      paid: paid,
      received: received,
      balance: received - paid,
    }
  })

  return debts
})

const transfers = computed(() => {
  const transfers: Transfer[] = []

  participants.value.forEach((participant) => {
    while (debts.value[participant.id]['balance'] > 0) {
      const participant2: User | undefined = participants.value.find(
        (participant2: User) => debts.value[participant2.id]['balance'] < 0,
      )
      if (participant2 === undefined) {
        throw new TypeError("Couldn't find a user that owes money. Unexpected.")
      }
      const amount = Math.min(
        debts.value[participant.id]['balance'],
        Math.abs(debts.value[participant2.id]['balance']),
      )
      transfers.push({
        src: participant,
        dst: participant2,
        amount: amount,
      })
      debts.value[participant.id]['balance'] -= amount
      debts.value[participant2.id]['balance'] += amount
    }
  })

  return transfers
})

function getAmountPaid(participant: User, expenses: Expense[]) {
  return expenses.reduce((acc, expense) => {
    if (expense.payee === participant) {
      return acc + expense.amount
    }
    return acc
  }, 0)
}

function getAmountReceived(participant: User, expenses: Expense[]) {
  return expenses.reduce((acc, expense) => {
    return (
      acc +
      expense.split.reduce((acc, split) => {
        if (split.participant === participant) {
          return acc + split.amount
        }
        return acc
      }, 0)
    )
  }, 0)
}

function addParticipant() {
  if (newParticipant.value.trim() == '') {
    error_msg.value = "Participant name can't be empty"
    return
  }

  // This will be POST to the server eventually
  participants.value.push({
    id: newUserIdx,
    name: newParticipant.value,
  })

  // Autoincrement
  newUserIdx += 1

  // Clear
  newParticipant.value = ''
  clearErrors()
}

function removeParticipant(participantId: number) {
  const participantIdx: number = participants.value
    .map((participant) => participant.id)
    .indexOf(participantId)
  if (participantIdx < 0) {
    error_msg.value = "Unexpected error. Couldn't remove participant"
    return
  }
  participants.value.splice(participantIdx, 1)
  clearErrors()
}
</script>

<template>
  <h1>Expenses Splitter</h1>
  <div>
    <h3>Participants</h3>
    <span v-if="error_msg != ''">{{ error_msg }}</span>
    <ul>
      <li v-for="participant in participants" :key="participant.id">
        {{ participant.name }} <span @click="removeParticipant(participant.id)">X</span>
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
      <li v-for="expense in expenses" :key="expense.payee.id">
        <i>{{ expense.payee.name }}</i> has paid <b>{{ expense.amount }}</b> (<span v-for="split in expense.split"
          :key="split.participant.id">
          {{ split.amount }} for <i>{{ split.participant.name }}</i>,&nbsp; </span>)
        <!--{{ expense }} <span @click="removeExpense(index)">X</span>-->
      </li>
    </ul>
    <div>
      <h4>New Expense</h4>
      <label for="payee">Payee</label>
      <select id="payee" v-model="payee">
        <option disabled value=""></option>
        <option v-for="participant in participants" :key="participant.id" :value="participant">
          {{ participant.name }}
        </option>
      </select>
      <br />
      <label for="expenseValue">Amount</label>
      <!-- <input id="expenseValue" v-model="expenseValue" @focus="$event.target.select()" /> -->
      <input id="expenseValue" v-model="expenseValue" />
      <br />
      <input type="checkbox" id="customSplit" name="customSplit" v-model="customSplit" @click="splitExpense" />
      <label for="customSplit">Custom split?</label>
      <br />
      <div v-if="customSplit">
        <div v-for="split in expenseSplit" :key="split.participant.id">
          <label :for="'split-' + split.participant.id">{{ split.participant.name }}</label>
          <input :name="'split-' + split.participant.id" v-model.number="split.amount" type="number" />
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
        <li v-for="(debt, participantId) in debts" :key="participantId">
          <i>{{ participantId }}</i> has paid <b>{{ debt.paid }}</b> and received
          <b>{{ debt.received }}</b>
        </li>
      </ul>
      <h4>Transfers</h4>
      <ul>
        <li v-for="transfer in transfers" :key="transfer.src.id">
          <i>{{ transfer.src.name }}</i> owes <i>{{ transfer.dst.name }}</i>&nbsp;
          <b>{{ transfer.amount }}</b> Eur
        </li>
      </ul>
    </div>
  </div>
</template>
