<!-- +page.svelte -->
<script lang="ts">
    import ComingSoon from "../../../../components/coming-soon.svelte";
    import type { PageData } from "../$types";

    let { data }: { data: PageData } = $props();

    const classId = data.classId;
</script>

<ComingSoon title="Topic List" backPath={`/app/lecturer/class/${classId}`} />
