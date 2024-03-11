<script lang="ts" setup>
import { ref } from "vue";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import { MiniMap } from "@vue-flow/minimap";
import { VueFlow, useVueFlow, type Node, type Edge } from "@vue-flow/core";

const { addEdges, onConnect } = useVueFlow();

const nodes = ref<Node[]>([
  // Ensure each node has a unique, descriptive label for screen readers
  { id: "1", label: "Start Node", position: { x: 250, y: 5 }, type: "input" },
  {
    id: "2",
    label: "Intermediate Node",
    position: { x: 100, y: 100 },
    type: "output",
  },
  { id: "3", label: "End Node", position: { x: 400, y: 100 }, type: "custom" },
]);

const edges = ref<Edge[]>([
  // Use descriptive labels for edges where possible
  {
    id: "e1-2",
    label: "Start to Intermediate",
    source: "1",
    target: "2",
    type: "custom",
  },
  {
    id: "e1-3",
    animated: true,
    label: "Start to End",
    source: "1",
    target: "3",
  },
]);

onConnect((params) => {
  addEdges([params]);
});
</script>

<template>
  <div style="height: 50vh" role="application" aria-label="Relations Graph">
    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      fit-view-on-init
      class="vue-flow-basic-example"
      :default-zoom="1.5"
      :min-zoom="0.2"
      :max-zoom="4"
      aria-roledescription="interactive node graph"
    >
      <Background pattern-color="#aaa" :gap="8" />

      <MiniMap />

      <Controls />

      <template #node-custom="nodeProps">
        <!-- Ensure custom nodes are accessible -->
        <FlowCustomNode v-bind="nodeProps" />
      </template>

      <template #edge-custom="edgeProps">
        <!-- Ensure custom edges are accessible -->
        <FlowCustomEdge v-bind="edgeProps" />
      </template>
    </VueFlow>
  </div>
</template>
