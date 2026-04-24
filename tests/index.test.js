/**
 * Comprehensive tests for gourishgg.github.io/index.html
 *
 * Covers:
 *   1. HTML structure – sections, headings, footer
 *   2. Certificate cards – required fields, view buttons, optional verify links
 *   3. Modal (lightbox) – open / close behaviour
 *   4. Scroll-animation setup – IntersectionObserver targets
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Load index.html into jsdom, execute the embedded <script>, and return the
 * document.  IntersectionObserver is mocked so the code that wires it up
 * does not throw in the headless environment.
 */
function loadPage() {
    const html = fs.readFileSync(
        path.resolve(__dirname, '..', 'index.html'),
        'utf8'
    );

    // Track which elements the observer was asked to watch.
    const observedElements = [];
    const unobservedElements = [];

    global.IntersectionObserver = jest.fn().mockImplementation((callback, options) => ({
        observe: jest.fn((el) => observedElements.push(el)),
        unobserve: jest.fn((el) => unobservedElements.push(el)),
        disconnect: jest.fn(),
        _callback: callback,
        _options: options,
        _observed: observedElements,
    }));

    document.documentElement.innerHTML = html;

    // Execute every inline <script> block in order.
    document.querySelectorAll('script').forEach((scriptEl) => {
        // eslint-disable-next-line no-new-func
        new Function(scriptEl.textContent)();
    });

    return { document, observedElements, unobservedElements };
}

// ---------------------------------------------------------------------------
// 1. HTML Structure
// ---------------------------------------------------------------------------

describe('HTML Structure', () => {
    beforeEach(() => loadPage());

    test('page has a single <header> element', () => {
        expect(document.querySelectorAll('header')).toHaveLength(1);
    });

    test("header contains the person's name", () => {
        const h1 = document.querySelector('header h1');
        expect(h1).not.toBeNull();
        expect(h1.textContent.trim()).toBe('GOURISH KAPOOR');
    });

    test('header shows the degree credential', () => {
        const credential = document.querySelector('header .main-credential');
        expect(credential).not.toBeNull();
        expect(credential.textContent).toMatch(/Bachelor of Engineering/i);
    });

    test('header shows the university name', () => {
        const sub = document.querySelector('header .sub-credential');
        expect(sub).not.toBeNull();
        expect(sub.textContent).toMatch(/Chitkara University/i);
    });

    test('page has exactly three category headings', () => {
        const headings = document.querySelectorAll('h2.category-title');
        expect(headings).toHaveLength(3);
    });

    test('University section heading exists with correct id', () => {
        expect(document.getElementById('university-title')).not.toBeNull();
    });

    test('Specialized section heading exists with correct id', () => {
        expect(document.getElementById('specialized-title')).not.toBeNull();
    });

    test('Technical section heading exists with correct id', () => {
        expect(document.getElementById('technical-title')).not.toBeNull();
    });

    test('page has a <footer> with copyright text', () => {
        const footer = document.querySelector('footer');
        expect(footer).not.toBeNull();
        expect(footer.textContent).toMatch(/Gourish Kapoor/i);
        expect(footer.textContent).toMatch(/All rights reserved/i);
    });

    test('modal element with id "imageModal" exists', () => {
        expect(document.getElementById('imageModal')).not.toBeNull();
    });

    test('modal contains an img with id "modalImage"', () => {
        expect(document.getElementById('modalImage')).not.toBeNull();
    });

    test('modal contains a close button with class "close-modal"', () => {
        expect(document.querySelector('.close-modal')).not.toBeNull();
    });
});

// ---------------------------------------------------------------------------
// 2. Certificate Cards
// ---------------------------------------------------------------------------

