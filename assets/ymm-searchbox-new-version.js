//YMM Functions - 786/92
function removeLastSign(myUrl)
{
    if(myUrl.substring(myUrl.length-1) == "~") {
    myUrl = myUrl.substring(0,myUrl.length-1);
    }
    return myUrl;
}
  
function disableSearch()
{
    jQuery("#ymm_search").prop('disabled',true);
}
  
function enableSearch()
{
  	jQuery("#ymm_search").prop('disabled',false);
}
  
function showLoader(current_field)
{
  if(jQuery("li."+current_field).is(':not(.ymm_bttns)')) {  
    var next_lbl = jQuery("li."+current_field).next().find(".ymm_label").html();
    jQuery(".formFields ul.dropdowns li."+current_field).next(".formFields ul.dropdowns li:not(.ymm_bttns)").remove();

    //If current field is in required field list then do not skip to add 'required' class - 786.
    var ymm_req_fld_class="";
    if(jQuery("li."+current_field).next().find(".ymm_label").hasClass("required")){
      ymm_req_fld_class = "required";
    }
    
    if(skip_field_list != "-1" && enable_skip_none == "yes"){
      
      if(typeof next_lbl !== "undefined" && next_lbl != null && skip_field_list.indexOf(current_field) == -1) {
   		jQuery("<li id='ymm_loader'><label class='ymm_label "+ymm_req_fld_class+"'>"+next_lbl+"</label><div class='ymm_loading'><img src='"+img_src+"' height='20px' width='20px'/></div></li>" ).insertAfter(".formFields ul.dropdowns li."+current_field);
      } else {
        jQuery("<li id='ymm_loader'><div class='ymm_loading'><img src='"+img_src+"' height='20px' width='20px'/></div></li>" ).insertAfter(".formFields ul.dropdowns li."+current_field); 
      }
      
    } else {
      jQuery( "<li id='ymm_loader'><label class='ymm_label "+ymm_req_fld_class+"'>"+next_lbl+"</label><div class='ymm_loading'><img src='"+img_src+"' height='20px' width='20px'/></div></li>" ).insertAfter( "#ymm_searchbox .formFields ul.dropdowns li."+current_field);
    }
  }
}
  
function hideLoader()
{
    jQuery('#ymm_loader').remove();
}
  
//Reset YMM dropdowns. - 786
function resetYMMDropdowns(prev_field_id)
{
	//Reset YMM Fields/Dropdowns for SKIP NONE feature if its enabled. - 786
    if(enable_skip_none == "yes" && skip_field_list != "-1") {
      jQuery(".formFields ul.dropdowns").find(first_skip_field).nextAll(":not(.ymm_bttns)").remove();
      jQuery(".formFields ul.dropdowns").find("li."+prev_field_id).nextAll(":not(.ymm_bttns)").remove();
      jQuery(".formFields ul.dropdowns").find(first_skip_field).remove();
    }
	
  	disableSearch(); //786
     
    var c = 0;
  	jQuery("#ymm_searchbox .formFields .dropdowns select[id^=dropdown]").each(function(i, e) {
      	c++;
        
      	var dropdown_id = jQuery(this).attr("id");
          	
      	if(c == 1) {
        	jQuery("#"+dropdown_id).val("-1");
        } else {
        	jQuery("#"+dropdown_id).val("-1");
            jQuery("#"+dropdown_id).prop('disabled',true);
        }
		
		//Reset Select2 dropdown - 786
        if(use_new_type_dropdowns != "no") {
           jQuery("#"+dropdown_id).select2({ 
                 dropdownParent: jQuery(".ymm_app"),
                 minimumResultsForSearch: min_res_search,
				 "language": { 
				 "noResults": function(){ return no_results_slct; } 
      			 }
           });

          /*** Iphone 14 Solution (slow click) - 786 ***/
          jQuery('.select2-container')
            .off('touchstart')
            .on('touchstart', function (e) {
                e.stopPropagation();
            })
            .siblings("select:eq(0)")
            .off('select2:open')
            .on('select2:open', function () {
                jQuery('.select2-results__options')
                    .off('touchstart')
                    .on('touchstart', 'li', function (e) {
                        e.stopPropagation();
                    });
					});
        }
    });
}
 
