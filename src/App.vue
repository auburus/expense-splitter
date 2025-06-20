<script setup lang="ts">
// import HelloWorld from './components/HelloWorld.vue'
// import TheWelcome from './components/TheWelcome.vue'
import NewExpense from './components/NewExpense.vue'
import { ref, watch, computed, onMounted } from 'vue'
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
  concept: string
  payee: User
  split: Split[]
}

interface Debt {
  participant: User
  paid: number
  received: number
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

// Global
const error_msg = ref('')

onMounted(() => {
  loadPreviousState()
})

watch(
  [participants, expenses],
  () => {
    localStorage.savedState = JSON.stringify({
      version: 2,
      participants: participants.value,
      expenses: expenses.value,
    })
  },
  { deep: true },
)

function loadPreviousState() {
  if (localStorage.savedState) {
    const savedState = JSON.parse(localStorage.savedState)
    if (!('version' in savedState)) {
      delete localStorage.savedState
      return
    }
    if (savedState['version'] === 1) {
      participants.value = savedState.participants
      newUserIdx = Math.max(...participants.value.map((participants) => participants.id)) + 1
    }
    if (savedState['version'] === 2) {
      participants.value = savedState.participants
      newUserIdx = Math.max(...participants.value.map((participants) => participants.id)) + 1

      expenses.value = savedState.expenses
    }
  }
}

function addExpense(expense: Expense) {
  expenses.value.push(expense)
}

function clearErrors() {
  error_msg.value = ''
}

const debts = computed(() => {
  return participants.value.map((participant: User) => ({
    participant: participant,
    paid: getAmountPaid(participant, expenses.value),
    received: getAmountReceived(participant, expenses.value),
  }))
})

const transfers = computed(() => {
  const transfers: Transfer[] = []
  const balances = debts.value.reduce((acc: { [index: number]: number }, debt: Debt) => {
    acc[debt.participant.id] = debt.received - debt.paid
    return acc
  }, {})
  // const balances = Object.keys(debts.value).reduce((acc: { [index: string]: number }, participant_id: string) => {
  //   acc[participant_id] = debts.value[participant_id].received - debts.value[participant_id].paid
  //   return acc
  // }, {})

  participants.value.forEach((participant) => {
    while (balances[participant.id] > 0) {
      const participant2: User | undefined = participants.value.find(
        (participant2: User) => balances[participant2.id] < 0,
      )
      if (participant2 === undefined) {
        throw new TypeError("Couldn't find a user that owes money. Unexpected.")
      }
      const amount = Math.min(balances[participant.id], Math.abs(balances[participant2.id]))
      transfers.push({
        src: participant,
        dst: participant2,
        amount: amount,
      })

      balances[participant.id] -= amount
      balances[participant2.id] += amount
    }
  })

  return transfers
})

function getAmountPaid(participant: User, expenses: Expense[]) {
  return expenses.reduce((acc, expense) => {
    if (expense.payee.id === participant.id) {
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
        if (split.participant.id === participant.id) {
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
    <h3>Result</h3>
    <div v-if="transfers.length === 0">All debts are settled, no transfers necessary</div>
    <div v-else>
      <ul>
        <li v-for="transfer in transfers" :key="transfer.src.id">
          <i>{{ transfer.src.name }}</i> owes <i>{{ transfer.dst.name }}</i
          >&nbsp; <b>{{ transfer.amount }}</b> Eur
        </li>
      </ul>
      <h5>Debts</h5>
      <ul>
        <li v-for="debt in debts" :key="debt.participant.id">
          <i>{{ debt.participant.name }}</i> has paid <b>{{ debt.paid }}</b> and received
          <b>{{ debt.received }}</b>
        </li>
      </ul>
    </div>
  </div>
  <div>
    <h4>Summary</h4>
    <ul>
      <li v-for="expense in expenses" :key="expense.payee.id">
        <i>{{ expense.payee.name }}</i> has paid <b>{{ expense.amount }}</b> for
        {{ expense.concept }} (<span v-for="split in expense.split" :key="split.participant.id">
          {{ split.amount }} for <i>{{ split.participant.name }}</i
          >,&nbsp; </span
        >)
      </li>
    </ul>
  </div>
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
    <div>
      <h4>New Expense</h4>
      <NewExpense :participants="participants" @submit="addExpense" />
    </div>
  </div>
</template>
