<script setup lang="ts">
// import HelloWorld from './components/HelloWorld.vue'
// import TheWelcome from './components/TheWelcome.vue'
import { ref, watch } from 'vue'

const newParticipant = defineModel()
const participants = ref([])
const error_msg = ref('')
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
  error_msg.value = ''
}

function removeParticipant(participant_idx) {
  participants.value.splice(participant_idx, 1)
  error_msg.value = ''
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
    <input v-model="newParticipant" @keyup.enter="addParticipant" />
    <button @click="addParticipant">Add</button>
  </div>
</template>
