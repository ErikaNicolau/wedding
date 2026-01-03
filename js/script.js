(function ($) {
  $(document).ready(function () {
    "use strict";

    /*RSVP Form*/
    $(".submit_block_1").on("click", function (e) {
      send_form('block_1');
      return false;
    });
    
    // Handle radio button visual feedback
    $('.radio-option input[type="radio"]').on('change', function() {
      $('.radio-option').removeClass('checked');
      $(this).closest('.radio-option').addClass('checked');
    });
    
    /* Social Media Bubbles */
    $('.social-trigger').on('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var $wrapper = $(this).closest('.social-icon-wrapper');
      var $bubbles = $wrapper.find('.social-bubbles');
      var platform = $(this).data('platform');
      
      // Close all other bubbles
      $('.social-bubbles').not($bubbles).removeClass('active');
      
      // Toggle current bubbles
      $bubbles.toggleClass('active');
      
    });
    
    // Close bubbles when clicking outside
    $(document).on('click', function(e) {
      if (!$(e.target).closest('.social-icon-wrapper').length) {
        $('.social-bubbles').removeClass('active');
      }
    });
    
    // Prevent closing when clicking on bubbles
    $('.social-bubble').on('click', function(e) {
      e.stopPropagation();
    });

    function send_form (type) {
      var isValid = true;
      
      // Clear previous errors
      $('.error-message').removeClass('show').text('');
      $('.form-control').removeClass('error');
      
      // Validate name
      var name = $("input#name_" + type).val().trim();
      if (name == "") {
        showError('error_name_' + type, "Te rugăm să introduci numele tău.");
        $("input#name_" + type).addClass('error').focus();
        isValid = false;
      }
      
      // Validate attending
      var attending = $("input#attending_" + type).val();
      if (attending == "" || attending < 1) {
        showError('error_attending_' + type, "Te rugăm să introduci numărul de persoane (minimum 1).");
        $("input#attending_" + type).addClass('error').focus();
        isValid = false;
      }
      
      // Validate attendance radio
      var attendance = $("input[name='attendance_" + type + "']:checked").val();
      if (!attendance) {
        showError('error_attendance_' + type, "Te rugăm să selectezi o opțiune pentru confirmarea prezenței.");
        isValid = false;
      }
      
      if (!isValid) {
        return false;
      }
      
      // Disable submit button
      $('.submit_block_1').prop('disabled', true).text('Se trimite...');
      
      // Add a small delay for better UX
      setTimeout(function() {
        // Start envelope animation
        $('.paper').addClass('folding');
      }, 100);
      
      var details = $("textarea#details_" + type).val();
      
      // Prepare data for Google Sheets
      var formData = {
        name: name,
        attending: attending,
        details: details || '',
        attendance: attendance
      };
      
      // Show thank you message after animation
      setTimeout(function() {
        $('.paper').css('display', 'none');
        $('#thank_you_message').addClass('show');
      }, 1100);
      
      // Submit form to Google Sheets via Apps Script
      var scriptUrl = 'https://script.google.com/macros/s/AKfycbwNsq640UVPw5iA8F5RX-6avqPa7NyH11t69uw5gC2NQA--KUQP-hhBfq40ExOvc7AM/exec';
      
      // Submit using AJAX with form data
      $.ajax({
        type: "POST",
        url: scriptUrl,
        data: formData,
        dataType: 'json',
        xhrFields: {
          withCredentials: false
        }
      });
    }
    
    function showError(errorId, message) {
      $('#' + errorId).text(message).addClass('show');
    }


    /*Scroll Effect*/
    $('.intro_down, .go').on("click", function (e) {
      var anchor = $(this);
      $('html, body').stop().animate({
        scrollTop: $(anchor.attr('href')).offset().top
      }, 1000);
      e.preventDefault();
    });


    $('.married_coundown').countdown({until: new Date("May 23, 2026 14:00:00")});
    
    /* Falling Petals Animation - Exact Implementation */
    function initFallingPetals() {
      if (typeof gsap === 'undefined') {
        setTimeout(initFallingPetals, 200);
        return;
      }
      
      var container = document.getElementById("container");
      if (!container) {
        setTimeout(initFallingPetals, 200);
        return;
      }
      
      // Wait for page to be fully loaded
      if (document.readyState !== 'complete') {
        setTimeout(initFallingPetals, 300);
        return;
      }
      
      // Clear existing
      container.innerHTML = '';
      
      gsap.set("#container", {perspective: 600});
      
      var total = 60;
      var warp = document.getElementById("container");
      var w = window.innerWidth;
      var h = window.innerHeight;
      
      // Get hero and footer to calculate start and end positions
      var hero = document.querySelector('.home_intro');
      var footer = document.querySelector('.footer');
      
      function R(min, max) {
        return min + Math.random() * (max - min);
      }
      
      // Calculate start Y (below hero) and end Y (end of page)
      // Since container is fixed, we need viewport-relative positions
      var startY, endY;
      
      // Get hero bottom position relative to viewport
      if (hero) {
        var heroRect = hero.getBoundingClientRect();
        startY = heroRect.bottom + 20; // Just below hero
      } else {
        startY = 300; // Fallback
      }
      
      // Get page height for end position
      // Since container is fixed, we need to calculate based on scroll position
      // For fixed container, endY should be relative to viewport
      var pageHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        window.innerHeight
      );
      
      // Calculate where footer is relative to viewport when at bottom
      // For simplicity, use a large value that covers the full page
      endY = pageHeight + 100;
      
      // Ensure valid range
      if (endY <= startY) {
        endY = startY + 800;
      }
      
      for (var i = 0; i < total; i++) {
        var Div = document.createElement('div');
        // Convert GSAP 2.x attr to GSAP 3.x className
        // Stagger the start delay so they appear one by one
        var startDelay = (i / total) * 30; // Spread over 30 seconds for continuous appearance
        
        // Start each petal at the top (below hero) but with a delay
        // Hide them initially, they'll appear when animation starts
        gsap.set(Div, {
          className: 'dot',
          x: R(0, w),
          y: startY, // All start at the same top position
          z: R(-200, 200),
          opacity: 0 // Start invisible
        });
        warp.appendChild(Div);
        animm(Div, endY, startDelay);
      }
      
      function animm(elm, endY, startDelay) {
        // Convert to GSAP 3.x syntax - slower falling animation
        // Fade in when animation starts
        gsap.to(elm, {
          opacity: 1,
          duration: 0.5,
          delay: startDelay
        });
        
        // Falling animation - starts after delay
        gsap.to(elm, {
          y: endY,
          duration: R(25, 40), // Much slower falling
          ease: "none",
          repeat: -1,
          delay: startDelay // Staggered delay for continuous appearance
        });
        
        gsap.to(elm, {
          x: "+=100",
          rotationZ: R(0, 180),
          duration: R(8, 15), // Slower horizontal movement
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
        
        gsap.to(elm, {
          rotationX: R(0, 360),
          rotationY: R(0, 360),
          duration: R(5, 12), // Slower rotation
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: -5
        });
      }
      
      // Handle window resize
      var resizeTimer;
      window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
          initFallingPetals();
        }, 250);
      });
    }
    
    // Initialize
    window.addEventListener('load', function() {
      setTimeout(initFallingPetals, 500);
    });
    
    $(document).ready(function() {
      setTimeout(initFallingPetals, 800);
    });

  });
}(jQuery));
