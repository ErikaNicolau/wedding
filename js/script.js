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
    
    /* Falling Petals Animation - Simple & Consistent */
    function initFallingPetals() {
      if (typeof gsap === 'undefined') {
        setTimeout(initFallingPetals, 100);
        return;
      }
      
      var container = document.getElementById("container");
      if (!container) {
        setTimeout(initFallingPetals, 100);
        return;
      }
      
      // Clear existing
      container.innerHTML = '';
      
      gsap.set("#container", {perspective: 600});
      
      var activePetals = [];
      var maxPetals = 15; // Maximum number of petals on screen at once
      
      function R(min, max) {
        return min + Math.random() * (max - min);
      }
      
      function createPetal() {
        var petal = document.createElement('div');
        var w = window.innerWidth;
        var h = window.innerHeight;
        
        // Start from very top of viewport
        var startX = R(0, w);
        var startY = 0; // Start at the very top of the page
        var endY = h; // End at the very bottom of the page
        
        // Set initial position
        gsap.set(petal, {
          className: 'dot',
          x: startX,
          y: startY,
          z: R(-200, 200),
          opacity: 0
        });
        
        container.appendChild(petal);
        activePetals.push(petal);
        
        // Fade in quickly
        gsap.to(petal, {
          opacity: 0.8,
          duration: 0.3
        });
        
        // Falling animation - consistent speed
        var fallDuration = R(20, 30); // 20-30 seconds to fall
        
        gsap.to(petal, {
          y: endY,
          duration: fallDuration,
          ease: "none",
          onComplete: function() {
            // Remove petal when it reaches bottom
            if (petal.parentNode) {
              petal.parentNode.removeChild(petal);
            }
            // Remove from active array
            var index = activePetals.indexOf(petal);
            if (index > -1) {
              activePetals.splice(index, 1);
            }
          }
        });
        
        // Gentle horizontal drift
        gsap.to(petal, {
          x: startX + R(-100, 100),
          duration: R(10, 15),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
        
        // Rotation
        gsap.to(petal, {
          rotationZ: R(0, 360),
          duration: R(8, 12),
          repeat: -1,
          ease: "none"
        });
        
        gsap.to(petal, {
          rotationX: R(0, 360),
          rotationY: R(0, 360),
          duration: R(6, 10),
          repeat: -1,
          ease: "sine.inOut"
        });
      }
      
      // Create first petal immediately
      createPetal();
      
      // Create new petals at regular intervals
      // Adjust interval based on how many petals are active
      function scheduleNextPetal() {
        var interval = 1500; // Create new petal every 1.5 seconds
        
        // If we have fewer petals than max, create one sooner
        if (activePetals.length < maxPetals) {
          setTimeout(function() {
            createPetal();
            scheduleNextPetal();
          }, interval);
        } else {
          // Wait a bit longer if we're at max
          setTimeout(function() {
            scheduleNextPetal();
          }, interval * 2);
        }
      }
      
      // Start the continuous creation loop
      scheduleNextPetal();
    }
    
    // Initialize immediately when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initFallingPetals);
    } else {
      initFallingPetals();
    }

  });
}(jQuery));
