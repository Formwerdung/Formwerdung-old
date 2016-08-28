'use strict';
// IIFE - Immediately Invoked Function Expression
(function(yourcode) {

  // The global jQuery object is passed as a parameter
  yourcode(window.jQuery);

}(function($) {

  // The $ is now locally scoped

  // Listen for the jQuery ready event on the document
  $(function() {

    /**
     * Obscure Email
     */
     var contactFormAction = atob('Ly9mb3Jtc3ByZWUuaW8vbWFpbEBmb3Jtd2VyZHVuZy5jaA=='),
         contactAlertSuccess = '#js-contact-alert-success',
         contactAlertSuccessDismiss = '#js-contact-alert-success-dismiss',
         contactAlertErrorDismiss = '#js-contact-alert-error-dismiss',
         contactAlertError = '#js-contact-alert-error',
         contactMailToString = atob('bWFpbHRvOm1haWxAZm9ybXdlcmR1bmcuY2g/c3ViamVjdD1BbmZyYWdlIHZvbiBmb3Jtd2VyZHVuZy5jaA=='),
         $contactForm = $('#js-contact-form'),
         $contactFeedback = $('#js-contact-feedback'),
         $contactMailToLink = $('#js-contact-mailto-link');

     $contactMailToLink.attr('href', contactMailToString);

     $contactFeedback.on('click', contactAlertSuccessDismiss, function() {
       $(contactAlertSuccess).fadeOut(150);
     });

     $contactFeedback.on('click', contactAlertErrorDismiss, function() {
       $(contactAlertError).fadeOut(150);
     });

     $contactForm.submit(function(e) {
       e.preventDefault();
       $.ajax({
         url: contactFormAction,
         method: 'POST',
         data: $(this).serialize(),
         dataType: 'json',
         success: function(){
           // Success message
           var $markupSuccess = '<p id="js-contact-alert-success" class="contact-alert-success"><button id="js-contact-alert-success-dismiss" class="contact-alert-dismiss"><svg width="100%" height="100%" viewBox="0 0 50 50" class="contact-alert-dismiss-icon"><g><line x1="0" y1="0" x2="50" y2="50"></line><line x1="0" y1="50" x2="50" y2="0"></line></g></svg></button>Ihre Email wurde erfolgreich versandt, vielen Dank! Wir melden uns sobald wie möglich bei Ihnen.</p>';
           $contactFeedback.html($markupSuccess);
           // Clear all fields
           $contactForm.trigger('reset');
         },
         error: function(){
           // Fail message
           var $markupError = '<p id="js-contact-alert-error" class="contact-alert-error"><button id="js-contact-alert-error-dismiss" class="contact-alert-dismiss"><svg width="100%" height="100%" viewBox="0 0 50 50" class="contact-alert-dismiss-icon"><g><line x1="0" y1="0" x2="50" y2="50"></line><line x1="0" y1="50" x2="50" y2="0"></line></g></svg></button>Es gab ein Problem mit dem Mailserver, ihre Email konnte nicht gesendet werden. Bitte versuchen Sie es noch einmal.</p>';
           $contactFeedback.html($markupError);
           // Clear all fields
           $contactForm.trigger('reset');
         }
       });
     });

     $('body').scrollspy({target: '#js-banner-nav', offset: 100});

     var waypoint = new Waypoint({
       element: document.getElementById('js-top-element'),
       handler: function(direction) {
         $('#js-banner').toggleClass('has-shadow')
       },
       offset: -20
     });

  });

  // The rest of the code goes here
  var defaultDuration = 300; // ms
  var edgeOffset = 80; // px
  zenscroll.setup(defaultDuration, edgeOffset);

}));
