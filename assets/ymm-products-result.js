/*** YMM Functions Start Here - 786 **/

//Set YMM prices in store currency format - 786/ASK.
function format_ymm_prd_prices()
{
  jQuery("div[class*='ymm_price_box_']").each(function() {
    var ymm_prd_id_str = jQuery(this).attr("class").split(' ');
    var ymm_prd_id_val = ymm_prd_id_str[1].replace("ymm_price_box_", "");
    var ymm_prd_msrp = "MSRP"
              
    //Price - Sale price-786/ASK.
    var ymm_comp_price = jQuery(".ymm_price_box_"+ymm_prd_id_val).find("span.comp_price").attr("data-ymm-compare-price");
                
    if (typeof ymm_comp_price !== "undefined") {
		ymm_comp_price = Shopify.formatMoney(ymm_comp_price,ymm_money_format);
        var ymm_prd_price = jQuery(".ymm_price_box_"+ymm_prd_id_val).find("span.ymm-product-price").attr("data-ymm-price"); 
        ymm_prd_price = Shopify.formatMoney(ymm_prd_price,ymm_money_format);

        //Currency format solution for XPF currency price having space separator - 786
        if(ymm_money_format.indexOf("amount_no_decimals_with_space_separator") != -1){
            ymm_prd_price = ymm_prd_price.replace(/\./g, " ");
            ymm_comp_price = ymm_comp_price.replace(/\./g, " ");
        }
                  
        //If setting is set to display currency code in front of prices for e.g. "EUR" - 786 [Like "XPF" currency price value contains "XPF" in built then it will be double up, so prevent it] - 786
        if(typeof dis_currency_with_code !== "undefined" && dis_currency_with_code == "yes" && ymm_prd_price.indexOf(window.my_curr_code) == -1) {
            ymm_prd_price = ymm_prd_price+" "+window.my_curr_code;
            ymm_comp_price = ymm_comp_price+" "+window.my_curr_code;
        }

            jQuery(".ymm_price_box_"+ymm_prd_id_val).find("span.ymm-product-price").html(ymm_prd_price);
        jQuery(".ymm_price_box_"+ymm_prd_id_val).find("span[data-ymm-compare-price]").html(ymm_comp_price);
    } else {
        var ymm_prd_price = jQuery(".ymm_price_box_"+ymm_prd_id_val).find("span.ymm-product-price").attr("data-ymm-price"); 
        ymm_prd_price = Shopify.formatMoney(ymm_prd_price,ymm_money_format);

        //Currency format solution for XPF currency price having space separator - 786
        if(ymm_money_format.indexOf("amount_no_decimals_with_space_separator") != -1){
          ymm_prd_price = ymm_prd_price.replace(/\./g, " ");
        }
                  
        //If setting is set to display currency code in front of prices for e.g. "EUR" - 786 [Like "XPF" currency price value contains "XPF" in built then it will be double up, so prevent it] - 786
        if(typeof dis_currency_with_code !== "undefined" &&dis_currency_with_code == "yes" && ymm_prd_price.indexOf(window.my_curr_code) == -1) {
          ymm_prd_price = ymm_prd_price+" "+window.my_curr_code;
        }
        //price info displayed in card TEST
        jQuery(".ymm_price_box_"+ymm_prd_id_val).find("span.ymm-product-price").html("<em>" + " MSRP" + "</em>" + "<br />" + "<strong>" +ymm_prd_price + "</strong>" + " MAP");
    }  
  });            
}

