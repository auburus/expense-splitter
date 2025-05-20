<script lang="ts">
// import HelloWorld from './components/HelloWorld.vue'
// import TheWelcome from './components/TheWelcome.vue'
import { defineComponent } from 'vue'

export default defineComponent({
  data() {
    return {
      participants: [],
      newParticipant: '',
      error_msg: '',
    }
  },
  mounted() {
    if (localStorage.participants) {
      this.participants = JSON.parse(localStorage.participants)
    }
  },
  watch: {
    participants: {
      handler(newParticipants, oldParticipants) {
        localStorage.participants = JSON.stringify(newParticipants)
      },
      deep: true,
    },
  },
  methods: {
    addParticipant() {
      if (this.newParticipant.trim() == '') {
        return
      }
      if (this.participants.includes(this.newParticipant)) {
        this.error_msg = 'Error: There is already someone called ' + this.newParticipant
        return
      }

      this.participants.push(this.newParticipant)
      this.newParticipant = ''
      this.error_msg = ''
    },
    removeParticipant(participant_idx) {
      this.participants.splice(participant_idx, 1)
      this.error_msg = ''
    },
  },
})
</script>

<template>
  <h1>Expenses Splitter</h1>
  <div>
    <h3>Participants</h3>
    <span v-if="error_msg != ''">{{ error_msg }}</span>
    <ul>
      <li v-for="(participant, index) in participants">
        {{ participant }} <span @click="removeParticipant(index)">X</span>
      </li>
    </ul>
    <input v-model="newParticipant" @keyup.enter="addParticipant" />
    <button @click="addParticipant">Add</button>
  </div>
</template>
<!--<template>
  <header>
    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />
    </div>
  </header>

  <main>
    <TheWelcome />
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
-->
