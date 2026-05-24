import { animate, stagger } from 'https://esm.sh/animejs';

// Coin burst animation when expense is added
export function coinBurst() {
    const coins = ['💸', '💰', '🪙', '💵', '💴'];
    const container = document.createElement('div');
    container.style.cssText = `
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        pointer-events: none;
        z-index: 9999;
    `;
    document.body.appendChild(container);

    for (let i = 0; i < 12; i++) {
        const coin = document.createElement('div');
        coin.textContent = coins[Math.floor(Math.random() * coins.length)];
        coin.style.cssText = `
            position: absolute;
            font-size: 1.5rem;
            left: ${30 + Math.random() * 40}%;
            top: 60%;
            opacity: 1;
            user-select: none;
        `;
        container.appendChild(coin);

        animate(coin, {
            translateY: [0, -(100 + Math.random() * 200)],
            translateX: [(Math.random() - 0.5) * 200],
            opacity: [1, 0],
            scale: [1, 0.5],
            rotate: [(Math.random() - 0.5) * 360],
            duration: 1000 + Math.random() * 500,
            ease: 'outExpo',
            delay: Math.random() * 200,
            onComplete: () => {
                if (coin === container.lastChild) {
                    document.body.removeChild(container);
                }
            }
        });
    }
}

// Animate stat numbers counting up
export function animateNumbers() {
    const elements = [
        document.getElementById('todayTotal'),
        document.getElementById('entryCount'),
        document.getElementById('total')
    ];

    elements.forEach(el => {
        if (!el) return;
        animate(el, {
            opacity: [0, 1],
            translateY: [10, 0],
            duration: 500,
            ease: 'outExpo'
        });
    });
}

// Animate cards on load
export function animateCards() {
    const cards = document.querySelectorAll('.card');
    animate(cards, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        ease: 'outExpo',
        delay: stagger(80)
    });
}