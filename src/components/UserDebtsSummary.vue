<script setup lang="ts">
import { formatCurrency, randomColor } from '@/utils'
import type { Debt } from '@/types'
import IconUser from './icons/IconUser.vue'

defineProps<{
  debt: Debt
}>()
</script>

<template>
  <li class="py-3">
    <div class="flex flex-row gap-4">
      <IconUser
        class="size-16 flex-none"
        :style="
          'fill:' +
          randomColor(debt.participant.id) +
          '; color: ' +
          randomColor(debt.participant.id)
        "
      />
      <div class="flex-auto">
        <p class="text-sm font-medium text-gray-900 truncate">
          {{ debt.participant.name }}
        </p>
        <p class="text-sm font-light text-gray-400 truncate">
          Paid: {{ formatCurrency(debt.paid) }}
        </p>
      </div>
      <div
        class="flex-1 text-right text-r"
        :class="{
          'text-red-400': debt.received > debt.paid,
          'text-emerald-400': debt.paid >= debt.received,
        }"
      >
        {{ formatCurrency(debt.paid - debt.received, { signDisplay: 'always' }) }}
      </div>
    </div>
  </li>
</template>
