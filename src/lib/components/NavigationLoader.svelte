<!-- A black overlay with a pulsing ChowBenin Logo -->
<div
    class="fixed z-50 flex h-[calc(100vh+4rem)] top-[-2rem] w-screen items-center justify-center bg-black/80"
>
    <img src="/images/logo-primary.svg" alt="ChowBenin Logo" class="animate-image" />
</div>

<style>
    .animate-image {
        animation: pulse 2s infinite;
    }

    @keyframes pulse {
        0% {
            transform: scale(0.9);
            opacity: 0.5;
        }
        50% {
            transform: scale(1.1);
            opacity: 1;
        }
        100% {
            transform: scale(0.9);
            opacity: 0.5;
        }
    }

</style>