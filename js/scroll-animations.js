/**
 * Scroll Animations for HelloEmily.dev
 * Implements scroll-triggered animations using Intersection Observer and GSAP
 */

class ScrollAnimations {
    /**
     * Initialize scroll animations
     */
    constructor(options = {}) {
        this.options = {
            rootMargin: '0px 0px -100px 0px',
            threshold: 0.1,
            animationDistance: 50,
            animationDuration: 0.8,
            staggerDelay: 0.1,
            ...options
        };

        this.observerOptions = {
            root: null,
            rootMargin: this.options.rootMargin,
            threshold: this.options.threshold
        };

        this.animatedElements = [];
        this.observer = null;
        this.gsapLoaded = false;
        this.scrollTriggerLoaded = false;
    }

    /**
     * Initialize the animation system
     */
    init() {
        // Check if IntersectionObserver is supported
        if (!('IntersectionObserver' in window)) {
            console.warn('IntersectionObserver not supported. Animations disabled.');
            this.showAllElements();
            return;
        }

        // Create observer
        this.observer = new IntersectionObserver(this.handleIntersection.bind(this), this.observerOptions);

        // Load GSAP if needed
        this.loadGSAP().then(() => {
            // Initialize animations
            this.initAnimations();
        });

        // Check for reduced motion preference
        this.checkReducedMotion();

        // Listen for preference changes
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => {
            this.checkReducedMotion();
        });
    }

    /**
     * Load GSAP and ScrollTrigger plugin
     * @returns {Promise} - Promise that resolves when GSAP is loaded
     */
    loadGSAP() {
        return new Promise((resolve) => {
            // Check if GSAP is already loaded
            if (window.gsap) {
                this.gsapLoaded = true;
                
                // Check if ScrollTrigger is loaded
                if (window.ScrollTrigger) {
                    this.scrollTriggerLoaded = true;
                    resolve();
                    return;
                }
            }

            // Load GSAP
            const gsapScript = document.createElement('script');
            gsapScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.4/gsap.min.js';
            gsapScript.async = true;
            
            gsapScript.onload = () => {
                this.gsapLoaded = true;
                
                // Load ScrollTrigger plugin
                const scrollTriggerScript = document.createElement('script');
                scrollTriggerScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.4/ScrollTrigger.min.js';
                scrollTriggerScript.async = true;
                
                scrollTriggerScript.onload = () => {
                    this.scrollTriggerLoaded = true;
                    resolve();
                };
                
                document.head.appendChild(scrollTriggerScript);
            };
            
            document.head.appendChild(gsapScript);
        });
    }

    /**
     * Initialize animations for all elements with data-animation attribute
     */
    initAnimations() {
        // Find all elements with data-animation attribute
        const elements = document.querySelectorAll('[data-animation]');
        
        elements.forEach(element => {
            // Add to observer
            this.observer.observe(element);
            
            // Store element for later reference
            this.animatedElements.push({
                element,
                animated: false,
                animation: element.dataset.animation || 'fade-in',
                delay: parseFloat(element.dataset.animationDelay) || 0
            });
            
            // Set initial state
            this.setInitialState(element);
        });

        // Initialize parallax effects if ScrollTrigger is loaded
        if (this.scrollTriggerLoaded) {
            this.initParallaxEffects();
        }
    }

    /**
     * Set initial state for an element based on its animation type
     * @param {Element} element - DOM element to animate
     */
    setInitialState(element) {
        if (!this.gsapLoaded) return;
        
        const animation = element.dataset.animation || 'fade-in';
        
        switch (animation) {
            case 'fade-in':
                gsap.set(element, { autoAlpha: 0 });
                break;
            case 'fade-up':
                gsap.set(element, { autoAlpha: 0, y: this.options.animationDistance });
                break;
            case 'fade-down':
                gsap.set(element, { autoAlpha: 0, y: -this.options.animationDistance });
                break;
            case 'fade-left':
                gsap.set(element, { autoAlpha: 0, x: -this.options.animationDistance });
                break;
            case 'fade-right':
                gsap.set(element, { autoAlpha: 0, x: this.options.animationDistance });
                break;
            case 'zoom-in':
                gsap.set(element, { autoAlpha: 0, scale: 0.8 });
                break;
            case 'zoom-out':
                gsap.set(element, { autoAlpha: 0, scale: 1.2 });
                break;
            default:
                // No initial state for unknown animations
                break;
        }
    }

    /**
     * Handle intersection events
     * @param {Array} entries - Intersection observer entries
     */
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Find the element in our tracked elements
                const animatedElement = this.animatedElements.find(item => item.element === entry.target);
                
                if (animatedElement && !animatedElement.animated) {
                    // Mark as animated
                    animatedElement.animated = true;
                    
                    // Animate the element
                    this.animateElement(animatedElement.element, animatedElement.animation, animatedElement.delay);
                    
                    // Stop observing this element
                    this.observer.unobserve(entry.target);
                }
            }
        });
    }

    /**
     * Animate an element based on its animation type
     * @param {Element} element - DOM element to animate
     * @param {string} animation - Animation type
     * @param {number} delay - Animation delay in seconds
     */
    animateElement(element, animation, delay) {
        if (!this.gsapLoaded) {
            // If GSAP isn't loaded, just show the element
            element.style.opacity = 1;
            element.style.transform = 'none';
            return;
        }
        
        const duration = this.options.animationDuration;
        
        switch (animation) {
            case 'fade-in':
                gsap.to(element, { autoAlpha: 1, duration, delay });
                break;
            case 'fade-up':
                gsap.to(element, { autoAlpha: 1, y: 0, duration, delay, ease: 'power2.out' });
                break;
            case 'fade-down':
                gsap.to(element, { autoAlpha: 1, y: 0, duration, delay, ease: 'power2.out' });
                break;
            case 'fade-left':
                gsap.to(element, { autoAlpha: 1, x: 0, duration, delay, ease: 'power2.out' });
                break;
            case 'fade-right':
                gsap.to(element, { autoAlpha: 1, x: 0, duration, delay, ease: 'power2.out' });
                break;
            case 'zoom-in':
                gsap.to(element, { autoAlpha: 1, scale: 1, duration, delay, ease: 'power2.out' });
                break;
            case 'zoom-out':
                gsap.to(element, { autoAlpha: 1, scale: 1, duration, delay, ease: 'power2.out' });
                break;
            default:
                // No animation for unknown types
                element.style.opacity = 1;
                element.style.transform = 'none';
                break;
        }
    }

    /**
     * Initialize parallax effects for elements with data-parallax attribute
     */
    initParallaxEffects() {
        if (!this.scrollTriggerLoaded) return;
        
        // Find all elements with data-parallax attribute
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        parallaxElements.forEach(element => {
            const speed = parseFloat(element.dataset.parallaxSpeed) || 0.2;
            const direction = element.dataset.parallaxDirection || 'up';
            let yPercent = 0;
            
            // Set direction
            if (direction === 'up') {
                yPercent = -20 * speed;
            } else if (direction === 'down') {
                yPercent = 20 * speed;
            }
            
            // Create parallax effect
            gsap.to(element, {
                yPercent,
                ease: 'none',
                scrollTrigger: {
                    trigger: element,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                }
            });
        });
    }

    /**
     * Check for reduced motion preference and disable animations if needed
     */
    checkReducedMotion() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.showAllElements();
        }
    }

    /**
     * Show all elements without animation (for reduced motion or fallback)
     */
    showAllElements() {
        this.animatedElements.forEach(item => {
            item.element.style.opacity = 1;
            item.element.style.transform = 'none';
            item.animated = true;
        });
    }

    /**
     * Refresh animations (useful after dynamic content changes)
     */
    refresh() {
        // Re-initialize animations
        this.initAnimations();
    }
}

// Create global instance
window.scrollAnimations = new ScrollAnimations();

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.scrollAnimations.init();
});