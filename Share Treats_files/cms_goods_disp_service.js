/**
 * cms_goods_disp_service.js
 */
var cms_goods_disp_service = {
	version : "",
	_default_params : {
		pageIndex : 1,
		pageUnit : 8
	}

	// [list] ////////////////////////////////////////////////////////
	,
	_cms_goods_disp_list_template : [],
	_fn_todo_before_render_in_list : [],
	_fn_todo_after_render_in_list : []

	,
	setTodoBeforeRenderInList : function(fnTodo) {
		var that = this;
		that._fn_todo_before_render_in_list.push(fnTodo);
	},
	exeTodoBeforeRenderInList : function(data, index) {
		var that = this;

		var cmsStickerInfoListDefault = data["cmsStickerInfoListDefault"];

		for(var i=0 ; i < cmsStickerInfoListDefault.length ; i++) {
			var cmsStickerInfo = cmsStickerInfoListDefault[i];

			var arrFields = ["stickerUrl"];
			fnChangeNasToCDN(arrFields, cmsStickerInfo);
		}

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

		if (isEmpty(uri)) {
			uri = "/cms_goods_disp/list/json";
		}

		if (isEmpty(that._default_params["lastPageNo"]) && that._default_params["pageIndex"] > 1) {
			return;
		}

		if (that._default_params["lastPageNo"]) {
			var pageIndex = that._default_params["pageIndex"] * 1;
			var lastPageNo = that._default_params["lastPageNo"] * 1;

			if (pageIndex > lastPageNo) {
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

		that.list({
			pageIndex : currentPageIndex + 1
		}, node_name, $target_template, true, uri);
	},
	renderInList : function(jsonData, node_name, $target_template, is_append) {

		var that = this;
		var cms_goods_disp_list = {};
		if (isEmpty(node_name)) {
			node_name = "cms_goods_disp_list";
		}

		if (jsonData && jsonData.result_code == "200") {
			cms_goods_disp_list = jsonData;

			var list = jsonData[node_name];
			if (jsonData["paginationInfo"]) {
				that._default_params["lastPageNo"] = jsonData["paginationInfo"].lastPageNo;
			}

			if (list && Array.isArray(list)) {
				for (var j = 0; j < list.length; j++) {
					var cms_goods_disp = list[j];
					var goods_name = cms_goods_disp['goodsName'];

					if(!isEmpty(goods_name)){
						cms_goods_disp['trimGoodsName'] = goods_name.replace(/(\s*)/g, '');
					}

					// Set the normal variable to display in list if saleAmount is different from normalAmount
					var normal = cms_goods_disp['normalAmount'];
					var sale = cms_goods_disp['saleAmount'];

					if (normal > sale) {
						cms_goods_disp['normal'] = 'Php ' + normal;
					}

					var remainPin = cms_goods_disp['remainPin'];

					var hotdeal = cms_goods_disp['hotdeal'];
					var purchasingCount = cms_goods_disp['purchasingCount'];

					if(remainPin <= 0){
						cms_goods_disp['soldOut'] = true;
					}else if(hotdeal == 'Y' && purchasingCount > 0){
						cms_goods_disp['availed'] = true;
					}

					// [Step-10] : To do action BEFORE displaying the template
					that.exeTodoBeforeRenderInList(cms_goods_disp, j);
				}
			}
		}

		var $cms_goods_disp_list = $('script[id=' + node_name + ']');

		if ($target_template) {
			$cms_goods_disp_list = $target_template;
		}

		for (var i = 0; i < $cms_goods_disp_list.length; i++) {
			var $target = $cms_goods_disp_list.eq(i);

			if (!that._cms_goods_disp_list_template[i]) {
				that._cms_goods_disp_list_template.push($target.html());
			}
			fnRender(that._cms_goods_disp_list_template[i], $target, cms_goods_disp_list, is_append);
		}

		// [Step-20] : To do action AFTER displaying the template
		that.exeTodoAfterRenderInList(cms_goods_disp_list);
	}
};
