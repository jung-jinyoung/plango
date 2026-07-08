<template>
  <div>
    <GoalHierarchyTree
      :initial-monthly-id="route.query.monthly || null"
      :initial-weekly-id="route.query.weekly || null"
    />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import GoalHierarchyTree from '@/components/goals/GoalHierarchyTree.vue'

const route = useRoute()
</script>
