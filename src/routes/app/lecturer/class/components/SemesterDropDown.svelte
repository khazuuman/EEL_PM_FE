<script lang="ts">
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { Button } from "$lib/components/ui/button";
  import { ChevronDown } from "lucide-svelte";
  import type { Semester } from "$lib/types/semester";

  // Nhận semesters từ parent và emit sự kiện khi chọn
  let {
    semesters = [] as Semester[],
    selectedSemesterId = $bindable<string | null>(null),
  }: {
    semesters: Semester[];
    selectedSemesterId?: string | null;
  } = $props();

  // Guard: đảm bảo luôn là array dù data chưa load xong
  const semesterList = $derived(Array.isArray(semesters) ? semesters : []);

  // Lấy tên semester đang chọn để hiển thị trên Trigger
  const selectedName = $derived(
    semesters.find((s) => s.semesterId.toString() === selectedSemesterId)?.semesterName ??
      "All Semesters",
  );
</script>

<div>
  <DropdownMenu.Root>
    <DropdownMenu.Trigger>
      <Button
        variant="outline"
        class="w-45 justify-between text-stone-800 border-stone-300 hover:bg-stone-50"
      >
        {selectedName || "Select a semester"}
        <ChevronDown class="h-4 w-4 text-stone-500 opacity-50" />
      </Button>
    </DropdownMenu.Trigger>

    <DropdownMenu.Content class="w-45 bg-white border-stone-200">
      <DropdownMenu.Group>
        <DropdownMenu.Label class="text-stone-500 font-semibold">
          Choose semester
        </DropdownMenu.Label>
        <DropdownMenu.Separator class="bg-stone-100" />

        {#each semesters as semester}
          {@const isSelected = semester.semesterId.toString() === selectedSemesterId}
          <DropdownMenu.Item
            disabled={isSelected}
            onclick={() => (selectedSemesterId = semester.semesterId.toString())}
            class="cursor-pointer {isSelected
              ? 'bg-amber-50 text-amber-600 font-medium opacity-60 cursor-not-allowed'
              : 'text-stone-700 hover:bg-stone-100 focus:bg-stone-100'}"
          >
            {semester.semesterName}
            {#if semester.isCurrent}
              <span class="ml-2 text-xs text-amber-500">(Current)</span>
            {/if}
          </DropdownMenu.Item>
        {/each}
      </DropdownMenu.Group>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
</div>
