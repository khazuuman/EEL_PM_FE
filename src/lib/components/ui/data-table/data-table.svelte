<script lang="ts">
	import * as Table from "$lib/components/ui/table/index.js";
	import {
		handleDragStart,
		handleDragOver,
		handleDropHeader,
		renderCell,
		getInitialHeaders,
		isCellSelected,
		getSelectedCellsData,
		copyToClipboard,
		type CellPosition,
		type CellRange,
		handleRowSelect,
	} from "./data-table.helper.js";
	import PaginateDataTable from "./components/paginate-data-table.svelte";
	import { toast } from "svelte-sonner";
	import HeadDataTable from "./components/head-data-table.svelte";
	import NavDataTable from "./components/nav-data-table.svelte";
	import { Checkbox } from "$lib/components/ui/checkbox/index.js";
	import { setLocalStorageItem } from "$lib/utils.js";
	import { Button } from "../button/index.js";
	import {
		setDataTableCtx,
		type DataTableCtx,
	} from "./ctx/data-table.ctx.js";
	import RenderValueDataTable from "./components/render-value-data-table.svelte";
	import { page } from "$app/state";
	import LoadingDataTable from "./components/loading-data-table.svelte";
	import ActionsDataTable from "./components/actions-data-table.svelte";
	import type { Snippet } from "svelte";
	type Status = {
		label: string;
		value: string | number;
		variant: string;
	};
	type ActionType = "view" | "update" | "delete";
	type Props = DataTableCtx & {
		cacheKeyName: string;
		allowSortHeaders: string[];
		checkboxSelection?: boolean;
		activePaginate?: boolean;
		items: any[];
		totalItems?: number;
		keyId?: string;
		statuses: Status[];
		actions?: ActionType[];
		showAddButton?: boolean;
		showAction?: boolean;
		headerActions?: import("svelte").Snippet;
		extraActions?: Snippet<[{ id: string }]>;
	};

	const {
		cacheKeyName,
		tableName,
		defaultHeaders,
		allowSortHeaders,
		checkboxSelection = false,
		items,
		totalItems,
		activePaginate,
		matchSearchColumns,
		headerValues,
		filters,
		keyId,
		statuses,
		actions = ["view", "update", "delete"],
		showAddButton = true,
		showAction = false,
		headerActions,
		extraActions,
	}: Props = $props();

	setDataTableCtx(() => {
		return {
			cacheKeyName,
			headerValues,
			defaultHeaders,
			allowSortHeaders,
			matchSearchColumns,
			tableName,
			filters: filters ?? [],
			statuses,
		};
	});
	let initialLoad = $state(false);
	let activeHeaders = $state<string[]>([]);
	let deleteForms = $state<Map<string, HTMLFormElement>>(new Map());
	const handleFormBind = (id: string, formEl: HTMLFormElement) => {
		deleteForms.set(id, formEl);
	};
	$effect(() => {
		if (initialLoad) return;
		activeHeaders = getInitialHeaders(cacheKeyName, defaultHeaders);
		initialLoad = true;
	});

	const setActiveHeaders = (headers: string[]) => {
		setLocalStorageItem(
			`data-table-${cacheKeyName}-headers`,
			JSON.stringify(headers),
		);
		activeHeaders = headers;
	};

	let sortedData = $derived(
		items.map((cls, index) => {
			const row: any = {};
			activeHeaders.forEach((header: string) => {
				row[header] = renderCell(cls, header);
			});
			if (keyId) {
				row.id = cls[keyId];
			} else {
				row.id = cls.id ?? cls._id ?? `row-${index}`;
			}
			return row;
		}),
	);
	let draggedColumn = $state<string | null>(null);
	let dragOverColumn = $state<string | null>(null);

	// State cho cell selection
	let isSelecting = $state(false);
	let selectionRange = $state<CellRange | null>(null);
	let selectionStart = $state<CellPosition | null>(null);
	let lastClickedCell = $state<CellPosition | null>(null);

	// State cho checkbox selection
	let selectedRows = $state<Set<string>>(new Set());
	let lastCheckedIndex = $state<number | null>(null);

	// Derived state cho "select all"
	let isAllSelected = $derived(
		sortedData.length > 0 && selectedRows.size === sortedData.length,
	);
	let isIndeterminate = $derived(
		selectedRows.size > 0 && selectedRows.size < sortedData.length,
	);

	// State for index
	const currentPage = $derived(
		Number(page.url.searchParams.get("page")) || 1,
	);
	const pageLimit = $derived(
		Number(page.url.searchParams.get("limit")) || 10,
	);
	const startIndex = $derived((currentPage - 1) * pageLimit + 1);

	// Handler functions for drag and drop
	function onDragStart(header: string) {
		draggedColumn = handleDragStart(header);
	}

	function onDragOver(e: DragEvent, header: string) {
		handleDragOver(e);
		dragOverColumn = header;
	}

	function onDrop(e: DragEvent, targetHeader: string) {
		e.preventDefault();
		if (!draggedColumn) return;

		const newHeaders = handleDropHeader(
			draggedColumn,
			targetHeader,
			activeHeaders,
		);
		if (newHeaders) {
			setActiveHeaders(newHeaders);
		}

		draggedColumn = null;
		dragOverColumn = null;
	}

	function onDragEnd() {
		draggedColumn = null;
		dragOverColumn = null;
	}

	function onDragLeave() {
		dragOverColumn = null;
	}

	// Handler functions for cell selection
	function handleCellMouseDown(
		rowIndex: number,
		colIndex: number,
		e: MouseEvent,
	) {
		if (e.shiftKey && lastClickedCell) {
			selectionRange = {
				start: lastClickedCell,
				end: { rowIndex, colIndex },
			};
			return;
		}

		isSelecting = true;
		selectionStart = { rowIndex, colIndex };
		lastClickedCell = { rowIndex, colIndex };
		selectionRange = {
			start: { rowIndex, colIndex },
			end: { rowIndex, colIndex },
		};
	}

	function handleCellClick(
		rowIndex: number,
		colIndex: number,
		e: MouseEvent,
	) {
		if (!e.shiftKey && !isSelecting) {
			lastClickedCell = { rowIndex, colIndex };
			selectionRange = {
				start: { rowIndex, colIndex },
				end: { rowIndex, colIndex },
			};
		}
	}

	function handleCellMouseEnter(rowIndex: number, colIndex: number) {
		if (isSelecting && selectionStart) {
			selectionRange = {
				start: selectionStart,
				end: { rowIndex, colIndex },
			};
		}
	}

	function handleMouseUp() {
		if (isSelecting && selectionRange) {
			lastClickedCell = selectionRange.end;
		}
		isSelecting = false;
	}

	// Checkbox handlers
	function handleSelectAll(checked: boolean) {
		if (checked) {
			selectedRows = new Set(sortedData.map((d) => d.id));
		} else {
			selectedRows = new Set();
		}
		lastCheckedIndex = null;
	}

	function rowSelect(rowId: string, rowIndex: number, e: MouseEvent) {
		const result = handleRowSelect(
			sortedData,
			selectedRows,
			lastCheckedIndex,
			rowId,
			rowIndex,
			e,
		);
		selectedRows = result.selectedRows;
		lastCheckedIndex = result.lastCheckedIndex;
	}

	async function handleKeyDown(e: KeyboardEvent) {
		// Ctrl+C or Cmd+C to copy
		if ((e.ctrlKey || e.metaKey) && e.key === "c" && selectionRange) {
			e.preventDefault();
			const data = getSelectedCellsData(
				sortedData,
				activeHeaders,
				selectionRange,
			);
			copyToClipboard(data).then((success) => {
				console.log(success);

				if (success) {
					toast.success("Coppied data to clipboard!");
				} else {
					toast.error("Coppy failed! Please try again.");
				}
			});
		}

		// Escape to clear selection
		if (e.key === "Escape") {
			selectionRange = null;
			selectionStart = null;
			lastClickedCell = null;
		}
	}

	function handleClickOutside(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (!target.closest("table")) {
			selectionRange = null;
			selectionStart = null;
			lastClickedCell = null;
		}
	}
