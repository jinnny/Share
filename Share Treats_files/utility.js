var Request = function() {
	this.getParameter = function(name) {
		var rtnval = "";
		// var nowAddress = unescape(location.href);
		var nowAddress = decodeURIComponent(location.href);
		var parameters = (nowAddress.slice(nowAddress.indexOf("?") + 1, nowAddress.length)).split("&");

		for (var i = 0; i < parameters.length; i++) {
			var varName = parameters[i].split("=")[0];
			if (varName.toUpperCase() == name.toUpperCase()) {
				var firstPosition = parameters[i].indexOf("=");

				if (firstPosition > -1) {
					rtnval = parameters[i].substr(firstPosition + 1);
				} else {
					rtnval = parameters[i]
				}

				break;
			}
		}
		return rtnval.replaceAll("#", "");
	}, this.uri_string = function() {
		var path = $.trim(window.location.pathname);
		if (path.substr(-1) == '/') {
			path = path.substring(0, path.length - 1);
		}

		return path;
	}
}

function fnExceptHTML(data) {
	var text = "";
	text = $("<span />").html(data).text();
	return text;
}

function isEmpty(input) {
	if (input == undefined) {
		return true;
	} else if (Array.isArray(input)) {
		return input.length < 1 ? true : false;
	} else if (typeof (input) == "object") {
		return Object.keys(input) < 1 ? true : false;
	} else {
		return (input == null || input == undefined || input == "") ? true : false;
	}
}

function fnChangeNasToCDN(arrFields, data) {
	if(isEmpty(data)) {
		return;
	}

	var arrKeys = Object.keys(data);

	for(var i=0 ; i < arrFields.length ; i++) {
		var field = arrFields[i];

		for(var j=0 ; j < arrKeys.length ; j++) {
			var key = arrKeys[j];

			if(field == key) {
				var imgSrc = data[key];

				if(imgSrc && imgSrc.indexOf("/nas/") == 0) {
					data[key] = imgSrc.replace("/nas/", CDN + "/nas/");
				}

				continue;
			}
		}
	}
}

/*******************************************************************************
 * Transaction function
 ******************************************************************************/
function fnDoTransaction(strUrl, objData, callback, default_data, is_sync, method) {
	if (!method) {
		method = "POST";
	}

	if (is_sync == undefined) {
		is_sync = false;
	}

	// []/////////////////////////////////////
	var objDataClone = $.extend(true, {}, objData);
	for ( var k in objDataClone) {
		var value = objDataClone[k];

		if (Array.isArray(value)) {
			for (var j = 0; j < value.length; j++) {
				var obj = value[j];
				for ( var key in obj) {
					objData[k + "[" + j + "]" + "." + key] = obj[key];
				}
			}
			delete objData[k];
		}
	}
	// ///////////////////////////////////////

	jQuery.ajax({
		type : method,
		url : strUrl,
		data : objData,
		cache : false,
		async : !(is_sync),
		beforeSend : function(jqXhr, settings) {
			console.log('[jQuery.ajax.beforeSend]:');

		},

		success : function(data, textStatus, jqXhr) {
			console.log('[jQuery.ajax.success]:');

			if (typeof (callback) && callback != null) {
				callback(data);
			}
		},
		complete : function(jqXhr, textStatus) {
			console.log('[jQuery.ajax.complete]:');

		},
		error : function(jqXhr, textStatus, errorThrown) {
			console.log('[jQuery.ajax.error]:');

			if (typeof (callback) && callback != null) {
				callback(default_data);
			}
			console.log(jqXhr);
			console.log(textStatus);
		}
	});
}

jQuery(document).ajaxStart(function() {
	console.log('[jQuery.global.ajaxStart]:');
	fnShowLoading();

}).ajaxSend(function(event, jqXhr, settings) {
	console.log('[jQuery.global.ajaxSend]:');

}).ajaxSuccess(function(event, request, settings) {
	console.log('[jQuery.global.ajaxSuccess]:');

}).ajaxError(function(event, jqXhr, settings, thrownError) {
	console.log('[jQuery.global.ajaxError]:');
	console.log(jqXhr.status);

	// alert("An error has occurred. Please try again later.");
	// location.reload();

}).ajaxComplete(function(event, request, settings) {
	console.log('[jQuery.global.ajaxComplete]:');

}).ajaxStop(function() {
	console.log('[jQuery.global.ajaxStop]:');
	fnHideLoading();
});

/**
 * @name fnExecAjax
 * @desc ajax by jQuery
 */
function fnExecAjax(uri, type, param, callback, async, failCallback, args, endCallback) {
	if (async === undefined) {
		async = true;
	}

	$.ajax({
		type : type,
		data : param,
		url : uri,
		async : async
	}).done(function(data) {
		if (typeof (callback) == "function") {
			callback(data, args);
		}
	}).fail(function(data) {
		if (typeof (failCallback) == "function") {
			failCallback(data, args);
		} else {
			alert("Network Error!");
		}
	}).always(function(data) {
		if (typeof (endCallback) == "function") {
			endCallback(data, args);
		}
	});
}

/**
 * @name fnAjax
 * @desc ajax by jQuery
 */
function fnAjax(cfg) {
	var ajax_config = {
		uri : "",
		type : "POST",
		param : "",
		callback : null,
		async : true,
		fail : null,
		args : null,
		end : null
	};
	ajax_config = $.extend(ajax_config, cfg);

	fnExecAjax(ajax_config.uri, ajax_config.type, ajax_config.param, ajax_config.callback, ajax_config.async, ajax_config.fail, ajax_config.args, ajax_config.end);
}

