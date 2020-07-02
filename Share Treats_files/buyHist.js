/*
*JavaScript Class
*BuyHist Class
*/

BuyHist = function(){

	this.redTelNo = null;
	this.resCustName = null;
	this.resCustPhoneNo = null;
	this.goodsDispSeq = null;
	this.goodsTotCnt = null;
	this.mmsSendMsg = null;
	this.resDate = null;
	this.resTime = null;
	this.stickerSeq = null;
}

BuyHist.prototype.getRedTelNo = function(){
	return this.redTelNo;
};
BuyHist.prototype.setRedTelNo = function(redTelNo){
	this.redTelNo = redTelNo;
};

BuyHist.prototype.getResCustName = function(){
	return this.resCustName;
};
BuyHist.prototype.setResCustName = function(resCustName){
	this.resCustName = resCustName;
};

BuyHist.prototype.getResCustPhoneNo = function(){
	return this.resCustPhoneNo;
};
BuyHist.prototype.setResCustPhoneNo = function(resCustPhoneNo){
	this.resCustPhoneNo = resCustPhoneNo;
};

BuyHist.prototype.getGoodsDispSeq = function(){
	return this.goodsDispSeq;
};
BuyHist.prototype.setGoodsDispSeq = function(goodsDispSeq){
	this.goodsDispSeq = goodsDispSeq;
};

BuyHist.prototype.getGoodsTotCnt = function(){
	return this.goodsTotCnt;
};
BuyHist.prototype.setGoodsTotCnt = function(goodsTotCnt){
	this.goodsTotCnt = goodsTotCnt;
};

BuyHist.prototype.getMmsSendMsg = function(){
	return this.mmsSendMsg;
};
BuyHist.prototype.setMmsSendMsg = function(mmsSendMsg){
	this.mmsSendMsg = mmsSendMsg;
};

BuyHist.prototype.getResDate = function(){
	return this.resDate;
};
BuyHist.prototype.setResDate = function(resDate){
	this.resDate = resDate;
};

BuyHist.prototype.getResTime = function(){
	return this.resTime;
};
BuyHist.prototype.setResTime = function(resTime){
	this.resTime = resTime;
};

BuyHist.prototype.getStickerSeq = function(){
	return this.stickerSeq;
};
BuyHist.prototype.setStickerSeq = function(stickerSeq){
	this.stickerSeq = stickerSeq;
};

BuyHist.prototype.getObject = function(){
	var object = {
		'redTelNo' : this.redTelNo
		,'resCustName' : this.resCustName
		,'resCustPhoneNo' : this.resCustPhoneNo
		,'goodsDispSeq' : this.goodsDispSeq
		,'goodsTotCnt' : this.goodsTotCnt
		,'mmsSendMsg' : this.mmsSendMsg
		,'resDate' : this.resDate
		,'resTime' : this.resTime
		,'stickerSeq' : this.stickerSeq
	};
	return object;
};