describe('Certificate Cards', () => {
    beforeEach(() => loadPage());

    test('at least one certificate card exists in the university grid', () => {
        const grid = document.getElementById('university-grid');
        expect(grid).not.toBeNull();
        expect(grid.querySelectorAll('.certificate-card').length).toBeGreaterThan(0);
    });

    test('at least one certificate card exists in the specialized grid', () => {
        const grid = document.getElementById('specialized-grid');
        expect(grid).not.toBeNull();
        expect(grid.querySelectorAll('.certificate-card').length).toBeGreaterThan(0);
    });

    test('at least one certificate card exists in the technical grid', () => {
        const grid = document.getElementById('technical-grid');
        expect(grid).not.toBeNull();
        expect(grid.querySelectorAll('.certificate-card').length).toBeGreaterThan(0);
    });

    test('every certificate card has a non-empty title', () => {
        document.querySelectorAll('.certificate-card').forEach((card) => {
            const title = card.querySelector('.certificate-title');
            expect(title).not.toBeNull();
            expect(title.textContent.trim().length).toBeGreaterThan(0);
        });
    });

    test('every certificate card has a non-empty issuer', () => {
        document.querySelectorAll('.certificate-card').forEach((card) => {
            const issuer = card.querySelector('.certificate-issuer');
            expect(issuer).not.toBeNull();
            expect(issuer.textContent.trim().length).toBeGreaterThan(0);
        });
    });

    test('every certificate card has a non-empty date', () => {
        document.querySelectorAll('.certificate-card').forEach((card) => {
            const date = card.querySelector('.certificate-date');
            expect(date).not.toBeNull();
            expect(date.textContent.trim().length).toBeGreaterThan(0);
        });
    });

    test('every certificate card has a "View Certificate" button', () => {
        document.querySelectorAll('.certificate-card').forEach((card) => {
            const btn = card.querySelector('.view-cert-btn');
            expect(btn).not.toBeNull();
            expect(btn.tagName).toBe('BUTTON');
        });
    });

    test('every "View Certificate" button carries a non-empty data-src attribute', () => {
        document.querySelectorAll('.view-cert-btn').forEach((btn) => {
            const src = btn.getAttribute('data-src');
            expect(src).not.toBeNull();
            expect(src.trim().length).toBeGreaterThan(0);
        });
    });

    test('verify links open in a new tab (target="_blank")', () => {
        document.querySelectorAll('.verify-link').forEach((link) => {
            expect(link.getAttribute('target')).toBe('_blank');
        });
    });

    test('verify links have non-empty href attributes', () => {
        document.querySelectorAll('.verify-link').forEach((link) => {
            const href = link.getAttribute('href');
            expect(href).not.toBeNull();
            expect(href.trim().length).toBeGreaterThan(0);
        });
    });

    test('university cards carry the "university-accent" CSS class', () => {
        const universityGrid = document.getElementById('university-grid');
        universityGrid.querySelectorAll('.certificate-card').forEach((card) => {
            expect(card.classList.contains('university-accent')).toBe(true);
        });
    });
});

// ---------------------------------------------------------------------------
// 3. Modal (Lightbox) Behaviour
// ---------------------------------------------------------------------------