function fnDoSubmit(strURL, arrData, strTarget, method, isPopupWindow) {
	var objTime = new Date();
	var strFormID = "frm" + objTime.getTime();
	// Target element to submit form if no popup window
	if (!isPopupWindow) {
		var ifrmTargetEL = $("<iframe src='' name='" + strTarget + "' style='width:0px;hegiht:0px;display:none;'>");
		if ($("iframe[name=" + strTarget + "]").length == 0) {
			ifrmTargetEL.appendTo("body");
		}
	}

	// Submit form
	var formEL = $("<form />").attr("id", strFormID).attr("name", strFormID).attr("action", strURL);
	if (!method) {
		method = "post";
	}
	formEL.attr("method", method);
	if (strTarget) {
		formEL.attr("target", strTarget);
	}
	for (index in arrData) {
		var strType = arrData[index].type;
		if (!strType) {
			strType = "hidden";
		}
		var strName = arrData[index].name;
		var strValue = arrData[index].value;
		$("<input />").attr("type", "hidden").attr("name", strName).val(strValue).appendTo(formEL);
	}
	formEL.appendTo("body");
	formEL.submit();
}

function fnApplyAddComma($targetArea) {
	if (!$targetArea) {
		$targetArea = $(document);
	}

	$targetArea.find(".numeral").each(function() {
		var that = $(this);
		var val = that.val();

		fnAddComma(this);
	});

	$targetArea.find(".numeral").keyup(function(e) {
		var that = $(this);
		var val = that.val();

		fnAddComma(this);
	});

	if ($targetArea.find(".numeral").length > 0) {
		var rreturn = /\r/g, rspaces = /[\x20\t\r\n\f]+/g;

		jQuery.fn.extend({
			val : function(value) {
				var hooks, ret, isFunction, elem = this[0];

				if (!arguments.length) {
					if (elem) {
						hooks = jQuery.valHooks[elem.type] || jQuery.valHooks[elem.nodeName.toLowerCase()];

						if (hooks && "get" in hooks && (ret = hooks.get(elem, "value")) !== undefined) {
							return ret;
						}

						ret = elem.value;

						// Customize the feature of this function
						var isNumeral = this.hasClass("numeral");

						if (isNumeral) {
							ret = numeral(ret).value();
						}

						return typeof ret === "string" ?

						// Handle most common string cases
						ret.replace(rreturn, "") :

						// Handle cases where value is null/undef or number
						ret == null ? "" : ret;
					}

					return;
				}

				isFunction = jQuery.isFunction(value);

				return this.each(function(i) {
					var val;

					if (this.nodeType !== 1) {
						return;
					}

					if (isFunction) {
						val = value.call(this, i, jQuery(this).val());
					} else {
						val = value;
					}

					// Treat null/undefined as ""; convert
					// numbers to string
					if (val == null) {
						val = "";

					} else if (typeof val === "number") {
						val += "";

					} else if (jQuery.isArray(val)) {
						val = jQuery.map(val, function(value) {
							return value == null ? "" : value + "";
						});
					}

					hooks = jQuery.valHooks[this.type] || jQuery.valHooks[this.nodeName.toLowerCase()];

					// If set returns undefined, fall back to
					// normal setting
					if (!hooks || !("set" in hooks) || hooks.set(this, val, "value") === undefined) {
						this.value = val;
					}
				});
			}
		});
	}
}

function fnConvertNL2BRString(input) {
	var result = "";
	if (!isEmpty(input)) {
		result = input.replace(/(?:\r\n|\r|\n)/g, '<br>');
	}
	return result;
}

function fnConvertNL2BR($target) {
	$target.each(function() {
		var that = $(this);
		var str = that.html();

		str = fnConvertNL2BRString(str);
		that.html(str);
	});
}

function isNotDate(target) {
	return !isDate(target);
}

function isDate(target) {
	/*
	 * var timestamp=Date.parse(target);
	 *
	 * if(isNaN(timestamp)==false) { //This is date type return true; } else {
	 * return false; }
	 */
	return moment(target).isValid();
}

function fnAddComma(inputValue) {

	var result = inputValue;

	if (typeof (inputValue) == "number") {
		result = numeral(inputValue).format('0,0');
		return result;

	} else if (typeof (inputValue) == "object" && inputValue.tagName == "INPUT") {
		// In case, input tag
		var that = $(inputValue);
		var val = that.val();
		that.val(numeral(val).format('0,0'));

	} else if (typeof (inputValue) == "object" && (inputValue.tagName == "DIV" || inputValue.tagName == "A" || inputValue.tagName == "SPAN" || inputValue.tagName == "LABEL" || inputValue.tagName == "P")) {
		// In case, input tag
		var that = $(inputValue);
		var val = that.text();
		that.text(numeral(val).format('0,0'));
	}
}

/**
 * @example fnMakeFormattedEL(arrCourseList, jQuery(".ulCourseList"), '
 *          <li>{0}</li>', "field_no", ["course_nm"]);
 * @returns
 */
function fnMakeFormattedEL(arrDataList, targetEL, strFormatString, strKeyFieldName, arrFieldName) {

	if (typeof (arrDataList) == "object" && arrDataList.length > 0) {
		targetEL.each(function(index, object) {
			var that = jQuery(object);

			var strFKey = that.attr("fkey");
			var strSelectedValue = that.attr("selectedValue");
			var strCheckedValue = that.attr("checkedValue");
			var strHTML = "";

			for ( var index in arrDataList) {

				var objData = arrDataList[index];

				if (strSelectedValue != undefined) { // select box rendering
					var arrDataArg = [];
					var strFieldName = "";

					for ( var indexFieldName in arrFieldName) {
						strFieldName = arrFieldName[indexFieldName];
						arrDataArg.push(objData[strFieldName]);
					}

					if (strSelectedValue.toUpperCase() == objData[strKeyFieldName].toUpperCase()) {
						arrDataArg.push("selected");
					} else {
						arrDataArg.push("");
					}

					strHTML += StringFormat(strFormatString, arrDataArg);

				} else if (strCheckedValue != undefined) { // check box list
					// rendering
					var arrDataArg = [];
					var strFieldName = "";

					for ( var indexFieldName in arrFieldName) {
						strFieldName = arrFieldName[indexFieldName];
						arrDataArg.push(objData[strFieldName]);
					}

					if (strCheckedValue.toUpperCase() == objData[strKeyFieldName].toUpperCase()) {
						arrDataArg.push("checked");
					} else {
						arrDataArg.push("");
					}

					strHTML += StringFormat(strFormatString, arrDataArg);

				} else if (strFKey != undefined) { // unordered list rendering
					if (strFKey == objData[strKeyFieldName]) {
						var arrDataArg = [];
						var strFieldName = "";

						for ( var indexFieldName in arrFieldName) {
							strFieldName = arrFieldName[indexFieldName];
							arrDataArg.push(objData[strFieldName]);
						}

						strHTML += StringFormat(strFormatString, arrDataArg);
					}
				}
			}
			that.append(jQuery(strHTML));

			// Fire event select if selected value exists
			if (strSelectedValue != undefined) { // select box rendering
				if (that.find("option:selected").length > 0) {
					that.change();
				}
			}
		});
	}
}

