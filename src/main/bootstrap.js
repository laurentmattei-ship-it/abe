(function (global) {
    const api = {
        initialiserApplication(AbeApplicationClass) {
            if (typeof document === 'undefined' || typeof AbeApplicationClass !== 'function') return;

            document.addEventListener('DOMContentLoaded', () => {
                global.abeApp = new AbeApplicationClass();

                const modalMobileBlock = document.getElementById('modal-mobile-block');
                const modalMobileBlockDismissBtn = document.getElementById('modal-mobile-block-dismiss-btn');
                let mobileBlockDismissed = false;

                if (modalMobileBlockDismissBtn) {
                    modalMobileBlockDismissBtn.addEventListener('click', () => {
                        mobileBlockDismissed = true;
                        if (modalMobileBlock) modalMobileBlock.classList.add('hidden');
                    });
                }

                function verifierResolutionMobile() {
                    if (!modalMobileBlock || mobileBlockDismissed) return;
                    if (global.innerWidth <= 768) {
                        modalMobileBlock.classList.remove('hidden');
                    } else {
                        modalMobileBlock.classList.add('hidden');
                    }
                }
                verifierResolutionMobile();
                global.addEventListener('resize', verifierResolutionMobile);
            });
        }
    };

    global.AbeMainBootstrap = api;
})(typeof window !== 'undefined' ? window : globalThis);
