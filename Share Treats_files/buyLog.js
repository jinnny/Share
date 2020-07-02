/*
*JavaScript Class
*BuyLog Class
*/

BuyLog = function(){
	this.sendType = null;
	this.userName = null;
	this.senderName = null;
	this.senderPhone = null;
	this.pgChannel = null;
	this.payMethod = null;
	this.couponCode = null;
	this.authToken = null;
}

//sendType
BuyLog.prototype.getSendType = function(){
	return this.sendType;
};
BuyLog.prototype.setSendType = function(sendType){
	this.sendType = sendType;
};

//userName
BuyLog.prototype.getUserName = function(){
	return this.userName;
};
BuyLog.prototype.setUserName = function(userName){
	this.userName = userName;
};

//senderName
BuyLog.prototype.getSenderName = function(){
	return this.senderName;
};
BuyLog.prototype.setSenderName = function(senderName){
	this.senderName = senderName;
};

//senderPhone
BuyLog.prototype.getSenderPhone = function(){
	return this.senderPhone;
};
BuyLog.prototype.setSenderPhone = function(senderPhone){
	this.senderPhone = senderPhone;
};

//pgChannel
BuyLog.prototype.getPgChannel = function(){
	return this.pgChannel;
};
BuyLog.prototype.setPgChannel = function(pgChannel){
	this.pgChannel = pgChannel;
};

//payMethod
BuyLog.prototype.getPayMethod = function(){
	return this.payMethod;
};
BuyLog.prototype.setPayMethod = function(payMethod){
	this.payMethod = payMethod;
};

//couponCode
BuyLog.prototype.getCouponCode = function(){
	return this.couponCode;
};
BuyLog.prototype.setCouponCode = function(couponCode){
	this.couponCode = couponCode;
};

//authToken
BuyLog.prototype.getAuthToken = function(){
	return this.authToken;
};
BuyLog.prototype.setAuthToken = function(authToken){
	this.authToken = authToken;
};

BuyLog.prototype.getObject = function(){
	var object = {
		'sendType' : this.sendType
		,'userName' : this.userName
		,'senderName' : this.senderName
		,'senderPhone' : this.senderPhone
		,'pgChannel' : this.pgChannel
		,'payMethod' : this.payMethod
		,'couponCode' : this.couponCode
		,'authToken' : this.authToken
	};
	return object;
};