/**
 * @example var value = StringFormat("{0}, {1}, {2} ...{...}", ["DATA1",
 *          "DATA2", "DATA3"]);
 * @returns
 */
function StringFormat(strFormatString, arrDataArg) {
	var expression = strFormatString;
	for (var i = 0; i < arrDataArg.length; i++) {
		var prttern = "{" + (i) + "}";
		expression = expression.replaceAll(prttern, arrDataArg[i]);
	}

	return expression;
}

/**
 * Make a select box from JSON
 */
function form_dropdown_by_array($target, name, jsonArray, keyName, valueName, selected, emptyOptionText, extra) {

	var $selectBox = $('<select name="' + name + '" ' + (extra ? extra : "") + ' />');
	var options = jsonArray;
	var $option = "";

	if (!keyName) {
		keyName = "key";
	}

	if (!valueName) {
		valueName = "value";
	}

	if (emptyOptionText !== null) {
		$option = $('<option value="">' + emptyOptionText + '</option>');
		$selectBox.append($option)
	}

	if (options && Array.isArray(options)) {
		for (var i = 0; i < options.length; i++) {
			var opt = options[i];
			$option = $('<option value="' + opt[keyName] + '" ' + ((opt[keyName] == selected) ? "selected" : "") + ' >' + opt[valueName] + '</option>');
			$selectBox.append($option)
		}
	}

	$target.html($selectBox);
}

function form_dropdown($target, name, url, resultArrayKey, resultKeyValueName, inputParams, selected, emptyOptionText, extra, callback_success) {

	// Retrieve data list from the URL(url)
	var objData = {
		"pageUnit" : -1,
		"pagerSize" : -1
	};

	$.extend(objData, inputParams);

	fnDoTransaction(url, objData, function(jsonData) {
		if (jsonData && typeof (jsonData) == "object") {
			// Set a new token_value
			if (jsonData.csrf) {
				CSRF.name = jsonData.csrf.name;
				CSRF.hash = jsonData.csrf.hash;
			}

			if (jsonData.result == "success") {
				// succeed
				// console.log(jsonData[resultArrayKey]);

				var $selectBox = $('<select name="' + name + '" ' + (extra ? extra : "") + ' />');
				var options = jsonData[resultArrayKey];
				var $option = "";

				if (emptyOptionText !== null) {
					$option = $('<option value="">' + emptyOptionText + '</option>');
					$selectBox.append($option)
				}

				if (options && Array.isArray(options)) {
					for (var i = 0; i < options.length; i++) {
						var opt = options[i];
						$option = $('<option value="' + opt[resultKeyValueName.key] + '" ' + ((opt[resultKeyValueName.key] == selected) ? "selected" : "") + ' >' + opt[resultKeyValueName.value] + '</option>');
						$selectBox.append($option)
					}
				}

				$target.html($selectBox);

				if (typeof (callback_success) == "function") {
					callback_success();
				}

			} else {
				// fail to save
				var strMessage = (jsonData[resultArrayKey] ? jsonData[resultArrayKey] : "데이터 조회 시에 일시적인 장애가 발생했습니다. 새로고침 후 다시 시도해 주세요.");
				var strTitle = "조회 실패";
				fnAlert(null, strMessage, strTitle, null, 'type-danger', true);
			}
		}

	});
}

Date.prototype.format = function(f) {
	if (!this.valueOf())
		return " ";

	var weekName = [ "일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일" ];
	var d = this;

	return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p)/gi, function($1) {
		switch ($1) {
		case "yyyy":
			return d.getFullYear();
		case "yy":
			return (d.getFullYear() % 1000).zf(2);
		case "MM":
			return (d.getMonth() + 1).zf(2);
		case "dd":
			return d.getDate().zf(2);
		case "E":
			return weekName[d.getDay()];
		case "HH":
			return d.getHours().zf(2);
		case "hh":
			return ((h = d.getHours() % 12) ? h : 12).zf(2);
		case "mm":
			return d.getMinutes().zf(2);
		case "ss":
			return d.getSeconds().zf(2);
		case "a/p":
			return d.getHours() < 12 ? "오전" : "오후";
		default:
			return $1;
		}
	});
};
String.prototype.string = function(len) {
	var s = '', i = 0;
	while (i++ < len) {
		s += this;
	}
	return s;
};
String.prototype.zf = function(len) {
	return "0".string(len - this.length) + this;
};
Number.prototype.zf = function(len) {
	return this.toString().zf(len);
};

/**
 * @description Replace string text in all region
 * @param search
 * @param replacement
 * @returns Result of replacement string text
 */
String.prototype.replaceAll = function(search, replacement) {
	var target = this;
	return target.split(search).join(replacement).trim();
};

String.prototype.removeSearch = function() {
	var target = this.toString();
	var pos = -1;

	pos = target.indexOf("?");
	if (pos > -1) {
		target = target.substring(0, pos);
	}

	pos = target.indexOf("#");
	if (pos > -1) {
		target = target.substring(0, pos);
	}

	return target;
}

