package common

var TeamPrefix = "tc"
var TeamCodeLength = 30
var PhoneVerificationEnabled = true
var User2TeamStatus = map[string]int{
	"cleared": -1, // 清退
	"owner":   1,  // 团队所有者
	"member":  2,  // 正式成员
	"joining": 3,  // 加入中。。待审核
}

var SmsEnum = map[string]string{
	"LOGIN":           "login",
	"REGISTER":        "register",
	"FORGET_PASSWORD": "forget_password",
}
