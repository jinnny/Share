/**
 * b2c_user_extern_service.js
 */
var b2c_user_extern_service = {
	version : "",
	_default_params : {
		pageIndex : 1,
		pageUnit : 20
	}

	// [list] ////////////////////////////////////////////////////////
	,
	_b2c_user_extern_list_template : [],
	_fn_todo_before_render_in_list : [],
	_fn_todo_after_render_in_list : []

	,
	setTodoBeforeRenderInList : function(fnTodo) {
		var that = this;
		that._fn_todo_before_render_in_list.push(fnTodo);
	},
	exeTodoBeforeRenderInList : function(data, index) {
		var that = this;
		var fnQueue = that._fn_todo_before_render_in_list;

		if (Array.isArray(fnQueue)) {
			for (var i = 0; i < fnQueue.length; i++) {
				var fnEntity = fnQueue[i];

				if (typeof (fnEntity) == "function") {
					fnEntity(data, index);
				}
			}
		}
	},
	setTodoAfterRenderInList : function(fnTodo) {
		var that = this;
		that._fn_todo_after_render_in_list.push(fnTodo);
	},
	exeTodoAfterRenderInList : function(list) {
		var that = this;
		var fnQueue = that._fn_todo_after_render_in_list;

		if (Array.isArray(fnQueue)) {
			for (var i = 0; i < fnQueue.length; i++) {
				var fnEntity = fnQueue[i];

				if (typeof (fnEntity) == "function") {
					fnEntity(list);
				}
			}
		}
	}

	,
	list : function(params, node_name, $target_template, is_append, uri) {
		var that = this;
		$.extend(that._default_params, params);

		if(isEmpty(uri)) {
			uri = "/b2c_user_extern/list/json";
		}

		if(isEmpty(that._default_params["lastPageNo"]) && that._default_params["pageIndex"] > 1) {
			return;
		}

		if(that._default_params["lastPageNo"]) {
			var pageIndex = that._default_params["pageIndex"] * 1;
			var lastPageNo = that._default_params["lastPageNo"] * 1;

			if(pageIndex > lastPageNo) {
				return;
			}
		}

		fnDoTransaction(uri, that._default_params, function(jsonData) {
			that.renderInList(jsonData, node_name, $target_template, is_append);
		});
	},
	more : function(uri, node_name, $target_template) {
		var that = this;
		var currentPageIndex = that._default_params.pageIndex;

		that.list({pageIndex:currentPageIndex+1}, node_name, $target_template, true, uri);
	},
	renderInList : function(jsonData, node_name, $target_template, is_append) {

		var that = this;
		var b2c_user_extern_list = {};
		if(isEmpty(node_name)) {
			node_name = "b2c_user_extern_list";
		}

		if (jsonData && jsonData.result_code == "200") {
			b2c_user_extern_list = jsonData;

			var list = jsonData[node_name];
			if(jsonData["paginationInfo"]) {
				that._default_params["lastPageNo"] = jsonData["paginationInfo"].lastPageNo;
			}

			if (list && Array.isArray(list)) {
				for (var j = 0; j < list.length; j++) {
					var b2c_user_extern = list[j];

					// [Step-10] : To do action BEFORE displaying the template
					that.exeTodoBeforeRenderInList(b2c_user_extern, j);
				}
			}
		}

		var $b2c_user_extern_list = $('script[id=' + node_name + ']');

		if ($target_template) {
			$b2c_user_extern_list = $target_template;
		}

		for (var i = 0; i < $b2c_user_extern_list.length; i++) {
			var $target = $b2c_user_extern_list.eq(i);

			if (!that._b2c_user_extern_list_template[i]) {
				that._b2c_user_extern_list_template.push($target.html());
			}
			fnRender(that._b2c_user_extern_list_template[i], $target, b2c_user_extern_list, is_append);
		}

		// [Step-20] : To do action AFTER displaying the template
		that.exeTodoAfterRenderInList(b2c_user_extern_list);
	}

	// [save] ////////////////////////////////////////////////////////
	,
	save : function(objData, isModified, uri, callback_success, callback_fail) {
		var that = this;

		if(isEmpty(uri)){
			return;
		}

		fnDoTransaction(uri, objData, function(jsonData) {
			if (jsonData && typeof (jsonData) == "object") {
				if (jsonData.result_code == "200") {
					// succeed to save
					if (typeof (callback_success) == "function") {
						callback_success(jsonData);
					}

					//that.renderInSave(jsonData, callback_success);
				} else if (jsonData.result_code == "400") {

					var listMap = jsonData.result_msg;

					var messageList;
					if (Array.isArray(listMap)) {
						messageList = fnGetMessageList(listMap);

						var message = '';
						if (Array.isArray(messageList)) {
							if (messageList.length > 0) {
								message = messageList[0];
							}
						}
						jsonData.result_msg = message;
					}

					// validation error
					var strMessage = (jsonData.result_msg ? jsonData.result_msg : "Fail to save data. Please retry again after a while.");
					var strTitle = "Validation Error";
					fnAlert(function() {
						if (typeof (callback_fail) == "function") {
							callback_fail(jsonData);
						}
					}, strMessage, strTitle, null, "type-danger", true);

				} else {

					if (typeof (callback_fail) == "function") {
						callback_fail(jsonData);
					} else {
						// fail to save
						var strMessage = (jsonData.result_msg ? jsonData.result_msg : "Fail to save data. Please retry again after a while.");
						var strTitle = "Fail to save";
						fnAlert(null, strMessage, strTitle, null, "type-danger", true);
					}
				}
			}
		});
	},
	renderInSave : function(jsonData, callback_success) {
		var that = this;
		var strMessage = "It is saved successfully.";
		var strTitle = "Succeed to save";
		var callback_ok = {
			fnc : function() {
				if (typeof (callback_success) == "function") {
					callback_success();
				}
			}
		};
		fnAlert(callback_ok, strMessage, strTitle, null, "type-primary", true);
	}
};