function fnProgressClose() {
	$("#dialog-progress").dialog('close');
}
function fnProgress(callback_ok, strMessage, strTitle, intWidth, intHeight, boolResizable) {
	var strId = "dialog-progress";

	// Remove already opened
	$("#" + strId).remove();

	if (!strMessage) {
		strMessage = "Please wait.";
	}

	if (!strTitle) {
		strTitle = "In progress";
	}

	if (!intWidth) {
		intWidth = 350;
	}

	if (!intHeight) {
		intHeight = 160;
	}

	if (!boolResizable) {
		boolResizable = false;
	}

	var strHTML = '';
	strHTML += '<div id="' + strId + '" title="' + strTitle + '">';
	strHTML += '	<p><span class="ui-icon ui-icon-circle-check" style="float:left; margin:0 7px 50px 0;"></span>';
	strHTML += strMessage;
	strHTML += '	</p>';
	strHTML += '	<div id="progressbar"><div class="progress-label">Loading...</div></div>';
	strHTML += '</div>';

	// Dialog
	$(strHTML).dialog({
		autoOpen : false,
		resizable : boolResizable,
		width : intWidth,
		height : intHeight,
		modal : true
	});

	//
	var progressbar = $("#progressbar"), progressLabel = $(".progress-label");

	progressbar.progressbar({
		value : false,
		change : function() {
			progressLabel.text(progressbar.progressbar("value") + "%");
		},
		complete : function() {
			progressLabel.text("Complete!");
		}
	});

	// Display confirm dialog
	$("#" + strId).dialog('open');
}

// [Loading
// indicator]/////////////////////////////////////////////////////////////////////
var LOADING_OVERLAY;

function fnShowLoading() {

	fnHideLoading();

	// Show a backdrop overlay
	var $backdropLayer = $('<div id="backdropLayer" class="modal-backdrop fade in" style="z-index: 1940;" />');
	$("body").append($backdropLayer);

	// Show a spinner overlay
	var opts = {
		lines : 13, // The number of lines to draw
		length : 11, // The length of each line
		width : 5, // The line thickness
		radius : 17, // The radius of the inner circle
		corners : 1, // Corner roundness (0..1)
		rotate : 0, // The rotation offset
		color : '#FFF', // #rgb or #rrggbb
		speed : 1, // Rounds per second
		trail : 60, // Afterglow percentage
		shadow : false, // Whether to render a shadow
		hwaccel : false, // Whether to use hardware acceleration
		className : 'spinner', // The CSS class to assign to the spinner
		zIndex : 2e9, // The z-index (defaults to 2000000000)
		top : 'auto', // Top position relative to parent in px
		left : 'auto' // Left position relative to parent in px
	};
	var target = document.createElement("div");
	document.body.appendChild(target);
	var spinner = new Spinner(opts).spin(target);
	LOADING_OVERLAY = iosOverlay({
		text : "Loading",
		spinner : spinner
	});
	$(target).remove();

	// window.setTimeout(function() {
	// LOADING_OVERLAY.update({
	// icon: "img/check.png",
	// text: "Success"
	// });
	// }, 3e3);
}

function fnHideLoading() {
	// Destroy the backdrop overlay
	var $backdropLayer = $("#backdropLayer");
	$backdropLayer.remove();

	// Destroy the spinner overlay
	if (LOADING_OVERLAY) {
		LOADING_OVERLAY = LOADING_OVERLAY.hide(); // .destroy();
	}
}

/*******************************************************************************
 * Display a alert dialog
 ******************************************************************************/
function fnAlert(callback_ok, strMessage, strTitle, size, dialogType, draggable) {
	var strId = "dialog-alert";

	// Remove already opened
	$("#" + strId).remove();

	if (!strMessage) {
		strMessage = "Mission complete.";
	}

	if (!strTitle) {
		strTitle = "Information";
	}

	if (!size) {
		size = 'size-small';
	}

	if (!dialogType) {
		dialogType = "type-primary";
		/*
		 * BootstrapDialog.TYPE_DEFAULT or 'type-default'
		 * BootstrapDialog.TYPE_INFO or 'type-info' BootstrapDialog.TYPE_PRIMARY
		 * or 'type-primary' (default) BootstrapDialog.TYPE_SUCCESS or
		 * 'type-success' BootstrapDialog.TYPE_WARNING or 'type-warning'
		 * BootstrapDialog.TYPE_DANGER or 'type-danger'
		 */
	}

	if (!draggable) {
		draggable = false;
	}

	// ///////////////////////////////////////////////////////////
	alert(strMessage);

	if (typeof (callback_ok) == "function") {
		callback_ok();
	}

	return;
	// ///////////////////////////////////////////////////////////

	var strHTML = '';
	strHTML += '<div id="' + strId + '" title="' + strTitle + '">';
	strHTML += '	<p><span class="ui-icon ui-icon-circle-check" style="float:left; margin:0 7px 50px 0;"></span>';
	strHTML += strMessage;
	strHTML += '	</p>';
	strHTML += '</div>';

	// Display confirm dialog
	BootstrapDialog.alert({
		title : strTitle,
		message : strMessage,
		type : dialogType,
		size : size,
		closable : true, // <-- Default value is false
		draggable : draggable, // <-- Default value is false
		buttonLabel : 'Ok', // <-- Default value is 'OK',
		callback : function(result) {
			// result will be true if button was click, while it will be
			// false if users close the dialog directly.
			if (typeof (callback_ok) == "function") {
				callback_ok();

			} else if (callback_ok != null && typeof (callback_ok) == "object") {
				var params = callback_ok.params;
				callback_ok.fnc(params);
			}
		}
	});
}

/*******************************************************************************
 * Display a confirm dialog
 ******************************************************************************/