/*** 
Option (A) - Display Products & Pagination - 786/92
***/
function ymm_products_pagination(action,tags)
{ 
jQuery('#paginate').pagination({
      current: 1, 
      size: 2,
      length: products_limit,
      prev: '<svg aria-hidden="true" focusable="false" role="presentation" class="icon icon--wide icon-arrow-left" viewBox="0 0 20 8"><path d="M4.814 7.555C3.95 6.61 3.2 5.893 2.568 5.4 1.937 4.91 1.341 4.544.781 4.303v-.44a9.933 9.933 0 0 0 1.875-1.196c.606-.485 1.328-1.196 2.168-2.134h.752c-.612 1.309-1.253 2.315-1.924 3.018H19.23v.986H3.652c.495.632.84 1.1 1.036 1.406.195.306.485.843.869 1.612h-.743z" fill="#000" fill-rule="evenodd"></path></svg>',
      next: '<svg aria-hidden="true" focusable="false" role="presentation" class="icon icon--wide icon-arrow-right" viewBox="0 0 20 8"><path d="M15.186.445c.865.944 1.614 1.662 2.246 2.154.631.491 1.227.857 1.787 1.098v.44a9.933 9.933 0 0 0-1.875 1.196c-.606.485-1.328 1.196-2.168 2.134h-.752c.612-1.309 1.253-2.315 1.924-3.018H.77v-.986h15.577c-.495-.632-.84-1.1-1.035-1.406-.196-.306-.486-.843-.87-1.612h.743z" fill="#000" fill-rule="evenodd"></path></svg>',
      ajax: function(options,refresh,$target){

      //Define product fetch AJAX URL - 786.	
      var prd_ajax_url = "domain="+shop_domain+"&action=get_products&tags="+encodeURIComponent(tags)+"&current="+options.current+"&limit="+options.length+"&currency="+shop_currency+"&theme_id="+theme_id+"&front_domain="+front_domain+"&sale_lbl="+sale_lbl+"&soldout_lbl="+soldout_lbl+"&ver_no=2&fetch_no_img=no&img_dimension="+ymm_img_dimension+"&show_sku="+show_sku+"&show_vendor="+show_vendor;
	
      if(typeof lang_code !== "undefined") {
      prd_ajax_url += "&lang_code="+lang_code+"&pri_lang_code="+pri_lang_code+"&route_url="+window.my_route_url+"&market_id="+window.my_market_id+"&country_code="+window.my_country+"&curr_code="+window.my_curr_code; //For market related - 786
      }
          
      jQuery.ajax({
        url: data_url,
        type: "GET",
        data: prd_ajax_url,
        dataType: 'jsonp',
    	beforeSend: function() {
        	jQuery('.ymm-prd-loader-box').html('<img src="'+img_src+'">');
            jQuery('.ymm-prd-loader').show(); 
		}
      }).done(function(res){
			jQuery('.ymm-prd-loader-box').html("");
			jQuery('.ymm-prd-loader').hide();
          
			if(typeof res.prd_res != "undefined") {
			
            if(action == "loaded") {
				jQuery('html, body').animate({ scrollTop: eval(jQuery('.ymm-grid h1').offset().top-120)}, 270); //786
            }
            
            jQuery("#product_container #products").html(res.prd_res);
            
            format_ymm_prd_prices();
              
            action = "loaded";
            
          	if(res.total > 1) {
              jQuery("#total_products").html(res.total+" "+ymm_products);
            } else {
              jQuery("#total_products").html(res.total+" "+ymm_product);
            }
         
        	if(res.prd_res != null && res.total >= res.length) {
    			refresh({
    				total: res.total,
    				length: res.length 
    			});
            }
          
           if(res.total == 0){
           jQuery("#total_products").html(no_results);
           }
          }
          
    	}).fail(function(error){ });
    }
}); 
}

