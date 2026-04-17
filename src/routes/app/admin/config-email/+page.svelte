<!-- +page.svelte -->
<script lang="ts">
    import { enhance } from "$app/forms";
    import type { PageData, ActionData } from "./$types";
    import * as Card from "$lib/components/ui/card";
    import * as Alert from "$lib/components/ui/alert";
    import { Input } from "$lib/components/ui/input";
    import { Button } from "$lib/components/ui/button";
    import { Badge } from "$lib/components/ui/badge";
    import { Separator } from "$lib/components/ui/separator";
    import { Label } from "$lib/components/ui/label";
    import { toast } from "svelte-sonner";
    import {
        CheckCircle,
        Mail,
        Server,
        Lock,
        User,
        AlertCircle,
        Eye,
        EyeOff,
        Loader2,
        ArrowLeftIcon,
    } from "lucide-svelte";
    import { goto } from "$app/navigation";

    let { data, form }: { data: PageData; form: ActionData } = $props();

    let showPassword = $state(false);
    let isSubmitting = $state(false);

    $effect(() => {
        if (form?.success) {
            toast.success("Email configuration updated successfully!");
        } else if (form?.message) {
            toast.error(form.message);
        }
    });
</script>

<div class="space-y-6 p-10">
    <Button
        variant="ghost"
        onclick={() => goto(`/app`)}
        class="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-50 rounded-lg px-3 py-2 text-sm font-medium transition-all cursor-pointer -ml-3"
    >
        <ArrowLeftIcon class="w-4 h-4" />
        Back
    </Button>

    <!-- Page Header -->
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-semibold tracking-tight">
                Email Configuration
            </h1>
            <p class="text-sm text-muted-foreground mt-1">
                Manage SMTP settings for system email notifications
            </p>
        </div>
        {#if data.emailSetting}
            <Badge
                variant="outline"
                class="gap-1.5 text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-400"
            >
                <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                Configured
            </Badge>
        {:else}
            <Badge
                variant="outline"
                class="gap-1.5 text-amber-600 border-amber-200 bg-amber-50"
            >
                <span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                Not Configured
            </Badge>
        {/if}
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
        <!-- Main Form -->
        <div class="lg:col-span-2">
            <Card.Root>
                <Card.Header class="pb-4">
                    <div class="flex items-center gap-2">
                        <div
                            class="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10"
                        >
                            <Server class="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <Card.Title class="text-base">SMTP Settings</Card.Title>
                            <Card.Description class="text-xs">
                                Outgoing mail server configuration
                            </Card.Description>
                        </div>
                    </div>
                </Card.Header>
                <Card.Content>
                    <form
                        method="POST"
                        action="?/updateEmailSetting"
                        use:enhance={() => {
                            isSubmitting = true;
                            return async ({ update }) => {
                                await update();
                                isSubmitting = false;
                            };
                        }}
                        class="space-y-5"
                    >
                        <!-- SMTP Host + Port -->
                        <div class="grid gap-4 sm:grid-cols-3">
                            <div class="sm:col-span-2 space-y-1.5">
                                <Label
                                    for="smtpHost"
                                    class="text-sm font-medium flex items-center gap-1.5"
                                >
                                    <Server class="h-3.5 w-3.5 text-muted-foreground" />
                                    SMTP Host
                                </Label>
                                <Input
                                    id="smtpHost"
                                    name="smtpHost"
                                    type="text"
                                    placeholder="smtp.gmail.com"
                                    value={data.emailSetting?.smtpHost ?? ""}
                                    required
                                    class="font-mono text-sm"
                                />
                            </div>
                            <div class="space-y-1.5">
                                <Label for="smtpPort" class="text-sm font-medium">
                                    Port
                                </Label>
                                <Input
                                    id="smtpPort"
                                    name="smtpPort"
                                    type="number"
                                    placeholder="587"
                                    value={data.emailSetting?.smtpPort ?? ""}
                                    required
                                    class="font-mono text-sm"
                                />
                            </div>
                        </div>

                        <Separator />

                        <!-- Sender Info -->
                        <div class="space-y-4">
                            <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <User class="h-3 w-3" />
                                Sender Information
                            </p>

                            <div class="grid gap-4 sm:grid-cols-2">
                                <div class="space-y-1.5">
                                    <Label for="senderName" class="text-sm font-medium">
                                        Display Name
                                    </Label>
                                    <Input
                                        id="senderName"
                                        name="senderName"
                                        type="text"
                                        placeholder="EELPM-FPT System"
                                        value={data.emailSetting?.senderName ?? ""}
                                        required
                                    />
                                </div>
                                <div class="space-y-1.5">
                                    <Label
                                        for="senderEmail"
                                        class="text-sm font-medium flex items-center gap-1.5"
                                    >
                                        <Mail class="h-3.5 w-3.5 text-muted-foreground" />
                                        Sender Email
                                    </Label>
                                    <Input
                                        id="senderEmail"
                                        name="senderEmail"
                                        type="email"
                                        placeholder="noreply@example.com"
                                        value={data.emailSetting?.senderEmail ?? ""}
                                        required
                                        class="font-mono text-sm"
                                    />
                                </div>
                            </div>

                            <!-- Password with show/hide toggle -->
                            <div class="space-y-1.5">
                                <Label
                                    for="senderPassword"
                                    class="text-sm font-medium flex items-center gap-1.5"
                                >
                                    <Lock class="h-3.5 w-3.5 text-muted-foreground" />
                                    App Password
                                    {#if data.emailSetting?.hasSenderPassword}
                                        <Badge variant="secondary" class="text-xs font-normal ml-1">
                                            Set
                                        </Badge>
                                    {/if}
                                </Label>
                                <div class="relative">
                                    <Input
                                        id="senderPassword"
                                        name="senderPassword"
                                        type={showPassword ? "text" : "password"}
                                        placeholder={data.emailSetting?.hasSenderPassword
                                            ? "••••••••••••••••"
                                            : "Enter App Password"}
                                        class="pr-10 font-mono text-sm"
                                    />
                                    <button
                                        type="button"
                                        onclick={() => (showPassword = !showPassword)}
                                        class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        aria-label="Toggle password visibility"
                                    >
                                        {#if showPassword}
                                            <EyeOff class="h-4 w-4" />
                                        {:else}
                                            <Eye class="h-4 w-4" />
                                        {/if}
                                    </button>
                                </div>
                                {#if data.emailSetting?.hasSenderPassword}
                                    <p class="text-xs text-muted-foreground">
                                        Leave blank to keep the current password unchanged
                                    </p>
                                {/if}
                            </div>
                        </div>

                        <!-- Error Alert -->
                        {#if form && !form.success && form.message}
                            <Alert.Root variant="destructive" class="py-3">
                                <AlertCircle class="h-4 w-4" />
                                <Alert.Description class="text-sm">
                                    {form.message}
                                </Alert.Description>
                            </Alert.Root>
                        {/if}

                        <!-- Submit Button -->
                        <div class="flex justify-end pt-1">
                            <Button type="submit" disabled={isSubmitting} class="min-w-32">
                                {#if isSubmitting}
                                    <Loader2 class="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                {:else}
                                    <CheckCircle class="h-4 w-4 mr-2" />
                                    Save Configuration
                                {/if}
                            </Button>
                        </div>
                    </form>
                </Card.Content>
            </Card.Root>
        </div>

        <!-- Sidebar: Summary + Help -->
        <div class="space-y-4">
            {#if data.emailSetting}
                <Card.Root class="border-dashed">
                    <Card.Header class="pb-3">
                        <Card.Title class="text-sm flex items-center gap-2">
                            <Mail class="h-4 w-4 text-muted-foreground" />
                            Current Configuration
                        </Card.Title>
                    </Card.Header>
                    <Card.Content class="space-y-2.5 text-sm">
                        <div class="flex justify-between items-center gap-2">
                            <span class="text-muted-foreground shrink-0">Host</span>
                            <span class="font-mono text-xs truncate">
                                {data.emailSetting.smtpHost}
                            </span>
                        </div>
                        <div class="flex justify-between items-center gap-2">
                            <span class="text-muted-foreground shrink-0">Port</span>
                            <Badge variant="outline" class="font-mono text-xs">
                                {data.emailSetting.smtpPort}
                            </Badge>
                        </div>
                        <div class="flex justify-between items-center gap-2">
                            <span class="text-muted-foreground shrink-0">Email</span>
                            <span class="font-mono text-xs truncate">
                                {data.emailSetting.senderEmail}
                            </span>
                        </div>
                        <div class="flex justify-between items-center gap-2">
                            <span class="text-muted-foreground shrink-0">Name</span>
                            <span class="text-xs">{data.emailSetting.senderName}</span>
                        </div>
                        <div class="flex justify-between items-center gap-2">
                            <span class="text-muted-foreground shrink-0">Password</span>
                            <Badge
                                variant={data.emailSetting.hasSenderPassword
                                    ? "secondary"
                                    : "outline"}
                                class="text-xs"
                            >
                                {data.emailSetting.hasSenderPassword ? "Set" : "Not set"}
                            </Badge>
                        </div>
                    </Card.Content>
                </Card.Root>
            {/if}

            <!-- Gmail Guide -->
            <Card.Root
                class="bg-blue-50/50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900"
            >
                <Card.Header class="pb-2">
                    <Card.Title class="text-sm text-blue-700 dark:text-blue-400">
                        💡 Gmail Setup Guide
                    </Card.Title>
                </Card.Header>
                <Card.Content
                    class="text-xs text-blue-600/80 dark:text-blue-400/80 space-y-1.5"
                >
                    <p>To use Gmail as your SMTP provider:</p>
                    <ol class="list-decimal list-inside space-y-1">
                        <li>Enable <strong>2-Factor Authentication</strong></li>
                        <li>Go to <strong>App Passwords</strong> in your Google Account</li>
                        <li>Generate a new App Password for this app</li>
                        <li>Use the App Password instead of your Gmail password</li>
                    </ol>
                    <div class="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                        <p class="font-medium">Recommended settings:</p>
                        <p>Host: <code class="font-mono">smtp.gmail.com</code></p>
                        <p>Port: <code class="font-mono">587</code> (TLS)</p>
                    </div>
                </Card.Content>
            </Card.Root>
        </div>
    </div>
</div>