function fnConfirm(callback_ok, strMessage, strTitle, size, dialogType, draggable) {
	var strId = "dialog-confirm";

	// Remove already opened
	$("#" + strId).remove();

	if (!strMessage) {
		strMessage = "Are you sure to keep going?";
	}

	if (!strTitle) {
		strTitle = "Confirm definitely";
	}

	if (!size) {
		size = 'size-small';
	}

	if (!dialogType) {
		dialogType = "type-warning";
		/*
		 * BootstrapDialog.TYPE_DEFAULT or 'type-default'
		 * BootstrapDialog.TYPE_INFO or 'type-info' BootstrapDialog.TYPE_PRIMARY
		 * or 'type-primary' (default) BootstrapDialog.TYPE_SUCCESS or
		 * 'type-success' BootstrapDialog.TYPE_WARNING or 'type-warning'
		 * BootstrapDialog.TYPE_DANGER or 'type-danger'
		 */
	}

	if (!draggable) {
		draggable = false;
	}

	// ///////////////////////////////////////////////////////////
	if (confirm(strMessage)) {
		if (typeof (callback_ok) == "function") {
			callback_ok();
		}
	}

	return;
	// ///////////////////////////////////////////////////////////

	var strHTML = '';
	strHTML += '<div id="' + strId + '" title="' + strTitle + '">';
	strHTML += '	<p><span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;"></span>';
	strHTML += strMessage;
	strHTML += '	</p>';
	strHTML += '</div>';

	// Display confirm dialog
	BootstrapDialog.confirm({
		title : strTitle,
		message : strMessage,
		type : dialogType,
		size : size,
		closable : true, // <-- Default value is false
		draggable : draggable, // <-- Default value is false
		btnCancelLabel : 'Cancel', // <-- Default value is 'Cancel',
		btnOKLabel : 'Ok', // <-- Default value is 'OK',
		btnOKClass : 'btn-warning', // <-- If you didn't specify it, dialog type
		// will be used,
		callback : function(result) {
			// result will be true if button was click, while it will be false
			// if users close the dialog directly.
			if (result) {
				if (typeof (callback_ok) && callback_ok != null) {
					callback_ok();
				}
			}
		}
	});
}

// [Display a remote page with
// dialog]////////////////////////////////////////////////////
function fnDialog(pageURL, objData, strTitle, size, dialogType, draggable, callback_onshown, callback_onhidden) {

	if (!pageURL) {
		pageURL = "";
	}

	if (!strTitle) {
		strTitle = "";
	}

	if (!size) {
		size = 'size-wide';
	}

	if (!dialogType) {
		dialogType = "type-primary";
		/*
		 * BootstrapDialog.TYPE_DEFAULT or 'type-default'
		 * BootstrapDialog.TYPE_INFO or 'type-info' BootstrapDialog.TYPE_PRIMARY
		 * or 'type-primary' (default) BootstrapDialog.TYPE_SUCCESS or
		 * 'type-success' BootstrapDialog.TYPE_WARNING or 'type-warning'
		 * BootstrapDialog.TYPE_DANGER or 'type-danger'
		 */
	}

	if (!draggable) {
		draggable = false;
	}

	BootstrapDialog.show({
		title : strTitle,
		message : function(dialog) {
			var $message = $('<div id="messageContainer"></div>');
			var pageToLoad = dialog.getData('pageToLoad');

			if (typeof (callback_onshown) == "function") {
				$message.load(pageToLoad, objData, callback_onshown);
			} else {
				$message.load(pageToLoad, objData);
			}

			return $message;
		},
		type : dialogType,
		size : size,
		closable : true, // <-- Default value is false
		draggable : draggable, // <-- Default value is false
		data : {
			'pageToLoad' : pageURL
		},
		onshown : function(dlgHandle) {

		},
		onhidden : function(dlgHandle) {
			if (typeof (callback_onhidden) == "function") {
				callback_onhidden();
			}
		}
	});
}

function IS_MOBILE() {
	var check = false;
	var md = new MobileDetect(window.navigator.userAgent);

	if (md.is("AndroidOS") || md.is("iOS")) {
		check = true;
	}

	return check;
}

// [Handlebars] ////////////////////////////////////////////////////////////
if (typeof (Handlebars) !== "undefined") {
	Handlebars.registerHelper("x", function(expression, options) {
		var result;

		// you can change the context, or merge it with options.data,
		// options.hash
		var context = this;

		// yup, i use 'with' here to expose the context's properties as block
		// variables
		// you don't need to do {{x 'this.age + 2'}}
		// but you can also do {{x 'age + 2'}}
		// HOWEVER including an UNINITIALIZED var in a expression will return
		// undefined as the result.
		with (context) {
			result = (function() {
				try {
					return eval(expression);
				} catch (e) {
					console.warn('•Expression: {{x \'' + expression + '\'}}\n•JS-Error: ', e, '\n•Context: ', context);
				}
			}).call(context); // to make eval's lexical this=context
		}

		return result;
	});

	Handlebars.registerHelper("xif", function(expression, options) {
		return Handlebars.helpers["x"].apply(this, [ expression, options ]) ? options.fn(this) : options.inverse(this);
	});
}

function fnRenderInTemplate(templateElement, data) {
	if (typeof (Handlebars) === "undefined") {
		return;
	}

	// Reset a template
	templateElement.siblings().remove();

	// Display a template with data
	var source = templateElement.html();
	var template = Handlebars.compile(source);
	var rendered = template(data);
	templateElement.hide();
	templateElement.after(rendered);
}

function fnRender(source_html, $target, data, is_append) {
	if (typeof (Handlebars) === "undefined") {
		return;
	}

	// Check the input validation
	if (!source_html || $target.length == 0) {
		return;
	}

	var template = Handlebars.compile(source_html);
	var rendered = template(data);
	var $rendered = $(rendered);

	fnInitUIScript($rendered); // 날짜포맷(datetime) 일괄 적용

	if ($target.prop("tagName").toLowerCase() == "script") {
		var id = $target.attr("id");

		if (!is_append) {
			// Remove previous template with data
			$target.parent().find('[id="' + id + '"]').not($("script")).remove();

			// Insert to display rendering elements after template
			$target.parent().prepend($rendered.attr("id", id));
		} else {
			// Insert to display rendering elements before template
			$target.before($rendered.attr("id", id));
		}
	} else {
		$target.html($rendered);
	}
}

