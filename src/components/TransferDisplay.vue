<script setup lang="ts">
import { formatCurrency } from '@/utils'
import type { Transfer } from '@/types'

defineProps<{
  transfer: Transfer
}>()
</script>

<template>
  <li class="py-3">
    <div class="flex flex-row gap-4">
      <div class="flex-auto font-light text-lg">
        {{ transfer.src.name }}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6 inline"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
          />
        </svg>
        {{ transfer.dst.name }}
      </div>
      <div class="flex-auto text-right font-light">{{ formatCurrency(transfer.amount) }}</div>
    </div>
  </li>
</template>