</script>

<svelte:window
	onkeydown={handleKeyDown}
	onmouseup={handleMouseUp}
	onclick={handleClickOutside}
/>

<div class="flex flex-1 flex-col gap-6">
	<NavDataTable
		{activeHeaders}
		{setActiveHeaders}
		{showAddButton}
		actions={headerActions}
	/>

	{#if initialLoad}
		{#if sortedData.length > 0}
			<div class="relative rounded-md border">
				<Table.Root>
					<Table.Header class="bg-muted/50">
						<Table.Row>
							{#if checkboxSelection}
								<Table.Head class="w-12 px-2">
									<Checkbox
										tabindex={-1}
										class="m-auto size-5"
										checked={isAllSelected}
										indeterminate={isIndeterminate}
										onCheckedChange={handleSelectAll}
									/>
								</Table.Head>
							{/if}
							<Table.Head
								class="w-12 px-4 text-center font-semibold select-none"
							>
								#
							</Table.Head>
							{#each activeHeaders as header (header)}
								<Table.Head
									class={[
										"cursor-move px-0! py-0! text-start font-semibold transition-colors select-none",
										dragOverColumn === header
											? "bg-primary/10"
											: "",
										draggedColumn === header
											? "opacity-50"
											: "",
									].join(" ")}
									draggable="true"
									ondragstart={() => onDragStart(header)}
									ondragover={(e) => onDragOver(e, header)}
									ondrop={(e) => onDrop(e, header)}
									ondragend={onDragEnd}
									ondragleave={onDragLeave}
								>
									<HeadDataTable
										{header}
										{activeHeaders}
										{setActiveHeaders}
									/>
								</Table.Head>
							{/each}
							<Table.Head class="w-12"></Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each sortedData as d, rowIndex (d.id)}
							<Table.Row class="border-b">
								{#if checkboxSelection}
									<Table.Cell class="w-12 px-2">
										<Checkbox
											class="m-auto size-5"
											checked={selectedRows.has(d.id)}
											tabindex={-1}
											onclick={(e) => {
												e.preventDefault();
												rowSelect(d.id, rowIndex, e);
											}}
										/>
									</Table.Cell>
								{/if}
								<Table.Cell
									class="w-12 px-4 text-center text-sm text-muted-foreground tabular-nums"
								>
									{startIndex + rowIndex}
								</Table.Cell>
								{#each activeHeaders as header, colIndex (header)}
									<Table.Cell
										class={[
											"w-32 cursor-cell p-0 px-4 text-left",
											isCellSelected(
												rowIndex,
												colIndex,
												selectionRange,
											)
												? "bg-primary/20"
												: "",
										].join(" ")}
										tabindex={-1}
										onmousedown={(e) =>
											handleCellMouseDown(
												rowIndex,
												colIndex,
												e,
											)}
										onclick={(e) =>
											handleCellClick(
												rowIndex,
												colIndex,
												e,
											)}
										onmouseenter={() =>
											handleCellMouseEnter(
												rowIndex,
												colIndex,
											)}
									>
										<RenderValueDataTable
											{header}
											value={d[header]}
										/>
									</Table.Cell>
								{/each}
								{#if showAction}
									<Table.Cell class="w-12">
										<ActionsDataTable
											id={d.id}
											{actions}
											{extraActions}
										/>
									</Table.Cell>
								{/if}
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		{:else}
			<div
				class="flex flex-1 flex-col items-center justify-center gap-6"
			>
				<div class="h-50 flex flex-col gap-3 justify-center items-center">
					<p class="text-5xl font-bold text-center">No records available!</p>
					{#if showAddButton}
						<Button
							size="lg"
							href={`${page.url.pathname}/create?redirectTo=${encodeURIComponent(`${page.url.pathname}?${page.url.searchParams.toString()}`)}`}
						>
							+ Add new {tableName.toLocaleLowerCase()}
						</Button>
					{/if}
				</div>
			</div>
		{/if}

		<div class="flex w-full items-center justify-between gap-4">
			{#if items.length > 0}
				<div class="text-muted-foreground text-sm">
					Showing {items.length}
					records
					{#if selectedRows.size > 0}
						<span class="ml-2 font-semibold">
							({selectedRows.size} selected)
						</span>
					{/if}
				</div>
			{/if}
			{#if activePaginate}
				<PaginateDataTable count={totalItems} />
			{/if}
		</div>
	{:else}
		{@const pageSize =
			Number(page.url.searchParams.get("pageSize")) || "10"}
		<LoadingDataTable
			rows={defaultHeaders.length}
			columns={Number(pageSize)}
		/>
	{/if}
</div>
