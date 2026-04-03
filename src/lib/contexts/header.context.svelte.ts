// $lib/contexts/header.context.svelte.ts
import { getContext, setContext } from 'svelte';

const HEADER_CTX_KEY = 'header-ctx';

export type HeaderCtx = {
    subtitle: string | null;
    setSubtitle: (value: string | null) => void;
};

export function setHeaderCtx() {
    let subtitle = $state<string | null>(null);

    const ctx: HeaderCtx = {
        get subtitle() { return subtitle; },
        setSubtitle(value) { subtitle = value; },
    };

    setContext(HEADER_CTX_KEY, ctx);
    return ctx;
}

export function getHeaderCtx(): HeaderCtx {
    return getContext(HEADER_CTX_KEY);
}