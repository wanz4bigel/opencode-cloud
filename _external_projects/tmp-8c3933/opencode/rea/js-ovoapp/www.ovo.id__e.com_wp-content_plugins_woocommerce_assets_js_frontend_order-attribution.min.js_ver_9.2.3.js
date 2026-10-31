var limit = 8;
var page= 1;
var state='enabled';
var filter= 'all';

var vdata = [];
var clicked = 0;

function render(data){
      var arrayLength = data.length;
      var html = '';
      for (var i = 0; i < arrayLength; i++) {
          // Safely get image URL with fallback
          var img = '/ovo_front_res/img/ovo-logo-white-copy-2.svg';
          if (data[i].images && 
              Array.isArray(data[i].images) && 
              data[i].images.length > 0 && 
              data[i].images[0].large) {
              img = data[i].images[0].large;
          }

          html += ' <article class="dc__dealw animated zoomIn"> ' +
                        ' <a href="/deals/view/'+ data[i]['id'] +'" class="ovo-deals-list-link inline " data-toggle="modal " data-target="#promo "> ' +
                            ' <div class="ovo-deals-list "> ' +
                                ' <div class="ovo-deal-image-wrapper "> ' +
                                    ' <img src="'+ img +'" class=" " onerror="this.src=\''+ img +'\'" loading="lazy" alt="'+ (data[i].title || 'Deal image') +'"> ' +
                                ' </div> ' +
                                ' <div class="ovo-deal-image-text "> ' +
                                    ' <h5>'+ (data[i].title || '') +'</h5> ' +
                                    ' <h6>'+ (data[i].merchant?.name || '') +'</h6> ' +
                                ' </div> ' +
                            ' </div> ' +
                        ' </a> ' +
                  ' </article> ';
      }
      $("#new").append(html);
      /*$("#new").css("display", "block");*/
}

function getData(limit, page, state, filter){
    $.get("deals/index", {
          limit:limit, page:page, status:state, filter:filter
    },function(data, status){
        if(data.length == 0){
          $(".btn-more").hide();
        }else{
            if(clicked==0){
              render(data);
              vdata=data;
              clicked=1;
              getData(limit, page+1, state, filter);
            }
        }
    });
}

$(".btn-more").on("click",function(e){
    e.preventDefault();
    clicked=0;
    page+=1;
    getData(limit, page, state, filter);
});

$(document).ready(function() {
  var segments = window.location.pathname.split( '/' );
  var fixedScroll = $("#fixedSpyscroll");
  if(segments[1] == "deals" && segments[2] != "view"){
      getData(limit, page, state, filter);
  }
  if(segments[1] == ""){
      fixedScroll.show();
  }else{
      fixedScroll.hide();
  }
});

$(".kirim").on("click", function() {
    $(this).closest("form").submit()
});

$("#ovo-embedded-subscribe-form-footer").validator({
    delay: 100,
    feedback: {
        success: "ion-checkmark-round",
        error: "ion-close-round"
    }
});
