<script>
    import { goto } from "$app/navigation";
    import { Button } from "$lib/components/ui/button";
    import { FieldLabel } from "$lib/components/ui/field";
    import { Input } from "$lib/components/ui/input";
    import { Separator } from "$lib/components/ui/separator";
    import { CircleUserIcon } from "lucide-svelte";
</script>

<div>
    <div
        class="flex flex-col justify-center w-105 bg-white rounded-2xl border-2 border-amber-200 overflow-hidden mb-4"
    >
        <div
            class="bg-linear-to-r from-[#FF930F] to-[#FFF95B] h-30 w-full"
        ></div>
        <div class="py-5 px-10 w-full">
            <h1 class="font-bold text-2xl mb-2">Sign in with FEID</h1>
            <h5 class="text-[14px] text-orange-800 mb-5">
                Please enter your FEID account information to continue accessing
                the system.
            </h5>
            <form>
                <FieldLabel class="mb-2">Username</FieldLabel>
                <Input class="mb-4" placeholder="Enter username" required />
                <FieldLabel class="mb-2">Password</FieldLabel>
                <Input placeholder="Enter password" required type="password" />
                <Button
                    variant="default"
                    class="group mb-5 bg-amber-400 text-black font-bold w-full mt-7 h-10 hover:text-white cursor-pointer flex justify-center items-center"
                    >Login</Button
                >
            </form>

            <span class="flex gap-3 justify-center items-center relative">
                <Separator orientation="horizontal" class="h-px! bg-stone-300"/>
                <span class="absolute bg-white px-4 text-stone-400 text-sm"
                    >OR</span
                >
            </span>
            <Button
                onclick={() => goto("/login")}
                variant="default"
                class="group w-full bg-white border border-amber-500 text-black font-bold mt-5 h-10 hover:text-white cursor-pointer flex justify-center items-center"
                ><CircleUserIcon
                    class="text-black group-hover:text-white h-10 text-center"
                /> Login with Google</Button
            >
        </div>
    </div>
    <p class="text-center w-105 text-[12px] text-stone-500 mb-2">
        By signing in, you agree to the Terms of Service and Privacy Policy of
        FPT University.
    </p>
    <p class="text-center w-105 text-[12px] text-stone-500">
        © 2024 FPT Education | Technical Support
    </p>
</div>