/**
 * @description : 결재정보를 Json data로 변환
 * @author : ChuYeonJin
 * @date : 2018.01.30
 * @params
 * @data : ex) var data = { 'bagIds' : '변수 or 배열' ,'prdId' : '변수' ,'itemIds' :
 *       '변수 or 배열' ,'itemPrdIds' : '변수 or 배열' };
 */
function fnPaymentJson(data) {

	if (data == null || data == '') {
		return null;
	}

	var bagIds = data['bagIds'];
	var prdId = data['prdId'];
	var itemIds = data['itemIds'];
	var itemPrdIds = data['itemPrdIds'];

	var jsonObj = null;

	if (bagIds != null && bagIds != '') {
		var bagArray = new Array();

		if (Array.isArray(bagIds)) {
			for (var i = 0; i < bagIds.length; i++) {
				bagArray.push(bagIds[i]);
			}
		} else {
			bagArray.push(bagIds);
		}

		jsonObj = {
			'type' : 'bag',
			'bagIds' : bagArray
		};
	} else if (prdId != null && prdId != '') {
		var itemArray = null;
		var itemPrdArray = null;

		if (itemIds != null && itemIds != '') {
			itemArray = new Array();
			if (Array.isArray(itemIds)) {
				for (var i = 0; i < itemIds.length; i++) {
					itemArray.push(itemIds[i]);
				}
			} else {
				itemArray.push(itemIds);
			}
		}

		if (itemPrdIds != null && itemPrdIds != '') {
			itemPrdArray = new Array();
			if (Array.isArray(itemPrdIds)) {
				for (var i = 0; i < itemPrdIds.length; i++) {
					itemPrdArray(itemPrdIds[i]);
				}
			} else {
				itemPrdArray(itemPrdIds);
			}
		}

		jsonObj = {
			'type' : 'dir',
			'prdId' : prdId,
			'itemIds' : itemArray,
			'itemPrdIds' : itemPrdArray
		};
	}

	jsonObj = JSON.stringify(jsonObj);
	jsonObj = jsonObj.replaceAll('\"', '\'');

	return jsonObj;
}

// Production steps of ECMA-262, Edition 6, 22.1.2.1
// Reference:
// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-array.from
if (!Array.from) {
	Array.from = (function() {
		var toStr = Object.prototype.toString;
		var isCallable = function(fn) {
			return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
		};
		var toInteger = function(value) {
			var number = Number(value);
			if (isNaN(number)) {
				return 0;
			}
			if (number === 0 || !isFinite(number)) {
				return number;
			}
			return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
		};
		var maxSafeInteger = Math.pow(2, 53) - 1;
		var toLength = function(value) {
			var len = toInteger(value);
			return Math.min(Math.max(len, 0), maxSafeInteger);
		};

		// The length property of the from method is 1.
		return function from(arrayLike/* , mapFn, thisArg */) {
			// 1. Let C be the this value.
			var C = this;

			// 2. Let items be ToObject(arrayLike).
			var items = Object(arrayLike);

			// 3. ReturnIfAbrupt(items).
			if (arrayLike == null) {
				throw new TypeError("Array.from requires an array-like object - not null or undefined");
			}

			// 4. If mapfn is undefined, then let mapping be false.
			var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
			var T;
			if (typeof mapFn !== 'undefined') {
				// 5. else
				// 5. a If IsCallable(mapfn) is false, throw a TypeError
				// exception.
				if (!isCallable(mapFn)) {
					throw new TypeError('Array.from: when provided, the second argument must be a function');
				}

				// 5. b. If thisArg was supplied, let T be thisArg; else let T
				// be undefined.
				if (arguments.length > 2) {
					T = arguments[2];
				}
			}

			// 10. Let lenValue be Get(items, "length").
			// 11. Let len be ToLength(lenValue).
			var len = toLength(items.length);

			// 13. If IsConstructor(C) is true, then
			// 13. a. Let A be the result of calling the [[Construct]] internal
			// method of C with an argument list containing the single item len.
			// 14. a. Else, Let A be ArrayCreate(len).
			var A = isCallable(C) ? Object(new C(len)) : new Array(len);

			// 16. Let k be 0.
			var k = 0;
			// 17. Repeat, while k < len… (also steps a - h)
			var kValue;
			while (k < len) {
				kValue = items[k];
				if (mapFn) {
					A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
				} else {
					A[k] = kValue;
				}
				k += 1;
			}
			// 18. Let putStatus be Put(A, "length", len, true).
			A.length = len;
			// 20. Return A.
			return A;
		};
	}());
}

function fnGetRootMenuKey() {
	var key = "";

	if (ROOT_MENU) {
		var keys = Object.keys(ROOT_MENU);

		if (keys && keys.length > 0) {
			key = keys[0];
		}
	}

	return key;
}

function fnGetRootMenuTitle() {
	var value = "";

	if (ROOT_MENU) {
		var keys = Object.keys(ROOT_MENU);

		if (keys && keys.length > 0) {
			value = ROOT_MENU[keys[0]];
		}
	}

	return value;
}