//Display YMM Logo - 786/92/313/ASKMPF.
function displayYMMLogo()
{
	var ymm_logo_html = '<div class="ymm_logo_img_cont"><img src="'+ymmbox_logo_img+'" alt="image" class="ymm_logo_img" width="" height="" loading="lazy" /></div>';
								
	if(jQuery(".ymm_logo_img_cont").length == 0) {
		jQuery("#ymm_form").append(ymm_logo_html);	
		jQuery("#ymm_form").addClass(ymmbox_logo_position);
	}
}
 
function getDropdownsOnload()
{
    //Empty fitment block is required if it's set - 786
    jQuery(".ymm_fitment_block").hide();  //786
    jQuery(".ymm_fitment_block").find(".item_fits").html("");
    jQuery(".ymm_fitment_block").find(".item_unfits").html("");
   
    //If logo image exists for YMMbox then set it - 786
	if(ymmbox_logo_img != "") {
		displayYMMLogo();
	}

    //When fitment resetted then call ymmbox css - 786
	jQuery("#ymm_css").text(ymm_box_css);
	
	//Show YMMbox if it's hidden.
	jQuery("#ymm_label").css("display","block"); 
	jQuery("#ymm_searchbox").css("display","block");
  	 
	jQuery.ajax({
			type: "GET",
    		dataType: 'jsonp',
      		url: data_url,
			data: "domain="+shop_domain+"&action=onload&load=all&version=updated&ver_no=3&use_cart_info_ftr="+use_cart_info_feature+"&lang_code="+lang_code+"&pri_lang_code="+pri_lang_code,
			success: function(res) {
                
				if(res.html != null) {         
				jQuery(".formFields ul.dropdowns").html(res.html);
					
				//Reset YMM Fields/Dropdowns for SKIP NONE feature if its enabled. - 786
                if(enable_skip_none == "yes" && skip_field_list != "-1"){
                      window.prev_field_id = jQuery(".formFields ul.dropdowns").find(first_skip_field).prev("li").attr("class");
                      jQuery(".formFields ul.dropdowns").find(first_skip_field).nextAll(":not(.ymm_bttns)").remove();
                      jQuery(".formFields ul.dropdowns").find(first_skip_field).remove();
                }

                jQuery(".formFields ul.dropdowns").show();
                    
                var $dropdowns = jQuery(res.html).find('.ymm-filter');
         
                $dropdowns.find('option:first').each(function () {
					var curr_drop_id = jQuery(this).parent().attr("id");
                    var curr_text = jQuery(this).text();
                    var final_lbl = curr_text.replace('Select',select_lbl);  
                    jQuery("#"+curr_drop_id+" option:first").text(final_lbl);
                });
                     
                jQuery(".ymm-filter").find("option[value*='none']").html(none_lbl);  
				
				var li_element = jQuery(".formFields ul.dropdowns").find('li.ymm_bttns');
					
                if (!li_element.length) {
					var ymm_btn_html = '<li class="ymm_bttns"><div id="ymm_actions" class="button-action" align="center"><button type="button" name="submit" id="ymm_search" class="btn ymm_search" disabled="disabled">';
					
					if(search_btn_img != "") {
						ymm_btn_html += '<img src="'+search_btn_img+'" class="ymm_btn_img" alt="icon" loading="lazy" width="" height="" />';
					}
			
					ymm_btn_html += '<span class="ymm_btn_lbl">'+search_bttn+'</span></button><button type="button" name="reset" id="ymm_reset" class="btn btn--secondary ymm_reset">';
					
					if(reset_btn_img != "") {
						ymm_btn_html += '<img src="'+reset_btn_img+'" class="ymm_btn_img" alt="icon" loading="lazy" width="" height="" />';
					}
					
					ymm_btn_html += '<span class="ymm_btn_lbl">'+reset_bttn+'</span></button></div></li>';
			
      				jQuery(".formFields ul.dropdowns").append(ymm_btn_html); //786
				}
		
				//YMM New type dropdowns invoke on load. - 786/92/313/ASKMPF
                if(use_new_type_dropdowns != "no") {
					jQuery(".formFields ul.dropdowns").find("select:eq(0)").select2({ 
						disabled : false,
                        minimumResultsForSearch: min_res_search,
                        dropdownParent: jQuery(".ymm_app"),
						"language": { 
						"noResults": function(){ return no_results_slct; } 
						}});
					
					jQuery(".formFields ul.dropdowns").find("select:disabled").select2({ 	
                        disabled : true,
                        dropdownParent: jQuery(".ymm_app"),
                        minimumResultsForSearch: min_res_search,
						"language": { 
						"noResults": function(){ return no_results_slct; } 
						}});
                 }					
               }
			}	
	});	
}
  
