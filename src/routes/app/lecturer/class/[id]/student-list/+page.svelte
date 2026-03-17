<script lang="ts">
	import DataTable from "$lib/components/ui/data-table/data-table.svelte";

	const { data } = $props();
	console.log("data client: ", data);
	let students = $derived(data?.students || []);
	let totalCount = $derived(data?.totalCount || 0);
	let majors = $derived(data?.majors || []);
	console.log("majors client: ", majors);
	const cacheKeyName = "student-management";
	let filters = $derived([
		{
			title: "Majors",
			key: "MajorId",
			data: majors,
		},
	]);
	let defaultHeaders = $state([
		"avatarUrl",
		"studentCode",
		"fullName",
		"email",
		"groupName",
		"majorName",
	]);
	let headerValues = $state({
		avatarUrl: "Avatar",
		studentCode: "Student Code",
		fullName: "Full Name",
		email: "Email",
		groupName: "Group",
		majorName: "Major",
	});
</script>

<div class="bg-white p-5 rounded-md">
	<DataTable
		statuses={[]}
		keyId={"studentId"}
		{cacheKeyName}
		{headerValues}
		allowSortHeaders={[]}
		tableName={"Student"}
		{defaultHeaders}
		items={students}
		totalItems={totalCount}
		activePaginate
		matchSearchColumns={["fullName", "studentCode"]}
		{filters}
	/>
</div>
