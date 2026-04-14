<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import * as Select from "$lib/components/ui/select/index.js";
    import { Button } from "$lib/components/ui/button";
    import { Label } from "$lib/components/ui/label";
    import { enhance } from "$app/forms";
    import { RefreshCwIcon, Loader2Icon } from "lucide-svelte";
    import { toast } from "svelte-sonner";
    import { invalidateAll } from "$app/navigation";

    type Course = {
        courseId: string | number;
        courseCode: string;
        courseName?: string;
    };

    type Props = {
        open: boolean;
        onOpenChange: (v: boolean) => void;
    };

    let { open, onOpenChange }: Props = $props();

    let courses = $state<Course[]>([]);
    let exe1CourseId = $state<string>("");
    let exe2CourseId = $state<string>("");
    let loading = $state(false);
    let loadingCourses = $state(false);
    let errorMessage = $state("");

    // Hidden form refs để gọi getAllCourses
    let getCoursesForm = $state<HTMLFormElement | null>(null);

    // Khi dialog mở → tự submit getAllCourses
    $effect(() => {
        if (open) {
            exe1CourseId = "";
            exe2CourseId = "";
            errorMessage = "";
            import("svelte").then(({ tick }) =>
                tick().then(() => getCoursesForm?.requestSubmit()),
            );
        }
    });

    const handleGetCourses: import("@sveltejs/kit").SubmitFunction = () => {
        loadingCourses = true;
        return async ({ result, update }) => {
            loadingCourses = false;
            if (result.type === "success") {
                courses = (result.data as any)?.courses ?? [];
            }
        };
    };

    const handleSync: import("@sveltejs/kit").SubmitFunction = () => {
        loading = true;
        errorMessage = "";
        return async ({ result, update }) => {
            loading = false;
            if (result.type === "failure") {
                toast.error(
                    (errorMessage = String(
                        result.data?.message ?? "Failed to sync data.",
                    )),
                );
            } else if (result.type === "success") {
                exe1CourseId = "";
                exe2CourseId = "";
                onOpenChange(false);
                toast.success("Sync Data successfully!");
                await invalidateAll();
            }
        };
    };

    // Label helper cho select
    function getCourseLabel(id: string) {
        const c = courses.find((c) => String(c.courseId) === id);
        return c
            ? `${c.courseCode}${c.courseName ? " – " + c.courseName : ""}`
            : "Select course...";
    }
</script>

<!-- Hidden form: load courses -->
<form
    method="POST"
    action="?/getAllCourses"
    use:enhance={handleGetCourses}
    bind:this={getCoursesForm}
></form>

<Dialog.Root {open} {onOpenChange}>
    <Dialog.Content class="sm:max-w-md">
        <Dialog.Header>
            <Dialog.Title>Sync Academic Data</Dialog.Title>
            <Dialog.Description>
                Select the subject codes to synchronize all data from the
                external API. This process may take
                <strong>30s – 1 minute</strong> — please do not close this page.
            </Dialog.Description>
        </Dialog.Header>

        <form method="POST" action="?/syncData" use:enhance={handleSync}>
            <!-- Hidden courseId values -->
            <input type="hidden" name="exe1CourseId" value={exe1CourseId} />
            <input type="hidden" name="exe2CourseId" value={exe2CourseId} />

            <div class="flex flex-col gap-4 py-4">
                {#if loadingCourses}
                    <div
                        class="flex items-center justify-center gap-2 py-6 text-stone-400"
                    >
                        <Loader2Icon size={18} class="animate-spin" />
                        <span class="text-sm">Loading courses...</span>
                    </div>
                {:else}
                    <!-- EXE01 -->
                    <div class="flex flex-col gap-1.5">
                        <Label>EXE01 Subject</Label>
                        <Select.Root
                            type="single"
                            value={exe1CourseId}
                            onValueChange={(v) => (exe1CourseId = v ?? "")}
                            disabled={loading}
                        >
                            <Select.Trigger class="w-full">
                                {getCourseLabel(exe1CourseId)}
                            </Select.Trigger>
                            <Select.Content>
                                {#each courses as course}
                                    <Select.Item
                                        value={String(course.courseId)}
                                    >
                                        <span
                                            class="font-mono text-xs text-stone-500 mr-2"
                                        >
                                            {course.courseCode}
                                        </span>
                                        {#if course.courseName}
                                            <span class="text-sm"
                                                >{course.courseName}</span
                                            >
                                        {/if}
                                    </Select.Item>
                                {/each}
                            </Select.Content>
                        </Select.Root>
                    </div>

                    <!-- EXE02 -->
                    <div class="flex flex-col gap-1.5">
                        <Label>EXE02 Subject</Label>
                        <Select.Root
                            type="single"
                            value={exe2CourseId}
                            onValueChange={(v) => (exe2CourseId = v ?? "")}
                            disabled={loading}
                        >
                            <Select.Trigger class="w-full">
                                {getCourseLabel(exe2CourseId)}
                            </Select.Trigger>
                            <Select.Content>
                                {#each courses as course}
                                    <Select.Item
                                        value={String(course.courseId)}
                                    >
                                        <span
                                            class="font-mono text-xs text-stone-500 mr-2"
                                        >
                                            {course.courseCode}
                                        </span>
                                        {#if course.courseName}
                                            <span class="text-sm"
                                                >{course.courseName}</span
                                            >
                                        {/if}
                                    </Select.Item>
                                {/each}
                            </Select.Content>
                        </Select.Root>
                    </div>
                {/if}

                {#if errorMessage}
                    <p class="text-sm text-destructive">{errorMessage}</p>
                {/if}
            </div>

            <Dialog.Footer>
                <Button
                    type="button"
                    variant="outline"
                    onclick={() => onOpenChange(false)}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={loading ||
                        !exe1CourseId ||
                        !exe2CourseId ||
                        loadingCourses}
                    class="gap-2"
                >
                    <RefreshCwIcon
                        size={16}
                        class={loading ? "animate-spin" : ""}
                    />
                    {loading ? "Syncing..." : "Sync"}
                </Button>
            </Dialog.Footer>
        </form>
    </Dialog.Content>
</Dialog.Root>