describe('Modal behaviour', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        loadPage();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('modal is hidden by default', () => {
        const modal = document.getElementById('imageModal');
        // The modal should not be visibly displayed before any interaction.
        expect(modal.style.display).not.toBe('block');
    });

    test('clicking a "View Certificate" button displays the modal', () => {
        const btn = document.querySelector('.view-cert-btn');
        btn.click();
        jest.runAllTimers();

        const modal = document.getElementById('imageModal');
        expect(modal.style.display).toBe('block');
    });

    test('clicking a button sets the correct image src on the modal image', () => {
        const btn = document.querySelector('.view-cert-btn');
        const expectedSrc = btn.getAttribute('data-src');
        btn.click();
        jest.runAllTimers();

        const modalImg = document.getElementById('modalImage');
        expect(modalImg.src).toContain(expectedSrc);
    });

    test('clicking a button adds the "show" CSS class to the modal', () => {
        const btn = document.querySelector('.view-cert-btn');
        btn.click();
        jest.runAllTimers();

        const modal = document.getElementById('imageModal');
        expect(modal.classList.contains('show')).toBe(true);
    });

    test('clicking the close button removes the "show" class', () => {
        const btn = document.querySelector('.view-cert-btn');
        btn.click();
        jest.runAllTimers();

        const closeBtn = document.querySelector('.close-modal');
        closeBtn.click();

        const modal = document.getElementById('imageModal');
        expect(modal.classList.contains('show')).toBe(false);
    });

    test('clicking the close button eventually hides the modal (after CSS transition)', () => {
        const btn = document.querySelector('.view-cert-btn');
        btn.click();
        jest.runAllTimers();

        const closeBtn = document.querySelector('.close-modal');
        closeBtn.click();
        jest.runAllTimers();

        const modal = document.getElementById('imageModal');
        expect(modal.style.display).toBe('none');
    });

    test('closing the modal clears the image src', () => {
        const btn = document.querySelector('.view-cert-btn');
        btn.click();
        jest.runAllTimers();

        document.querySelector('.close-modal').click();
        jest.runAllTimers();

        const modalImg = document.getElementById('modalImage');
        // jsdom resolves `src=""` to an absolute URL; use getAttribute to check
        // for the raw empty-string value the script sets.
        expect(modalImg.getAttribute('src')).toBe('');
    });

    test('clicking outside the modal (on the overlay) closes it', () => {
        const btn = document.querySelector('.view-cert-btn');
        btn.click();
        jest.runAllTimers();

        // Simulate click whose target is the modal overlay element itself.
        const modal = document.getElementById('imageModal');
        const event = new window.MouseEvent('click', { bubbles: true });
        Object.defineProperty(event, 'target', { value: modal });
        window.dispatchEvent(event);
        jest.runAllTimers();

        expect(modal.style.display).toBe('none');
    });

    test('pressing Escape while modal is open closes it', () => {
        const btn = document.querySelector('.view-cert-btn');
        btn.click();
        jest.runAllTimers();

        const escEvent = new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
        document.dispatchEvent(escEvent);
        jest.runAllTimers();

        const modal = document.getElementById('imageModal');
        expect(modal.style.display).toBe('none');
    });

    test('pressing Escape when modal is closed has no effect', () => {
        const modal = document.getElementById('imageModal');
        // modal is closed by default
        const escEvent = new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
        document.dispatchEvent(escEvent);
        jest.runAllTimers();

        // Should still not be 'block'
        expect(modal.style.display).not.toBe('block');
    });

    test('pressing a non-Escape key does not close an open modal', () => {
        const btn = document.querySelector('.view-cert-btn');
        btn.click();
        jest.runAllTimers();

        const otherKey = new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
        document.dispatchEvent(otherKey);
        jest.runAllTimers();

        const modal = document.getElementById('imageModal');
        expect(modal.style.display).toBe('block');
    });

    test('each certificate button opens the modal with its own image', () => {
        const buttons = document.querySelectorAll('.view-cert-btn');
        expect(buttons.length).toBeGreaterThan(1);

        buttons.forEach((btn) => {
            // Close any open modal first.
            document.querySelector('.close-modal').click();
            jest.runAllTimers();

            btn.click();
            jest.runAllTimers();

            const modalImg = document.getElementById('modalImage');
            expect(modalImg.src).toContain(btn.getAttribute('data-src'));
        });
    });
});

// ---------------------------------------------------------------------------
// 4. Scroll-Animation Setup (IntersectionObserver)
// ---------------------------------------------------------------------------

describe('Scroll animation setup', () => {
    const expectedIds = [
        'university-title',
        'university-grid',
        'specialized-title',
        'specialized-grid',
        'technical-title',
        'technical-grid',
    ];

    test('IntersectionObserver is instantiated once', () => {
        loadPage();
        expect(global.IntersectionObserver).toHaveBeenCalledTimes(1);
    });

    test('observer is created with 0.1 threshold', () => {
        loadPage();
        const [, options] = global.IntersectionObserver.mock.calls[0];
        expect(options.threshold).toBe(0.1);
    });

    test('all six expected elements are observed', () => {
        const { observedElements } = loadPage();
        const observedIds = observedElements.map((el) => el.id);
        expectedIds.forEach((id) => {
            expect(observedIds).toContain(id);
        });
    });

    test('exactly six elements are observed', () => {
        const { observedElements } = loadPage();
        expect(observedElements).toHaveLength(expectedIds.length);
    });

    test('observer callback adds "active" class when entry is intersecting', () => {
        loadPage();

        // Retrieve the callback passed to the mock constructor.
        const observerInstance = global.IntersectionObserver.mock.results[0].value;
        const callback = observerInstance._callback;

        const fakeElement = document.createElement('div');
        const mockObserver = { unobserve: jest.fn() };
        const entries = [{ isIntersecting: true, target: fakeElement }];

        callback(entries, mockObserver);

        expect(fakeElement.classList.contains('active')).toBe(true);
        expect(mockObserver.unobserve).toHaveBeenCalledWith(fakeElement);
    });

    test('observer callback does NOT add "active" class when entry is not intersecting', () => {
        loadPage();

        const observerInstance = global.IntersectionObserver.mock.results[0].value;
        const callback = observerInstance._callback;

        const fakeElement = document.createElement('div');
        const mockObserver = { unobserve: jest.fn() };
        const entries = [{ isIntersecting: false, target: fakeElement }];

        callback(entries, mockObserver);

        expect(fakeElement.classList.contains('active')).toBe(false);
        expect(mockObserver.unobserve).not.toHaveBeenCalled();
    });
});
