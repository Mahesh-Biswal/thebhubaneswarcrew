/* ============================================================
   THE BHUBANESWAR CREW — navbar.js
   ------------------------------------------------------------
   Navigation behaviour:

   01. Sticky header blur (adds .is-scrolled on scroll)
   02. Mobile menu toggle (adds .menu-open to <body>)
   03. Close the menu when a link is clicked
   04. Close the menu with the Escape key
   05. Close the menu when clicking outside it
   06. Highlight the active page link
   07. Lock background scroll while the menu is open
   ------------------------------------------------------------
   Depends on: jQuery 3.x
   ============================================================ */

(function ($) {
  'use strict';

  var $header    = $('#siteHeader');
  var $toggle    = $('#menuToggle');
  var $navLinks  = $('#navLinks');

  /* Scroll distance (px) after which the header gets its blur */
  var SCROLL_THRESHOLD = 40;

  /* ==========================================================
     01. HEADER BLUR ON SCROLL
     ========================================================== */
  function updateHeaderState() {
    $header.toggleClass('is-scrolled', $(window).scrollTop() > SCROLL_THRESHOLD);
  }

  $(window).on('scroll resize', updateHeaderState);

  /* ==========================================================
     02. MOBILE MENU TOGGLE
     Toggling the hamburger adds/removes .menu-open on <body>.
     The CSS in responsive.css animates the overlay in/out.
     ========================================================== */
  function openMenu() {
    $('body').addClass('menu-open');
    $toggle.attr('aria-expanded', 'true');
    $toggle.attr('aria-label', 'Close menu');
    $navLinks.attr('aria-hidden', 'false');
    lockScroll(true);
  }

  function closeMenu() {
    $('body').removeClass('menu-open');
    $toggle.attr('aria-expanded', 'false');
    $toggle.attr('aria-label', 'Open menu');
    $navLinks.attr('aria-hidden', 'true');
    lockScroll(false);
  }

  $toggle.on('click', function () {
    var isOpen = $('body').hasClass('menu-open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  /* ==========================================================
     03. CLOSE MENU WHEN A NAV LINK IS CLICKED
     ========================================================== */
  $navLinks.on('click', 'a', closeMenu);

  /* ==========================================================
     04. CLOSE MENU WITH THE ESCAPE KEY
     ========================================================== */
  $(document).on('keydown', function (event) {
    if (event.key === 'Escape' && $('body').hasClass('menu-open')) {
      closeMenu();
    }
  });

  /* ==========================================================
     05. CLOSE MENU WHEN CLICKING OUTSIDE THE HEADER
     ========================================================== */
  $(document).on('click', function (event) {
    if (!$('body').hasClass('menu-open')) {
      return;
    }
    /* Clicks inside the header (brand / toggle) are handled elsewhere */
    if ($(event.target).closest('.site-header').length === 0) {
      closeMenu();
    }
  });

  /* ==========================================================
     06. ACTIVE LINK HIGHLIGHTING
     Matches the current file name (index.html, about.html, ...)
     against every .nav-link href and marks the active one.
     ========================================================== */
  function highlightActiveLink() {
    var current = location.pathname.split('/').pop() || 'index.html';
    var found = false;

    $('#navLinks .nav-link').each(function () {
      var href = $(this).attr('href');

      /* Strip any hash/query part from the href before comparing */
      var cleanHref = href ? href.split('#')[0].split('?')[0] : '';

      if (cleanHref === current) {
        $(this).addClass('is-active').attr('aria-current', 'page');
        found = true;
      } else {
        $(this).removeClass('is-active').removeAttr('aria-current');
      }
    });

    /* Fallback: highlight Home when the URL does not end with a page name */
    if (!found) {
      $('#navLinks .nav-link[href="index.html"]').addClass('is-active').attr('aria-current', 'page');
    }
  }

  highlightActiveLink();

  /* ==========================================================
     07. LOCK BACKGROUND SCROLL
     Prevents the page behind the overlay from scrolling.
     ========================================================== */
  function lockScroll(lock) {
    $('body').css('overflow', lock ? 'hidden' : '');
  }

  /* Run the initial header state in case the page loads mid-scroll */
  updateHeaderState();

})(jQuery);
