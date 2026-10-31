var checkform = $('#checkform').parsley({
    errorsContainer: function errorsContainer(Field) {
        return Field.$element.parent().find('.text-danger');
    },
    'errorTemplate':'<span></span>'
});
var authform;

window.Parsley.on('field:error', function() {
    this.$element.parent('.form-wrap').removeClass('has-success');
    this.$element.parent('.form-wrap').addClass('has-danger');
});
window.Parsley.on('field:success', function() {
    this.$element.parent('.form-wrap').addClass('has-success');
    this.$element.parent('.form-wrap').removeClass('has-danger');
});

$('body').on('click', 'a.authLink', function(e){
    e.preventDefault();
    $('span.pointer-normal').show();
    $(this).hide();
    $('.form-otp-container').hide();
    sendOtp('authLink');
});

$('#checkform').submit(function(e){
    e.preventDefault();

    $('.form-phone-container').hide();
    sendOtp('checkform');
});

$('body').on('submit', '#authform', function(e){
    e.preventDefault();

    $('.form-otp-container').hide();
    $('.check-point-loading').show();

    if (authform.isValid() == false) return false;

    $.post($('#authform').attr('action'), $('#authform').serialize(), function(response){

        $('.check-point-loading').hide();

        if(response.status===200) {

            $('#fullname').text(response.data.fullname);
            $('#level').text(response.data.level);
            var level_logo = response.data.level == 'club' ? '/ovo_front_res/img/ic-ovo-club-copy.svg' : '/ovo_front_res/img/ic-ovo-premier-copy.svg' ;
            $('.ic-ovo-club-copy').attr('src',level_logo);
            var point = parseInt(response.data.point,10);
            $('#point').text(point.toLocaleString());
            $('.result-box').show();

            // clear cookies PHPSESSID & Ga
            Cookies.remove('PHPSESSID', { path: '/' });
            Cookies.remove('_ga', { path: '/', domain: '.ovo.id' });
            Cookies.remove('_gat_UA-84501736-1', { path: '/', domain: '.ovo.id' });
            Cookies.remove('_gid', { path: '/', domain: '.ovo.id' });
            ga('create', 'UA-84501736-1','auto');

        } else {
            if(response.code==5) {
                resetForms('.form-phone-container');
                var formId = '#checkform';
            } else {
                resetForms('.form-otp-container');
                var formId = '#authform';
            }
            showResponse(formId,response.message,'has-danger');
        }
    }).error(function() {
        resetForms('.form-phone-container');
        showResponse('#authform','Something went wrong, please try again later.','has-danger');
    });
});

function sendOtp(reference) {
    $('.check-point-loading').show();

    if (checkform.isValid() == false) return false;

    var phone = $('.form-phone-container input[name=phone]').val();

    $.post($('#checkform').attr('action'), $('#checkform').serialize(), function(response){

        $('.check-point-loading').hide();

        if(response.status===200) {

            $.get('/points/check', function(response) {

                $('div.outer.main-content').replaceWith(response);
                $('.form-phone-container').hide();
                $('.form-phone-container input[name=phone]').val(phone);
                $('.form-otp-container').show();

                authform = $('#authform').parsley({
                    errorsContainer: function errorsContainer(Field) {
                        return Field.$element.parent().find('.text-danger');
                    },
                    'errorTemplate':'<span></span>'
                });

                var counter = setInterval(function(){
                    var current = parseInt($('span.otp-counter-text').text(), 10);
                    var next = current-1;
                    if(next>=0) {
                        $('.otp-counter-text').text(next);
                    } else {
                        $('.otp-counter-text').text($('.otp-counter-text').attr('data-start'));
                        $('a.pointer-normal').hide();
                        $('a.authLink').show();

                        clearInterval(counter);
                    }
                },1000);
            });
        } else {
            if (reference=='authLink') {
                resetForms('.form-otp-container');
                var formId = '#authform';
            } else {
                resetForms('.form-phone-container');
                var formId = '#checkform';
            }
            showResponse(formId,response.message,'has-danger');
        }
    }).error(function() {
        if (reference=='authLink') {
            resetForms('.form-otp-container');
            var formId = '#authform';
        } else {
            resetForms('.form-phone-container');
            var formId = '#checkform';
        }
        showResponse(formId,'Something went wrong, please try again later.','has-danger');
    });
}

function resetForms(showForm) {
    $('.check-point-form-component').hide();
    $(showForm).show();
}
function showResponse(formId, msg,wrapperClass) {
    $(formId + ' .form-wrap').addClass(wrapperClass);
    $(formId + ' .form-wrap .text-danger').text(msg);
}