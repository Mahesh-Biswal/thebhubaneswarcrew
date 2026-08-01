/* ============================================================
   THE BHUBANESWAR CREW — main.js
   ------------------------------------------------------------
   Page-level, generic functionality used on every page:

   01. Preloader hide (on window load + safety timeout)
   02. Scroll progress bar (top gradient bar)
   03. Back-to-top button (show / hide + smooth scroll)
   04. Smooth scrolling for same-page anchor links
   05. Auto-updating footer year
   ------------------------------------------------------------
   Depends on: jQuery 3.x (loaded before this file).
   ============================================================ */

/* Wrap everything in an IIFE to keep the global scope clean */
(function ($) {
  'use strict';

  /* ==========================================================
     01. PRELOADER
     Hide the full-screen loader once all resources are loaded.
     A safety timeout guarantees it never blocks the page.
     ========================================================== */
  var preloaderHidden = false;

  function hidePreloader() {
    if (preloaderHidden) {
      return;
    }
    preloaderHidden = true;
    $('#preloader').addClass('is-hidden');

    /* Remove the loader from the DOM after the fade-out ends */
    setTimeout(function () {
      $('#preloader').remove();
    }, 800);
  }

  /* Fire immediately if the page is already fully loaded... */
  if (document.readyState === 'complete') {
    hidePreloader();
  } else {
    /* ...otherwise wait for the window load event. */
    $(window).on('load', hidePreloader);
  }

  /* Safety net: never show the loader for more than 3 seconds. */
  setTimeout(hidePreloader, 3000);

  /* ==========================================================
     02. SCROLL PROGRESS BAR
     Sets the width of #scrollProgress based on how far down
     the page has been scrolled. Throttled with requestAnimationFrame.
     ========================================================== */
  var ticking = false;

  function updateScrollProgress() {
    var doc = document.documentElement;
    var scrolled = window.pageYOffset || doc.scrollTop;
    var maxScroll = doc.scrollHeight - window.innerHeight;

    /* Avoid division by zero on pages shorter than the viewport */
    var percent = maxScroll > 0 ? (scrolled / maxScroll) * 100 : 0;
    $('#scrollProgress').css('width', percent + '%');
    ticking = false;
  }

  function requestProgressUpdate() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateScrollProgress);
    }
  }

  $(window).on('scroll resize', requestProgressUpdate);

  /* ==========================================================
     03. BACK TO TOP BUTTON
     Appears after scrolling past 500px; scrolls smoothly up.
     ========================================================== */
  function updateBackToTop() {
    $('#backToTop').toggleClass('is-visible', $(window).scrollTop() > 500);
  }

  $(window).on('scroll', updateBackToTop);

  $('#backToTop').on('click', function () {
    scrollToTop();
  });

  function scrollToTop() {
    /* Respect users who prefer reduced motion */
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      window.scrollTo(0, 0);
    } else {
      $('html, body').animate({ scrollTop: 0 }, 700);
    }
  }

  /* ==========================================================
     04. SMOOTH SCROLL FOR SAME-PAGE ANCHORS
     Handles links such as  href="#features"  or  href="#community"
     with an offset that keeps the fixed navbar from covering
     the section title.
     ========================================================== */
  var NAV_OFFSET = 92; /* must match --nav-height + a little breathing room */

  $(document).on('click', 'a[href^="#"]', function (event) {
    var target = $(this).attr('href');

    /* Ignore plain "#" links and cross-page anchors like "page.html#x" */
    if (target.length <= 1 || target.indexOf('#') > 0) {
      return;
    }

    var $target = $(target);
    if (!$target.length) {
      return;
    }

    event.preventDefault();

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var targetTop = $target.offset().top - NAV_OFFSET;

    if (prefersReducedMotion) {
      window.scrollTo(0, targetTop);
    } else {
      $('html, body').animate({ scrollTop: targetTop }, 700);
    }

    /* Update the URL hash without jumping */
    if (history.pushState) {
      history.pushState(null, '', target);
    }
  });

  /* ==========================================================
     05. FOOTER YEAR
     Keep the copyright year current automatically.
     ========================================================== */
  $('#footerYear').text(new Date().getFullYear());

})(jQuery);
