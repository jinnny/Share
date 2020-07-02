/**
 * atome_shopping_installments_service.js
 */
var atome_shopping_installments_service = {
	version : "",
	_default_params : {
		pageIndex : 1,
		pageSize : -1
	}

	// [list] ////////////////////////////////////////////////////////
	,
	_atome_shopping_installments_list_template : [],
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
			uri = "/atome/shopping_installments";
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
		var atome_shopping_installments_list = {};
		if(isEmpty(node_name)) {
			node_name = "atome_shopping_installments_list";
		}

		if (jsonData && jsonData.result_code == "200") {
			atome_shopping_installments_list = jsonData.data;

			var list = jsonData[node_name];
			if(jsonData["paginationInfo"]) {
				that._default_params["lastPageNo"] = jsonData["paginationInfo"].lastPageNo;
			}

			if (list && Array.isArray(list)) {
				for (var j = 0; j < list.length; j++) {
					var atome_shopping_installments = list[j];

					// [Step-10] : To do action BEFORE displaying the template
					that.exeTodoBeforeRenderInList(atome_shopping_installments, j);
				}
			}
		}

		var $atome_shopping_installments_list = $('script[id=' + node_name + ']');

		if ($target_template) {
			$atome_shopping_installments_list = $target_template;
		}

		for (var i = 0; i < $atome_shopping_installments_list.length; i++) {
			var $target = $atome_shopping_installments_list.eq(i);

			if (!that._atome_shopping_installments_list_template[i]) {
				that._atome_shopping_installments_list_template.push($target.html());
			}
			fnRender(that._atome_shopping_installments_list_template[i], $target, atome_shopping_installments_list, is_append);
		}

		// [Step-20] : To do action AFTER displaying the template
		that.exeTodoAfterRenderInList(atome_shopping_installments_list);
	}
};
