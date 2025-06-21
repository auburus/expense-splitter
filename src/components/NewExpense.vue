<script setup lang="ts">
import { unevenSplit } from '../utils.ts'
import { ref, watch, onMounted } from 'vue'
import type { Ref } from 'vue'
import type { User } from '@/types'

interface Split {
  amount: string
  computedAmount: string
  participant: User
}

const props = defineProps<{
  participants: User[]
}>()

const emit = defineEmits<{
  (
    e: 'submit',
    form: {
      payee: User
      concept: string
      amount: number
      split: { participant: User; amount: number }[]
    },
  ): void
}>()

const concept: Ref<string> = ref('')
const total: Ref<string> = ref('')
const splits: Ref<Split[]> = ref([])

const payee: Ref<User> = ref({ id: -1, name: '' })

onMounted(() => {
  initSplits()
})

watch(
  () => props.participants.length,
  () => {
    initSplits()
  },
)

watch([total, () => splits.value.map((split) => split.amount)], () => {
  updateSplits()
})

function initSplits() {
  splits.value = props.participants.map((participant) => ({
    amount: '',
    computedAmount: '',
    participant: participant,
  }))
}

function inputToNumber(input: string) {
  if (isNaN(+input)) {
    return 0
  }
  if (isNaN(parseFloat(input))) {
    return 0
  }

  return parseFloat(input)
}

function updateSplits() {
  const unassignedAmount =
    inputToNumber(total.value) -
    splits.value.reduce((sum, split) => {
      return sum + inputToNumber(split.amount)
    }, 0)

  const remainingSplits = splits.value.filter((split) => split.amount === '')
  if (remainingSplits.length === 0) {
    console.log('Error: All values are fixed (remainingSplits.length == 0)')
    return
  }

  const amounts = unevenSplit(unassignedAmount, remainingSplits.length)
  remainingSplits.forEach((split, i) => {
    split.computedAmount = amounts[i].toFixed(2)
  })
}

function submit() {
  if (payee.value.id === -1) {
    console.log("Payee is empty, can't submit")
    return
  }
  if (concept.value === '') {
    console.log("Concept is empyt, can't submit")
    return
  }
  if (total.value === '' || +total.value === 0 || isNaN(+total.value)) {
    console.log("Amount is not valid, can't submit")
    return
  }
  emit('submit', {
    payee: payee.value,
    concept: concept.value,
    amount: inputToNumber(total.value),
    split: splits.value.map((split) => ({
      participant: split.participant,
      amount:
        split.amount !== '' ? inputToNumber(split.amount) : inputToNumber(split.computedAmount),
    })),
  })
  console.log('event sent')
  clear()
}

function clear() {
  total.value = ''
  concept.value = ''
  splits.value.forEach((split) => {
    split.amount = ''
  })
  payee.value = { id: -1, name: '' }
}
</script>

<template>
  <label for="concept">Concept</label>
  <input id="concept" v-model="concept" placeholder="e.g. Dinner" /><br />
  <label for="payee">Payee</label>
  <select id="payee" v-model="payee">
    <option disabled value=""></option>
    <option v-for="participant in participants" :key="participant.id" :value="participant">
      {{ participant.name }}
    </option>
  </select>
  <br />
  <label for="amount">Amount</label>
  <input id="amount" v-model="total" type="number" placeholder="0.00" /><br /><br />
  <div v-for="split in splits" :key="split.participant.id">
    <label :for="'split-' + split.participant.id">{{ split.participant.name }}</label>
    <input
      :name="'split-' + split.participant.id"
      v-model="split.amount"
      type="number"
      :placeholder="split.computedAmount"
    />
  </div>
  <button @click="submit">Submit</button>
</template>