//YMM Product Fitment Function - 786.
function getYMMFitmentData(tags)
{ 
	jQuery("#ymm_css").text(ymm_fitment_css);
	
  	jQuery.ajax({
		type: "GET",
    	dataType: 'jsonp',
      	url: data_url,
		data: "use_cart_info_feature="+use_cart_info_feature+"&no_lowercase=yes&domain="+shop_domain+"&product_id="+ymm_product_id+"&action=get_fitment_data&version=updated&tags="+encodeURIComponent(tags)+"&lang_code="+lang_code+"&pri_lang_code="+pri_lang_code,
		beforeSend: function() {
        	jQuery('.ymm-fitment-loading').html('<img src="'+img_src+'" width="32" height="auto" alt="Loading..." loading="lazy">').show();
    	},
      	success: function(res) { 
              //786
              if(typeof res.product_page_response != "undefined") {
             
			  //Hide YMMbox and show fitments data- 786.
			  jQuery('.ymm-fitment-loading').fadeOut("fast");
              jQuery("#ymm_searchbox").hide();
              jQuery("#ymm_searchbox").find(".dropdowns").html("");
              jQuery(".ymm_fitment_block").show();
              
              //If Item Fits
              if(res.product_page_response.status == "yes") {
              	jQuery(".ymm_fitment_block").find(".item_unfits").html("");
                
                if(res.product_page_response.fit_type == "exact_fit") {
                jQuery(".ymm_fitment_block").find(".item_fits").html('<div class="item_fits_cont"><div class="fit_title"><p><img src="'+item_fit_icon+'"/><span class="ymm_text">'+res.product_page_response.ymm_fit_title+'</span></p></div><div class="fit_desc">'+res.product_page_response.ymm_fit_desc+': '+res.searched_ymm+'</div><div class="reset_fitment_data"><button type="button" name="reset_ymm_fitment" id="reset_ymm_fitment">'+res.product_page_response.ymm_reset_fitment_lbl+' </button></div></div>');
                } 
                  
                if(res.product_page_response.fit_type == "universal_fit") {
                jQuery(".ymm_fitment_block").find(".item_fits").html('<div class="item_fits_cont uni_fit"><div class="fit_title"><p><img src="'+uni_item_fit_icon+'"/><span class="ymm_text">'+res.product_page_response.ymm_uni_fit_title+'</span></p></div><div class="fit_desc">'+res.product_page_response.ymm_fit_desc+': '+res.searched_ymm+'</div><div class="reset_fitment_data"><button type="button" name="reset_ymm_fitment" id="reset_ymm_fitment">'+res.product_page_response.ymm_reset_fitment_lbl+' </button></div></div>');
                }
				
				//Cart/Order Customization Work Starts Here [If item fit then only searched ymm data send to cart] - 786/92/313/ASKMPF
                if(use_cart_info_feature == "yes") { 
                  if(jQuery('.ymm_form_inputs_cont').length == 0) {
                     jQuery("form[action^='/cart/add']").append("<div class='ymm_form_inputs_cont'>"+res.ymm_cart_info_html+"</div>"); //Add Form - 786
                  } else {
                    jQuery('div.ymm_form_inputs_cont').html(res.ymm_cart_info_html); //Update form - 786
                  }
                }
                //Ends Here - 786
               } 
                                                                    
              //If Item Does Not Fits
              if(res.product_page_response.status == "no"){
              	jQuery(".ymm_fitment_block").find(".item_fits").html("");  
              	jQuery(".ymm_fitment_block").find(".item_unfits").html('<div class="item_unfits_cont"><div class="unfit_desc"><div class="unfit-icon"><img src="'+item_not_fit_icon+'"/><span class="unfit_title">'+res.product_page_response.ymm_unfit_title+'</span></div><span class="ymm_text">'+res.product_page_response.ymm_unfit_desc+': '+res.searched_ymm+'</span></div><div class="fitment_buttons"><button type="button" name="view_fitments" id="view_fitments">'+res.product_page_response.ymm_view_fitments_lbl+'</button><button type="button" name="reset_ymm_fitment" id="reset_ymm_fitment">'+res.product_page_response.ymm_reset_fitment_lbl+' </button></div></div>');
				
				if(use_cart_info_feature == "yes") {
                  //Reset Form if item not fits and form exists then only - 786
                  jQuery('div.ymm_form_inputs_cont').html("");
                }
              }
              }
          }
   	  });
}

