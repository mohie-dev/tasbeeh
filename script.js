document.addEventListener('DOMContentLoaded', () => {
    // State variables
    let count = 0;
    let sessionCount = 0;
    let selectedDhikr = 'سبحان الله';
    let theme = 'light';

    // DOM Elements
    const tapBtn = document.getElementById('tap-btn');
    const resetBtn = document.getElementById('reset-btn');
    const counterDisplay = document.getElementById('counter');
    const currentDhikrDisplay = document.getElementById('current-dhikr-display');
    const dhikrSelector = document.getElementById('dhikr-selector');
    
    const progressRingCircle = document.getElementById('progress-ring-circle');
    
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
    
    const shareBtn = document.getElementById('share-btn');
    
    const confirmModal = document.getElementById('confirm-modal');
    const cancelResetBtn = document.getElementById('cancel-reset-btn');
    const confirmResetBtn = document.getElementById('confirm-reset-btn');

    const toast = document.getElementById('toast');

    // Ring configuration for SVG
    let ringRadius = 140; // Default desktop
    if (window.innerWidth <= 600) {
        ringRadius = 115; // Mobile adjustment
    }
    const ringCircumference = ringRadius * 2 * Math.PI;
    
    function initRing() {
        if(progressRingCircle) {
            progressRingCircle.style.strokeDasharray = `${ringCircumference} ${ringCircumference}`;
            progressRingCircle.style.strokeDashoffset = ringCircumference;
        }
    }

    // Initialize state from local storage
    function init() {
        const savedState = JSON.parse(localStorage.getItem('tasbeehState')) || {};
        
        sessionCount = savedState.sessionCount || 0;
        count = sessionCount; // UI primarily tracks session count for the main circle
        selectedDhikr = savedState.selectedDhikr || 'سبحان الله';
        theme = savedState.theme || 'light';

        initRing();
        applyTheme(theme);
        updateUI();
        setupChips();
        
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });
    }

    // Save state to local storage
    function saveState() {
        const state = {
            sessionCount,
            selectedDhikr,
            theme
        };
        localStorage.setItem('tasbeehState', JSON.stringify(state));
    }

    // Update the entire UI
    function updateUI() {
        counterDisplay.innerText = sessionCount;
        currentDhikrDisplay.innerText = selectedDhikr;
        
        updateProgress();
    }

    // Update Progress Bar and Ring
    function updateProgress() {
        let progress = 0;
        if (sessionCount > 0) {
            if (sessionCount % 33 === 0) {
                progress = 100;
            } else {
                progress = ((sessionCount % 33) / 33) * 100;
            }
        }
        
        // Update ring
        if (progressRingCircle) {
            const offset = ringCircumference - (progress / 100) * ringCircumference;
            progressRingCircle.style.strokeDashoffset = offset;
        }
    }

    // Handle Tap
    function handleTap(e) {
        // Prevent default double-tap zoom on some mobile browsers
        e.preventDefault();
        
        sessionCount++;
        
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(50); // Short vibration
        }

        // Add bump animation to counter
        counterDisplay.classList.remove('bump');
        void counterDisplay.offsetWidth; // Trigger reflow
        counterDisplay.classList.add('bump');
        
        updateUI();
        saveState();
    }

    // Setup Dhikr and Goal chips
    function setupChips() {
        // Dhikr chips
        const dhikrChips = dhikrSelector.querySelectorAll('.chip');
        dhikrChips.forEach(chip => {
            if (chip.dataset.dhikr === selectedDhikr) {
                chip.classList.add('active');
            } else {
                chip.classList.remove('active');
            }
            
            chip.addEventListener('click', () => {
                dhikrChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                selectedDhikr = chip.dataset.dhikr;
                updateUI();
                saveState();
            });
        });
    }



    // Reset Logic
    resetBtn.addEventListener('click', () => {
        confirmModal.classList.add('active');
    });

    cancelResetBtn.addEventListener('click', () => {
        confirmModal.classList.remove('active');
    });

    confirmResetBtn.addEventListener('click', () => {
        sessionCount = 0;
        updateUI();
        saveState();
        confirmModal.classList.remove('active');
    });

    // Theme Toggle Logic
    function applyTheme(newTheme) {
        theme = newTheme;
        document.documentElement.setAttribute('data-theme', theme);
        if (theme === 'dark') {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        } else {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        }
        saveState();
    }

    themeToggle.addEventListener('click', () => {
        applyTheme(theme === 'light' ? 'dark' : 'light');
    });

    // Share Logic
    shareBtn.addEventListener('click', async () => {
        const shareData = {
            title: 'السبحة الإلكترونية',
            text: 'اللهم اغفر لها وارحمها وعافها واعف عنها، واجعل هذا العمل سببًا في استمرار الأجر لها. شارك في الأجر واستخدم هذه السبحة الإلكترونية.',
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`).then(() => {
                showToast();
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        }
    });

    function showToast() {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Event Listeners for tap button
    // Support both mouse click and touch
    tapBtn.addEventListener('touchstart', handleTap, {passive: false});
    tapBtn.addEventListener('mousedown', (e) => {
        if(e.pointerType !== 'touch') { // prevent firing twice if browser simulates mouse events
            handleTap(e);
        }
    });

    // Re-adjust ring on resize
    window.addEventListener('resize', () => {
        let newRadius = window.innerWidth <= 600 ? 115 : 140;
        if (newRadius !== ringRadius) {
            ringRadius = newRadius;
            const newCircumference = ringRadius * 2 * Math.PI;
            if (progressRingCircle) {
                progressRingCircle.style.strokeDasharray = `${newCircumference} ${newCircumference}`;
                // Re-calculate offset based on current progress
                let progress = 0;
                if (sessionCount > 0) {
                    if (sessionCount % 33 === 0) {
                        progress = 100;
                    } else {
                        progress = ((sessionCount % 33) / 33) * 100;
                    }
                }
                const offset = newCircumference - (progress / 100) * newCircumference;
                progressRingCircle.style.strokeDashoffset = offset;
            }
        }
    });

    // Run initialization
    init();
});