function fnInitUIScript($targetEL, formatFrom, formatTo) {
	if (!$targetEL) {
		$targetEL = $("body");
	} else if (!$targetEL.get(0)) {
		return;
	}

	// Bind Calendar Event and Set div
	var $dtpickers = $targetEL.find(".datepicker");

	if($dtpickers) {
		$dtpickers.each(function() {
			var dtValue = $(this).val();

			if (dtValue.length > 10) {
				$(this).val(dtValue.substring(0, 10));
			}
		});

		$dtpickers.wrap('<div class="input-group" />').after('<span class="input-group-addon"><i class="glyphicon glyphicon-th"></i></span>').datepicker({
			format : "yyyy-mm-dd",
			todayHighlight : true,
			autoclose : true
		});
	}

	// Bind date & time picker
	/*
	 * var $timePickers = $targetEL.find(".time_picker"); $timePickers.wrap('<div
	 * class="input-group" />') .after('<span class="input-group-addon"><i
	 * class="glyphicon glyphicon-time"></i></span>');
	 *
	 * $timePickers.timepicker({ timeFormat: 'HH:mm:ss', interval: 30, minTime:
	 * '00:00', maxTime: '23:59', defaultTime: '', startTime: '00:00', dynamic:
	 * false, dropdown: true, scrollbar: true });
	 */

	// Bind to convert a datetime format
	var $dateTimes = $targetEL.find(".datetime");
	fnFormatDateTime($dateTimes, formatFrom, formatTo);

	// UI
	$targetEL.find("button").button();
	// $targetEL.find(".radioset").buttonset();

	$targetEL.find(".ui-state-default:not('.ui-state-disabled')").mouseover(function() {
		var that = $(this);
		that.addClass("ui-state-hover");
	}).mouseout(function() {
		var that = $(this);
		that.removeClass("ui-state-hover");
	}).css("cursor", "pointer");

	if ($targetEL.find(".numeral").length > 0) {
		fnApplyAddComma($targetEL);
	}

	// Newline2Br
	if ($targetEL.hasClass("nl2br")) {
		fnConvertNL2BR($targetEL);
	} else if ($targetEL.find(".nl2br").length > 0) {
		fnConvertNL2BR($targetEL.find(".nl2br"));
	}

	/*
	 * if($targetEL.hasClass("slick3")) { fnBindSlick3($targetEL); } else
	 * if($targetEL.find(".slick3").length > 0) {
	 * fnBindSlick3($targetEL.find(".slick3")); }
	 */
}

function fnBindSlick1($target) {
	/*
	 * [ Slick1 ] ===========================================================
	 */
	$target.slick({
		slidesToShow : 1,
		slidesToScroll : 1,
		fade : false,
		dots : false,
		appendDots : $('.wrap-slick1-dots'),
		dotsClass : 'slick1-dots',
		infinite : true,
		autoplay : true,
		autoplaySpeed : 6000,
		arrows : true,
		appendArrows : $('.wrap-slick1'),
		prevArrow : '<button class="arrow-slick1 prev-slick1"><i class="fa  fa-angle-left" aria-hidden="true"></i></button>',
		nextArrow : '<button class="arrow-slick1 next-slick1"><i class="fa  fa-angle-right" aria-hidden="true"></i></button>',
	});
}

function fnBindSlick2($target) {
	/*
	 * [ Slick2 ] ===========================================================
	 */
	$target.slick({
		slidesToShow : 4,
		slidesToScroll : 4,
		infinite : false,
		autoplay : false,
		autoplaySpeed : 6000,
		arrows : true,
		appendArrows : $target.parent(),
		prevArrow : '<button class="arrow-slick2 prev-slick2"><i class="fa  fa-angle-left" aria-hidden="true"></i></button>',
		nextArrow : '<button class="arrow-slick2 next-slick2"><i class="fa  fa-angle-right" aria-hidden="true"></i></button>',
		responsive : [ {
			breakpoint : 1200,
			settings : {
				slidesToShow : 4,
				slidesToScroll : 4
			}
		}, {
			breakpoint : 992,
			settings : {
				slidesToShow : 3,
				slidesToScroll : 3
			}
		}, {
			breakpoint : 768,
			settings : {
				slidesToShow : 2,
				slidesToScroll : 2
			}
		}, {
			breakpoint : 576,
			settings : {
				slidesToShow : 2,
				slidesToScroll : 2
			}
		} ]
	});
}

function fnBindSlick3($target, custom) {
	if (custom == null) {
		custom = function(slick, index) {
			var portrait = $(slick.$slides[index]).data('thumb');

			return '<img src=" ' + portrait + ' "/><div class="slick3-dot-overlay"></div>';
		}
	}

	$target.slick({
		slidesToShow : 1,
		slidesToScroll : 1,
		fade : true,
		dots : true,
		appendDots : $('.wrap-slick3-dots'),
		dotsClass : 'slick3-dots',
		infinite : false,
		autoplay : false,
		autoplaySpeed : 6000,
		arrows : false,
		customPaging : custom,
	});

	var parent = $target.parent();
	var dots = parent.find('.wrap-slick3-dots');

	parent.prepend(dots);
}

function fnBindSlick11($target) {
	$target.slick({
		infinite : false,
		slidesToShow : 8,
		slidesToScroll : 8,
		autoplay : false,
		autoplaySpeed : 6000,
		arrows : false,
		responsive : [

		{
			breakpoint : 768,
			settings : {
				slidesToShow : 6.5,
				slidesToScroll : 6.5
			}
		}, {
			breakpoint : 576,
			settings : {
				slidesToShow : 4.5,
				slidesToScroll : 4.5
			}
		} ]
	});
}

function fnFormatDateTime($targetEL, formatFrom, formatTo) {
	if (!formatFrom) {
		formatFrom = "YYYY-MM-DD hh:mm:ss";
	}

	if (!formatTo) {
		formatTo = "YYYY-MM-DD";
	}

	var dtValue = "", dtInput, dtOutput;

	if (typeof ($targetEL) == "string") {
		// simple text
		dtValue = $targetEL;

		// dtInput = new Date(dtValue);
		dtInput = moment(dtValue);
		if (isNotDate(dtValue)) {
			return dtValue;
		}

		dtOutput = dtInput.format(formatTo);

		return dtOutput;

	} else {
		// TAG object
		$targetEL.each(function(index, targetObj) {
			var $targetObj = $(targetObj);
			var tagName = targetObj.tagName;
			tagName = tagName.toLowerCase();

			// input
			if ("span" == tagName || "div" == tagName || "td" == tagName || "th" == tagName) {
				dtValue = $targetObj.text();

			} else if ("input" == tagName) {
				dtValue = $targetObj.val();

			}

			// dtInput = new Date(dtValue);
			dtInput = moment(dtValue);
			if (isDate(dtValue)) {
				dtOutput = dtInput.format(formatTo);
			} else {
				dtOutput = dtValue;
			}

			// output
			if ("span" == tagName || "div" == tagName || "td" == tagName || "th" == tagName) {
				$targetObj.text(dtOutput);

			} else if ("input" == tagName) {
				$targetObj.val(dtOutput);

			}
		});
	}
}