//YMM Init. - 786
function ymmInit()
{ 	
(function($){
	var tags = window.getYMMParameter('rq');
	
  	if(tags != null) {
    	tags = tags.toString().split("~");
 	} else {
    	tags = "";
 	}
  
    if(search_bttn == "") {
      search_bttn = "Search";
    } 
  
 	if(reset_bttn == "") {
      reset_bttn = "Reset";
  	}
  
  	if(none_lbl == "") {
      none_lbl = "None";
  	}
	
    //For mobile (select2 jquery plugin issue fix that is appearing for some of jquery versions) - Hide searchbox inside new type of dropdowns - 786
	if(jQuery(window).width() <= 767) {
      min_res_search = Infinity;
    }

   	//Get First Dropdown onload
	if(tags == "") {
        //when fitment not searched yet then call ymmbox css - 786
		jQuery("#ymm_css").text(ymm_box_css); 
			
		if(speed_up_mode == "off") {
            //SPEED UP MODE: OFF
			getDropdownsOnload(); 
		} else {
			//SPEED UP MODE: ON		
            //Set "None" label in dynamic ymm dropdowns. - 786
			jQuery(".ymm-filter").find("option[value*='none']").html(none_lbl);

            //If req field list is set in which middle field not set as required then it will be obvious required field, so show '*' sign in front of it - 786/A/SAW/KGN.
            if(req_field_list != "-1"){
              jQuery("li."+req_field_list).prevAll("li").find(".ymm_label").addClass("required");
            }
          
			//YMM New type dropdowns invoke on load. - 786
			if(use_new_type_dropdowns != "no") {
				jQuery(".formFields ul.dropdowns").find("select:eq(0)").select2({ 
                        dropdownParent: jQuery(".ymm_app"),
                        minimumResultsForSearch: min_res_search,
						disabled : false, 
						"language": { 
						"noResults": function(){ return no_results_slct; } 
						}
						});
						
				jQuery(".formFields ul.dropdowns").find("select:disabled").select2({ 
                        dropdownParent: jQuery(".ymm_app"),
						disabled : true,
						"language": { 
						"noResults": function(){ return no_results_slct; } 
						} 
						});

        /*** Iphone 14 Solution (Slow Click) - 786/92/313/ASKMPF ***/
       jQuery('.select2-container')
            .off('touchstart')
            .on('touchstart', function (e) {
                e.stopPropagation();
            })
            .siblings("select:eq(0)")
            .off('select2:open')
            .on('select2:open', function () {
                jQuery('.select2-results__options')
                    .off('touchstart')
                    .on('touchstart', 'li', function (e) {
                        e.stopPropagation();
                    });
            });
          //Ends - 786
     
			}
		}

       
		//If logo image exists for YMMbox then set it - 786
		if(ymmbox_logo_img != "") {
			displayYMMLogo();
		}
		
		//Show ymmbox now. - 786/92
		jQuery("#ymm_label").css("display","block");
		jQuery(".formFields ul.dropdowns").show();
	}
 
    //Reset YMM Fields/Dropdowns for SKIP NONE feature if its enabled. - 786
    if(enable_skip_none == "yes" && skip_field_list != "-1" && speed_up_mode == "on"){
         window.prev_field_id = jQuery(".formFields ul.dropdowns").find(first_skip_field).prev("li").attr("class");
         jQuery(".formFields ul.dropdowns").find(first_skip_field).nextAll(":not(.ymm_bttns)").remove();
         jQuery(".formFields ul.dropdowns").find(first_skip_field).remove();
    }
	
	//Get Next Dropdowns on change in Sequencial order
 	jQuery(document).on('change','li:not(.last_ymm_field) > select[id^=dropdown]',function() {
       	var arr = jQuery(this).attr("id").split("-");
  		var current_field = arr[1];
		var current_field_ele = "."+current_field;
     	var dropdown_val = jQuery(this).val();
     	var field_val_Arr = [];
      	var next_all = jQuery("li."+current_field).nextAll().find("select");
      	next_all.prop("disabled", true);
     	next_all.val("-1");
        next_all.prop("data-enable-search","no");
       	jQuery("li.last_ymm_field").removeClass("last_ymm_field");

		//IF SKIP NONE is enabled and SKIP fields list is not blank then just show required ymm fields (non skipped fields) before that first SKIP field - 786.
        if(enable_skip_none == "yes" && skip_field_list != "-1") {
          
          //Remove next fields but conditionally as per skip fields/non skipped fields list - 786/92/313/ASKMPF.
          var prev_fld_bfr_skip_field_no = jQuery('li.'+window.prev_field_id).index();
          var curr_fld_no = jQuery('li'+current_field_ele).index();
          
          //NOTE: If current field which is changed is in SKIP FIELDS list then we've to remove next fields after than that current field (skipped field). But if current field which is changed is not in SKIP Fields list then we've to keep just non skipped fields. - 786.   
          if(jQuery.inArray(current_field_ele, skip_fields_arr) !== -1 || curr_fld_no>prev_fld_bfr_skip_field_no){
             jQuery(".formFields ul.dropdowns").find(current_field_ele).nextAll(":not(.ymm_bttns)").remove();
          } else {
             jQuery(".formFields ul.dropdowns").find("li."+window.prev_field_id).nextAll(":not(.ymm_bttns)").remove();
          }
        }
        //ends here - 786/92/313/ASKMPF.
		
		//YMM New type dropdowns invoke on change. - 786
        if(use_new_type_dropdowns != "no") {
          //Reconstruct the plugin options box - 786
          next_all.select2(); 
        }
		
       	jQuery("#ymm_searchbox .formFields .dropdowns select[id^=dropdown]:visible").each(function(i, e) {
           if(e.value != -1){
         	  var dropval = e.value;
              field_val_Arr.push(dropval);
           } 
          
           //DYNAMIC ALL FIELDS REQUIRED SET FOR CART INFO. FEATURE - 786/92/313/ASKMPF
           //By default only 2 fields are required in YMM app - 786
           if(use_cart_info_feature != "yes") {
             var first_field = jQuery('#ymm_searchbox .formFields .dropdowns > li:nth-child(1) select[id^=dropdown]').val();
             var second_field = jQuery('#ymm_searchbox .formFields .dropdowns > li:nth-child(2) select[id^=dropdown]').val();

           	 if(first_field==-1 || second_field==-1) {
                 disableSearch();
             } else {
              //NEW SETTING - Dynamic REQUIRED FIELDS LIST - 786/A/SAW/KGN.
              if(req_field_list != "-1") {
                if(current_field == req_last_field) {
                   var my_drop_val = jQuery("li."+current_field).find("select").val();
                
                   if(my_drop_val != -1) { 
                       enableSearch();
                   } else {
                      disableSearch();
                   }
                } else {
                   var current_field_index = jQuery("#ymm_searchbox .formFields .dropdowns li."+current_field).index();
                   var req_last_field_index = jQuery("#ymm_searchbox .formFields .dropdowns li."+req_last_field).index();
 
                   //That means req. last field is before current field then retained to enable search else disabled search - 786
                   if(req_last_field_index != -1 && req_last_field_index < current_field_index){
                     enableSearch();
                   } else {
                     disableSearch();
                   }
                }
             } else {
                enableSearch();
               }
             }
             //ends here - 786. 
           } else {
             disableSearch();
           }
        });
      
      	if(dropdown_val != "-1") {
           showLoader(current_field);
          
           jQuery.ajax({
				type: "GET",
    			dataType: 'jsonp',
      			url: data_url,
				data: "domain="+shop_domain+"&load=all&data_filter=updated&action=onchange&use_cart_info_ftr="+use_cart_info_feature+"&version=updated&ver_no=3&current_field="+current_field+"&prev_val="+encodeURIComponent(field_val_Arr)+"&current_val="+encodeURIComponent(dropdown_val)+"&lang_code="+lang_code+"&pri_lang_code="+pri_lang_code,
				success: function(res) {             
               
                  if(res.html != "last_element~"){
                    	var returned_fieldname = res.html.split("~");
                  	 	jQuery(".formFields ul.dropdowns ."+returned_fieldname[1]).remove();
                   		jQuery(returned_fieldname[0]).insertAfter(".formFields ul.dropdowns ."+current_field);
                   
                    	var $dropdowns = jQuery(res.html).find('.ymm-filter');
         
                    	$dropdowns.find('option:first').each(function () {
                      		var curr_drop_id = jQuery(this).parent().attr("id");
                      		var curr_text = jQuery(this).text();
                            var final_lbl = curr_text.replace('Select',select_lbl);
                      		jQuery("#"+curr_drop_id+" option:first").text(final_lbl);
                    	});
                     
                    	jQuery(".ymm-filter").find("option[value*='none']").html(none_lbl);
                    
						//YMM New type dropdowns invoke on change and opens automatically. - 786
                        if(use_new_type_dropdowns != "no") {
							jQuery(".formFields ul.dropdowns ."+returned_fieldname[1]).find("select").select2({ 
                            dropdownParent: jQuery(".ymm_app"),
                            minimumResultsForSearch: min_res_search,
							"language": { 
							"noResults": function(){ return no_results_slct; } 
							}});
							
            /*** Iphone 14 Solution (Slow Click) - 786/92/313/ASKMPF ***/
            jQuery("#dropdown-"+returned_fieldname[1]).siblings('.select2-container')
            .off('touchstart')
            .on('touchstart', function (e) {
                e.stopPropagation();
            });
          
            jQuery("."+returned_fieldname[1]+" select").on('select2:open', function () {
                jQuery("#select2-dropdown-"+returned_fieldname[1]+"-results")
                    .off('touchstart')
                    .on('touchstart', 'li', function (e) {
                        e.stopPropagation();
                    });
             });

            jQuery(".formFields ul.dropdowns ."+returned_fieldname[1]).find("select").select2("open");
            //Ends - 786
                        }

                        //NEW SETTING - Dynamic REQUIRED FIELDS LIST - 786/A/SAW/KGN.
                        if(use_cart_info_feature != "yes" && typeof jQuery(".formFields ul.dropdowns ."+returned_fieldname[1]).find("select").attr('data-enable-search') !== 'undefined' && jQuery(".formFields ul.dropdowns ."+returned_fieldname[1]).find("select").attr('data-enable-search') == "yes") {
                          enableSearch();
                        }
                  } else {
                     enableSearch();
                  } 
                  hideLoader();
				}	
	 		});	
        } 
    });
  
	//On change of last dropdown do not make any request just enable/disable search btn. - 786
    jQuery(document).on('change','li.last_ymm_field select[id^=dropdown]',function() {
      var dropdown_val = jQuery(this).val();
      var dropdown_no = parseInt(jQuery(this).closest("li.last_ymm_field").index())+1; //INDEX return from 0 so add +1 in it. - 786

      if(use_cart_info_feature != "yes") {
        
        //If 'Required Fields List' is not set yet then by default first 2 fields always mandatory so perform checks accordingly - 786
        if(req_last_field == "-1"){
           if(dropdown_val == -1 && dropdown_no == 2) {
         	disableSearch();
           } else {
            enableSearch();
           } 
        } else {  
          //Else 'Required Fields List' is set & current last ymm field is also there in required field list & not selected yet then prevent to enable search btn - 786.
          var curr_drop_id = jQuery(this).attr("id");
          curr_drop_id = curr_drop_id.replace('dropdown-', '');
 
           if(jQuery.inArray(curr_drop_id, req_fields_arr) != -1){
              if(dropdown_val == -1) {
                disableSearch();
              } else {
                enableSearch();
              }  
           }
       }     
      } else {
          //All fields should be mandatory irrespective of what saved in required fields list for 'Send YMM to cart info.' feature - 786.
          if(dropdown_val == -1) {
     		disableSearch();
          } else {
            enableSearch();
          }
      }
    });
  
  	//After Search Filter performs show selected dropdowns values
  	if(tags != "") {
		
		//Get ymm product fitment data and display it on the product details page - 786/92.
		if(template_name == "product" && pro_plan == "yes") {
			getYMMFitmentData(tags); //786
		} else {
   		
		//NOTE: IF SKIP NONE feature is enabled then do not show disabled or pre-loaded dropdowns on the YMM result page. Means turn off auto loading of YMM dropdowns. So, whichever dropdown values used in search then those dropdowns only will be displayed when SKIP NONE feature is enabled. - 786.
        if(enable_skip_none == "yes"){
          var ajax_url = "domain="+shop_domain+"&action=getdropdowns&version=updated&ver_no=3&use_cart_info_ftr="+use_cart_info_feature+"&tags="+encodeURIComponent(tags)+"&lang_code="+lang_code+"&pri_lang_code="+pri_lang_code;
        } else {
          var ajax_url = "domain="+shop_domain+"&load=all&subaction=show_all&action=getdropdowns&version=updated&ver_no=3&use_cart_info_ftr="+use_cart_info_feature+"&tags="+encodeURIComponent(tags)+"&lang_code="+lang_code+"&pri_lang_code="+pri_lang_code;
        }
		
        jQuery.ajax({
			type: "GET",
    		dataType: 'jsonp',
      		url: data_url,
			data: ajax_url,
          	success: function(res) {
				 if(enable_skip_none == "yes" && skip_field_list != "-1"){
					window.prev_field_id = res.prev_field_id;
                 }
				 
              	 jQuery(".formFields ul.dropdowns").html(res.html);
				 
				 if(ymmbox_logo_img != "") {
					displayYMMLogo();
				 }
				 
                 jQuery("#ymm_label").css("display","block");
			     jQuery(".formFields ul.dropdowns").show();
				 
                 var $dropdowns = jQuery(res.html).find('.ymm-filter');
         
                 $dropdowns.find('option:first').each(function () {
                      var curr_drop_id = jQuery(this).parent().attr("id");
                      var curr_text = jQuery(this).text();
                      var final_lbl = curr_text.replace('Select',select_lbl);
                      jQuery("#"+curr_drop_id+" option:first").text(final_lbl);
                });
                
              	jQuery(".ymm-filter").find("option[value*='none']").html(none_lbl);
              
			    //YMM New type dropdowns shown on ymm search on ymm result page. - 786
                if(use_new_type_dropdowns != "no") {
					jQuery(".formFields ul.dropdowns").find("select").select2({ 
                    dropdownParent: jQuery(".ymm_app"),
                    minimumResultsForSearch: min_res_search,
					"language": { 
					"noResults": function(){ return no_results_slct; } 
					}});

             /*** Iphone 14 Solution (slow click) - 786/92/313/ASKMPF ***/
             jQuery("#ymm_searchbox .formFields .dropdowns select[id^=dropdown]").siblings('.select2-container')
            .off('touchstart')
            .on('touchstart', function (e) {
                e.stopPropagation();
            });

            jQuery("#ymm_searchbox .formFields .dropdowns select[id^=dropdown]").on('select2:open', function () {
                    var my_slct_id = jQuery(this).attr("id");
                    my_slct_id = my_slct_id.replace("dropdown-", "");
                   
                    jQuery("#select2-dropdown-"+my_slct_id+"-results")
                    .off('touchstart')
                    .on('touchstart', 'li', function (e) {
                        e.stopPropagation();
                    });
             });
            //ENDS - 786
                  
                }
				
				var li_element = jQuery(".formFields ul.dropdowns").find('li.ymm_bttns');
					
                if (!li_element.length) {
					var ymm_btn_html = '<li class="ymm_bttns"><div id="ymm_actions" class="button-action" align="center"><button type="button" name="submit" id="ymm_search" class="btn ymm_search" disabled="disabled">';
					
					if(search_btn_img != "") {
						ymm_btn_html += '<img src="'+search_btn_img+'" class="ymm_btn_img" alt="icon" loading="lazy" width="" height="" />';
					}
			
					ymm_btn_html += '<span class="ymm_btn_lbl">'+search_bttn+'</span></button><button type="button" name="reset" id="ymm_reset" class="btn btn--secondary ymm_reset">';
					
					if(reset_btn_img != "") {
						ymm_btn_html += '<img src="'+reset_btn_img+'" class="ymm_btn_img" alt="icon" loading="lazy" width="" height="" />';
					}
					
					ymm_btn_html += '<span class="ymm_btn_lbl">'+reset_bttn+'</span></button></div></li>';
			
      				jQuery(".formFields ul.dropdowns").append(ymm_btn_html);
				}	
				
             	enableSearch();
			}
        }); 
      }
    }
  
  	//On click of Search button build search filter URL
  	jQuery(document).on('click','#ymm_search',function() {
      var dropval = "";
      var loop_cnt = 0;
      var append_tag = "";
  
      jQuery("#ymm_searchbox .formFields .dropdowns select[id^=dropdown]:visible").each(function(i, e) {
       		dropval = e.value;
        	loop_cnt++;
          
        	if(dropval != "-1") {
            	if(loop_cnt >= 1) {
                     if(dropval != "") {
                       if(dropval.indexOf("_none")== -1) {
                           append_tag += dropval+"~";
                       }
                     }
            	}
          	}
	  });
          
      append_tag = removeLastSign(append_tag);
      
	  //Call fitment search func. after ymm search performed on "product page" for PRO Plan User - 786.
	  if(template_name == "product" && pro_plan == "yes") {
			
			//Hide YMMbox and show fitments data- 786.
          	jQuery("#ymm_searchbox").hide();
           	jQuery("#ymm_searchbox").find(".dropdowns").html("");
          
          	//If search button clicked on product page then show product fitments data. - 786
            tags = append_tag.toString().replace(/~/g, ",");
          
          	//Update ymm query parameter value in URL without page reload.
        	const ymm_new_url = new URL(window.location);
			ymm_new_url.searchParams.set("rq", append_tag);
			
			//This will only happen in the theme editor
			if(Shopify.designMode) {
				window.location.href = ymm_new_url;
			} else {
				window.history.replaceState({}, '', ymm_new_url);
			}
			
          	//Get YMM fitment data on page load of product details page for this searched ymm entry. - 786
          	getYMMFitmentData(tags);	
	  } else {
			//Redirect to shopify Product for this searched ymm entry
      		jQuery.ajax({
				type: "GET",
          		jsonp: "callback",
    			dataType: 'jsonp',
      			url: data_url,
				data: "domain="+shop_domain+"&front_domain="+front_domain+"&action=get_single_product&tags="+encodeURIComponent(append_tag)+"&route_url="+window.my_route_url,
            	success: function(res) {
                          window.location.href = searchURL+"?rq="+append_tag;
                          /*if(res.retArr.new_window == "1"){
                              //CUSTOM REDIRECT INTO NEW TAB - 786.
                              var ymm_anchor = document.createElement("a");
                              ymm_anchor.href = res.retArr.redirect_url;
                              ymm_anchor.target = "_blank";
                              document.body.appendChild(ymm_anchor);
                              ymm_anchor.click();
                          } else {
                              window.location.href = res.retArr.redirect_url;
                          }
                          */
				}
        	});
	  }
    });
  
  	//Reset function
  	jQuery(document).on('click','#ymm_reset',function() {
      	resetYMMDropdowns(window.prev_field_id);
    }); 
   
    //Reset YMM product fitment means clicked on "check diff. vehicle" btn on product page. - 786
  	jQuery(document).on('click','#reset_ymm_fitment',function(e) {
      getDropdownsOnload();
    });
   
    //On Click of view other fitments data - 786/92/313/ASM
    jQuery(document).on('click','#view_fitments',function() {      
      tags = tags.toString().replace(/,/g, "~");

      /***
      NOTE: IF URL feature is enabled & it is used for collection filtering purpose then need to redirect to the URL assigned to that YMM row 
      on click of View other fitments data button - 786/92/313/ASKMPF.
      ***/
      if(enable_url_ftr == "yes" && use_url_ftr_for_filter == "yes") {
            //Redirect to shopify Product for this searched ymm entry
      		jQuery.ajax({
				type: "GET",
          		jsonp: "callback",
    			dataType: 'jsonp',
      			url: data_url,
				data: "domain="+shop_domain+"&front_domain="+front_domain+"&action=get_single_product&tags="+encodeURIComponent(tags)+"&route_url="+window.my_route_url,
            	success: function(res) {
                          if(res.retArr.new_window == "1"){
                              //CUSTOM REDIRECT INTO NEW TAB - 786.
                              var ymm_anchor = document.createElement("a");
                              ymm_anchor.href = res.retArr.redirect_url;
                              ymm_anchor.target = "_blank";
                              document.body.appendChild(ymm_anchor);
                              ymm_anchor.click();
                          } else {
                              window.location.href = res.retArr.redirect_url;
                          }
				}
        	});
      } else {
        //Default redirect to YMM product result page. - 786
        window.location.href = searchURL+"?rq="+tags;
      }
    });
	
	//When back/forward button is pressed and coming to the page where ymmbox exists then first dropdown value will be resetted not on ymm result page. - 786
 	jQuery(window).bind("pageshow", function() {
        if(tags == "") {
        var form =  jQuery('#ymm_form');
       	form.trigger("reset");
    	form.find("select.ymm-filter:first").val("-1").trigger('change');
        }
	});
})(jQuery);  
}
  
//Call ymm module - 786-92-313-ASKMPF
if(jQuery(".ymm_app").length>0) {
	jQuery(".cws_ymm_box_cont").find(".ymm_app").removeClass("page-width container");
    jQuery(".cws_ymm_box_cont,.ymm_app").parents("div").removeClass("scroll-trigger animate--slide-in");
	ymmInit();
}

