<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { CalendarClockIcon, CalendarDaysIcon } from "lucide-svelte";
    import { toast } from "svelte-sonner";

    let {
        open = $bindable(false),
        type, // "group" | "topic"
        classId,
        currentDeadline = null,
        onSuccess,
    }: {
        open: boolean;
        type: "group" | "topic";
        classId: number | string;
        currentDeadline?: string | null;
        onSuccess?: () => void;
    } = $props();

    function toLocalInputValue(dateStr: string | null): string {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        const yyyy = d.getFullYear();
        const MM = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
    }

    let deadlineValue = $state(toLocalInputValue(currentDeadline));
    let isSubmitting = $state(false);

    $effect(() => {
        if (open) deadlineValue = toLocalInputValue(currentDeadline);
    });

    const config = $derived(
        type === "group"
            ? {
                  title: "Set Group Formation Deadline",
                  description:
                      "Students must form their groups before this deadline.",
                  action: "?/setGroupDeadline",
                  fieldName: "groupDeadline",
                  icon: CalendarClockIcon,
                  accent: "amber",
              }
            : {
                  title: "Set Topic Registration Deadline",
                  description:
                      "Groups must register their topic before this deadline.",
                  action: "?/setTopicDeadline",
                  fieldName: "topicDeadline",
                  icon: CalendarDaysIcon,
                  accent: "blue",
              },
    );

    async function handleSubmit() {
        if (!deadlineValue) {
            toast.error("Please select a deadline date and time.");
            return;
        }
        isSubmitting = true;
        try {
            const formData = new FormData();
            formData.append("classId", String(classId));

            const [datePart, timePart] = deadlineValue.split("T");
            const [year, month, day] = datePart.split("-").map(Number);
            const [hour, minute] = timePart.split(":").map(Number);

            const pad = (n: number) => String(n).padStart(2, "0");
            const localISO = `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00`;

            console.log(
                "Submitting to action:",
                config.action,
                "field:",
                config.fieldName,
                "type:",
                type,
            );

            formData.append(config.fieldName, localISO);

            const res = await fetch(config.action, {
                method: "POST",
                body: formData,
            });
            const result = await res.json();

            if (result?.type === "failure") {
                toast.error(result?.data?.message ?? "Failed to set deadline.");
                return;
            }
            toast.success(
                result?.data?.message ?? "Deadline set successfully!",
            );
            open = false;
            onSuccess?.();
        } finally {
            isSubmitting = false;
        }
    }
</script>

<Dialog.Root bind:open>
    <Dialog.Content class="max-w-md">
        <Dialog.Header>
            <Dialog.Title
                class="flex items-center gap-2 text-base font-bold text-stone-900"
            >
                <svelte:component
                    this={config.icon}
                    class="w-4 h-4 {config.accent === 'amber'
                        ? 'text-amber-500'
                        : 'text-blue-500'}"
                />
                {config.title}
            </Dialog.Title>
            <Dialog.Description class="text-sm text-stone-500">
                {config.description}
            </Dialog.Description>
        </Dialog.Header>

        <div class="py-2 space-y-4">
            <div class="space-y-1.5">
                <label
                    for="deadline-input"
                    class="text-xs font-bold uppercase tracking-widest text-stone-500"
                >
                    Date & Time
                </label>
                <input
                    id="deadline-input"
                    type="datetime-local"
                    bind:value={deadlineValue}
                    class="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900
                            focus:outline-none focus:ring-2 focus:ring-offset-1
                            {config.accent === 'amber'
                        ? 'focus:ring-amber-400'
                        : 'focus:ring-blue-400'}"
                    style="color-scheme: light;"
                />
            </div>

            {#if currentDeadline}
                <p class="text-xs text-stone-400">
                    Current deadline:
                    <span class="font-medium text-stone-600">
                        {new Intl.DateTimeFormat("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                        }).format(new Date(currentDeadline))}
                    </span>
                </p>
            {/if}
        </div>

        <Dialog.Footer class="flex justify-end gap-2 pt-2">
            <Button
                variant="outline"
                class="border-stone-200 text-stone-600 cursor-pointer"
                onclick={() => (open = false)}
            >
                Cancel
            </Button>
            <Button
                class="cursor-pointer {config.accent === 'amber'
                    ? 'bg-amber-500 hover:bg-amber-600'
                    : 'bg-blue-600 hover:bg-blue-700'} text-white"
                onclick={handleSubmit}
                disabled={isSubmitting}
            >
                {#if isSubmitting}
                    <span
                        class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"
                    ></span>
                {/if}
                {currentDeadline ? "Update Deadline" : "Set Deadline"}
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
