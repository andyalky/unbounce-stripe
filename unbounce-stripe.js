<script type="text/javascript" src="https://js.stripe.com/v2/"></script>
<script type="text/javascript">

  //Publishable Key for testing only
  publishableKey = 'INSERT_PUBLISHABLE_KEY_HERE'
  Stripe.setPublishableKey(publishableKey);

  //Post information to a third party website, if desired
  function postDataToURL(url, token) {

    //Serialize the form into a string
    var data = $('form').serialize();

    //Append our token to the form
    data += "&token=" + token;

    //Redundant code as a fail-safe way to make sure credit card information is not transmitted by accident
    $('#card_number').val('');
    $('#cvc').val('');
    $('#expiry').val('');

    //Post the form data to a URL
    $.post(url, data);

  }

  //Function for whenever a form is submitted
  function submitFunction(e, $) {

    //Interrupt the form submission
    e.preventDefault();

    //Make the form button no longer clickable, to avoid multiple submissions
    $("form + a").css({"pointer-events": "none"});

    var stripeResponseHandler = function(status, response) {
      if (!response.error) {
        //Get the token
        var token = response['id'];

        //If the form is valid...
        if ($('form').valid()) {

          //...clear all card input entered by the user
          $('#card_number').val('');
          $('#cvc').val('');
          $('#expiry').val('');

          //Remove validation to the credit card fields, so that the form can submit without any credit card data
          $('#card_number').rules("remove");
          $('#cvc').rules("remove");
          $('#expiry').rules("remove");

          //Submit the form
          $('form').submit();

          //Needed so that error messages don't appear when form refreshes
          lp.jQuery('form').validate().resetForm();
        }

      }
    }

    //Get the token, passing through the card values and the response handler
    var stripeCreateToken = Stripe.card.createToken(
      {
        number: $('#card_number').val(),
        cvc: $('#cvc').val(),
        exp: $('#expiry').val()
      },
      stripeResponseHandler
    );

  }

  lp.jQuery(function($) {

    //Create new validation rules for validating credit card information

    //Validate the credit card number using Stripe.js
    $.validator.addMethod(
      'validCardNumber',
      function(value, element) {
        return Stripe.validateCardNumber(value);
      },
      'Please enter a valid card number'
    );

    //Validate the CVC code using Stripe.js
    $.validator.addMethod(
      'validCVC',
      function(value, element) {
        return Stripe.validateCVC(value);
      },
      'Please enter a valid CVC code'
    );

    //Validate the expiry date using Stripe.js
    $.validator.addMethod(
     'validExpiryDate',
     function(value, element) {
       return Stripe.validateExpiry(value);
      },
      'Please enter a valid expiry date'
    );

    //Make sure the date is formatted correctly using Regex
    $.validator.addMethod(
     'validExpiryFormat',
     function(value, element) {
       return value.match('^[0-9]{1,2}[ -\/][0-9]{2,4}$') != null;
      },
      'Please enter the date in the following format: MM/YYYY'
    );

    //Adding the rules to the four credit card form fields
    //Also made all fields required as a fail-safe measure, it wasn't made a required field in Unbounce
    //The expiration_year field doesn't have a custom validation rule, as the rule to check the expiration date is associated with the expiration_month field

    $('#card_number').rules("add", {
      'validCardNumber': true,
      'required': true
    });
    $('#cvc').rules("add", {
      'validCVC': true,
      'required': true
    });
    $('#expiry').rules("add", {
      'validExpiryDate': true,
      'validExpiryFormat': true,
      'required': true
    });

    //Submit form on click of submit button
    $('.lp-pom-form .lp-pom-button')
      .unbind('click')
      .bind('click.formSubmit', function(e) {
        if ( $('form').valid() )
          submitFunction(e, $);
        });

    //Submit form on keypress
    $('form')
      .unbind('keypress')
      .bind('keypress.formSubmit', function(e) {
        if(e.which === 13 && e.target.nodeName.toLowerCase() !== 'textarea' && $('form').valid() )
          submitFunction(e, $);
        });

  });

</script>