/*** 
Option (B) - Display Products with "Infinite Scroll (lazy load)" - 786/92
***/
function ymm_prd_infinite_load(ymm_prd_page_no,tags)
{
  //Define product fetch AJAX URL - 786.	
  var prd_ajax_url = "domain="+shop_domain+"&action=get_products&tags="+encodeURIComponent(tags)+"&current="+ymm_prd_page_no+"&limit="+products_limit+"&currency="+shop_currency+"&theme_id="+theme_id+"&front_domain="+front_domain+"&sale_lbl="+sale_lbl+"&soldout_lbl="+soldout_lbl+"&ver_no=2&fetch_no_img=no&img_dimension="+ymm_img_dimension+"&show_sku="+show_sku+"&show_vendor="+show_vendor;
	
  if(typeof lang_code !== "undefined") {
  prd_ajax_url += "&lang_code="+lang_code+"&pri_lang_code="+pri_lang_code+"&route_url="+window.my_route_url+"&market_id="+window.my_market_id+"&country_code="+window.my_country+"&curr_code="+window.my_curr_code; //For market related - 786
  }
    
  jQuery.ajax({
    url: data_url,
    type: "GET",
    data: prd_ajax_url,
    dataType: 'jsonp',
    beforeSend: function() {
		jQuery('.ymm-prd-loader-box').html('<img src="'+img_src+'">');
        jQuery('.ymm-show-more-loader').show(); 
        jQuery("#ymm_load_more").remove();
	}
  }).done(function(res){
		jQuery('.ymm-prd-loader-box').html("");
		jQuery('.ymm-show-more-loader').hide();
              
		if(typeof res.prd_res != "undefined") {
              jQuery("#product_container #products").append(res.prd_res);

              if(res.show_more_html != "") {
                  jQuery(res.show_more_html).insertAfter(".ymm-grid");

                  if(jQuery(".ymm-show-more-loader").length == 0){
                    jQuery('<div class="ymm-show-more-loader"><div class="ymm-show-more-loader-box"><img src="'+img_src+'"></div></div>').insertAfter("#ymm_load_more");
                  } 
              } 
    
              //Set YMM prices in store currency format - 786/ASK.
              format_ymm_prd_prices();
          
              if(res.total > 1) {
                jQuery("#total_products").html(res.total+" "+ymm_products);
              } else {
                jQuery("#total_products").html(res.total+" "+ymm_product);
              }
          
             if(res.total == 0){
               jQuery("#total_products").html(no_results);
             }
          }          
  }).fail(function(error){ });    
}

function check_load_more_exist(element)
{
	if(jQuery("#ymm_load_more").length > 0) {
   		var hT = jQuery(element).offset().top,
       	hH = jQuery(element).outerHeight(),
       	wH = jQuery(window).height(),
       	wS = jQuery(this).scrollTop();
      
  		return wS > (hT+hH-wH);
	} else {
		return false;
	}
}

//On page loads call YMM func. - 786/92/313
(function($) {
    //Get searched ymm query param - 786/ASK
	var tags = window.getYMMParameter('rq'); 
  	
  	if(tags != null) {
    	tags = tags.toString().split("~");
 	} else {
    	tags = "";
 	}
	
	//Show ymmbox label
	jQuery("#ymm_label").css("display","block");
	
	//Set product page title here - 786
	jQuery(".ymm_pg_title").html(product_pagetitle);

    //If no search performed yet - 786
	if(tags != "") {

      //CASE-1: Pagination option is used means disabled 'infinite scroll', so fetch products and show paging links - 786.
      if(en_ymm_infinite_scroll == "no") {   
          jQuery.getScript(ymm_paging_js).done(function( script, textStatus ) {
      		ymm_products_pagination("onload",tags);
          }).fail(function( jqxhr, settings, exception ) {
            console.log("ymm pagination JS not called..."); 
          });  
      } else {
            //CASE-2: Enabled infinite scroll (lazy load produts) - 786.
            ymm_prd_infinite_load(1,tags);
      }

      //On click of 'Load more' => fetch and show next available products during page scrolling - 786.
      jQuery(document).on('click','#ymm_load_more',function(e) {
          e.preventDefault();
          
          var ymm_prd_next_page = jQuery("#ymm_load_more").attr("data-next-page");   
          ymm_prd_infinite_load(ymm_prd_next_page,tags);
      });

      //For Infinite Scrolling - 786
      jQuery(window).on('scroll', function() {
        var res_load_more_exist = check_load_more_exist("#ymm_load_more");

        //On load first check if load more div is in viewport or not then show it accordingly (LAZY LOAD AJAX DIV > IF div is in viewport then data will need to fetch & show). - 786
    	var ymm_prd_loading = false;
  
        if(res_load_more_exist) {
        	if(!ymm_prd_loading) {
              ymm_prd_loading = true;
            
              jQuery("#ymm_load_more").trigger("click");   
            }
    	}  
     });
      
    } else {
      jQuery("#total_products").html(no_results);
    }
})(jQuery);