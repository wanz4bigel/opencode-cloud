
    $(document).ready(function () {
        $('.show-more').bind('click', function (e) {
            e.preventDefault();
            var that = this;

            $(that).text('LOADING...').addClass('btn-disabled');
            $.getJSON($(this).attr('href'), function (response) {
                if (response['data'].length == 0) {
                    $(that).hide();
                }
                var html = '';
                $.each(response['data'], function (i) {
                    html +=
                        '<article class="merchantw pull-left animated zoomIn"><div class="merchant"><img src="' +
                        response['data'][i].image + '" srcset="' + response['data'][i]
                        .image + ' 2x, ' + response['data'][i].image +
                        ' 3x" onerror="$(this).hide();$(this).parents(\'article.merchantw\').hide();" class="merchant__img absolute"></div></article>'
                });
                $('.js-deal:visible').append(html);
                var a = parseInt($(that).attr('data-next-page'), 10);

                $(that).attr('href', '/merchants?page=' + (a + 1) + '&limit=12');
                $(that).attr('data-next-page', (a + 1));

                $(that).text('LEBIH BANYAK').removeClass('btn-disabled');
            });
        });

        var subscribe = $('#ovo-embedded-subscribe-form-footer').parsley({
            errorsContainer: function errorsContainer(Field) {
                return Field.$element.parent().find('.text-danger');
            },
            'errorTemplate': '<span></span>'
        });

        window.Parsley.on('field:error', function () {
            this.$element.parent('.input-group').removeClass('has-success');
            this.$element.parent('.input-group').addClass('has-danger');
        });
        window.Parsley.on('field:success', function () {
            this.$element.parent('.input-group').addClass('has-success');
            this.$element.parent('.input-group').removeClass('has-danger');
        });

        // assign class when url has anchor link
        var siteHref = window.location.href;
        var hash = siteHref.split("#");
        if (hash[1] != null) {
            $("#" + hash[1]).addClass('paddingTop'); // set current link as active
            console.log(hash[1])
        }

        // anchor link animate scrolling
        $("a.ovo-topup-list-link").click(function (event) {
            //event.preventDefault();
            $("html, body").animate({
                scrollTop: $($(this).attr("href")).offset().top
            }, 500);
        });

    });

    $("a.ovo-topup-list-link").on("click", function () {
        var id = $(this).attr('href');
        $('.paddingTop').removeClass('paddingTop'); // remove existing active
        $(id).addClass('paddingTop'); // set current link as active
    });

    // pas loading, page scroll, than it removed the class
    $(window).scroll(function () {
        if ($(window).scrollTop() > 500) {
            $('.goToTop').show();
        } else {
            $('.goToTop').hide();
        }
    });

    // back to top link
    $(".goToTop").click(function (e) {
        e.preventDefault();
        $("html, body").animate({
            scrollTop: "0px"
        });
        $('.paddingTop').removeClass('paddingTop'); // remove existing active
    });