// [handling browser cookies] /////////////////////////////////////////////////
function fnSetCookie(cName, cValue, isPersistent, minute) {
	if (isEmpty(cName)) {
		return;
	}

	cookies = cName + '=' + escape(cValue) + '; path=/ ';

	if (isPersistent === true) {
		var expire = new Date();
		expire.setDate(expire.getDate() + 30);
		cookies += ';expires=' + expire.toGMTString() + ';';
	}

	if (!isEmpty(minute)){
		var expire = new Date();
		expire.setTime(expire.getTime() + ( 1000 * 60 * minute ));
		cookies += ';expires=' + expire.toGMTString() + ';';
	}

	document.cookie = cookies;
}

function fnClearCookie(cName) {
	fnSetCookie(cName, "", false);
}

function fnGetCookie(cName) {
	cName = cName + '=';
	var cookieData = document.cookie;
	var start = cookieData.indexOf(cName);
	var cValue = '';
	if (start != -1) {
		start += cName.length;
		var end = cookieData.indexOf(';', start);
		if (end == -1)
			end = cookieData.length;
		cValue = cookieData.substring(start, end);
	}
	return unescape(cValue);
}

// [twbsPagination] //////////////////////////////////////////////////////
if ($.fn.twbsPagination) {
	var default_params = {
		totalPages : 1,
		startPage : 1,
		visiblePages : 5,
		initiateStartPageClick : false,
		hideOnlyOnePage : false,
		href : false,
		pageVariable : '{{page}}',
		totalPagesVariable : '{{total_pages}}',
		page : null,
		first : '<<',
		prev : '<',
		next : '>',
		last : '>>',
		loop : false,
		onPageClick : null,
		paginationClass : 'pagination',
		nextClass : 'page-item next',
		prevClass : 'page-item prev',
		lastClass : 'page-item last',
		firstClass : 'page-item first',
		pageClass : 'page-item',
		activeClass : 'active',
		disabledClass : 'disabled',
		anchorClass : 'page-link'
	};
	$.extend($.fn.twbsPagination.defaults, default_params);
}

function fnJudgeApp() {
	var isApp = false;
	if (window.pasatreatAndroid) {
		// isApp = window.pasatreatAndroid.isApp();
		isApp = true;
	}
	return isApp;
}

var objPopupWindow;

function fnPopupWindow(url, w, h) {
	// Set the position of the popup window
	var objTime = new Date();
	var strWindowName = "pop" + objTime.getTime();
	var width = 800;
	if (w) {
		width = w;
	}
	var height = 600;
	if (h) {
		height = h;
	}
	var top = (screen.height - height) / 2 - 30;
	var left = (screen.width - width) / 2;

	// Open window popup
	objPopupWindow = window.open(url, strWindowName, 'width=' + width + ', height=' + height + ', top=' + top + ', left=' + left + ', menubar=no, toolbar=no, location=no, directories=no, status=no, menubar=no, resizable=yes, copyhistory=no, scrollbars = yes');
}

function fnRequestGlobeOptin(chargeAmount) {
	if (isEmpty(chargeAmount)) {
		return;
	}

	var url = GSMA_OAUTH_URL + GSMA_APP_ID + "?amount=" + chargeAmount;

	if (isEmpty(GSMA_OAUTH_URL) || isEmpty(GSMA_APP_ID)) {
		return;
	}

	fnPopupWindow(url);
}

function fnPad(number, length) {
	var str = '' + number;
	while (str.length < length) {
		str = '0' + str;
	}
	return str;
}

function fnFormatTime(time) {
	time = time / 10;
	var min = parseInt(time / 6000), sec = parseInt(time / 100) - (min * 60), hundredths = fnPad(time - (sec * 100) - (min * 6000), 2);
	return (min > 0 ? fnPad(min, 2) : "00") + ":" + fnPad(sec, 2) + ":" + hundredths;
}

function fnGetMessageList(array) {
	var messageList = [];

	for (var i = 0; i < array.length; i++) {
		var obj = array[i];
		var fieldName = obj.field_name;
		var validationMessage = obj.validation_message;
		var message = fnGetMessage(validationMessage, fieldName);

		if (messageList.indexOf(message) == -1) {
			messageList.push(message);
		}
	}
	return messageList;
}

function fnGetMessage(code, fieldName) {
	var message;
	var msg = fnGetCodeOne('ERROR_CODE', code);

	if (!isEmpty(msg)) {
		message = StringFormat(msg, [ fieldName ]);
	} else {
		message = isEmpty(fieldName) ? code : fieldName + ' : ' + code;
	}

	return message;
}

function fnCountryPhoneNo(phoneNo) {

	var startsWith = function(str, prefix) {
		return str.lastIndexOf(prefix, 0) === 0;
	}

	var endsWith = function(str, suffix) {
		return str.indexOf(suffix, str.length - suffix.length) !== -1;
	}

	var COUNTRY_CODE = "63";
	if (phoneNo.length == 0) {
		return phoneNo;
	}

	var sValid = "";
	for (var i = 0; i < phoneNo.length; ++i) {
		var c = phoneNo.charAt(i);
		if (c < '0' || c > '9')
			continue;
		sValid += c;
	}

	if (startsWith(sValid, COUNTRY_CODE)) {
		return sValid;
	}
	if (startsWith(sValid, "0")) {
		return COUNTRY_CODE + sValid.substring(1);
	}
	return COUNTRY_CODE + sValid;
}

function fnSmoothScroll($movingTarget) {
	if(isEmpty($movingTarget)) {
		return false;

	} else if ($movingTarget.length) {
		$('html, body').animate({
			scrollTop : $movingTarget.offset().top
		}, 1000);
		return false;
	}
}

function writeOnlyNumberChar(field){
	var checkStr = document.getElementById(field).value;
	var pattern = /[^\d]/g;

	if(pattern.test(checkStr)){
		var outStr = checkStr.replace(pattern,"");
		document.getElementById(field).value = outStr;
	}
}